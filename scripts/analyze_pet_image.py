"""
JSON CLI for website integration.

Usage (called by Node):
  python scripts/analyze_pet_image.py --image path/to/pet.jpg
  python scripts/analyze_pet_image.py --stdin-b64
  python scripts/analyze_pet_image.py --punctuate   # reads plain text from stdin
"""

from __future__ import annotations

import argparse
import base64
import json
import mimetypes
import os
import re
import sys
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / "server" / ".env")
load_dotenv(ROOT / ".env")

DEFAULT_MODEL = os.getenv("XAI_VISION_MODEL", "grok-4.5")


def emit(payload: dict, code: int = 0) -> None:
    sys.stdout.write(json.dumps(payload, ensure_ascii=False))
    sys.stdout.flush()
    raise SystemExit(code)


def get_client() -> OpenAI:
    api_key = os.getenv("XAI_API_KEY")
    if not api_key:
        emit({"error": "XAI_API_KEY is missing in server/.env"}, 1)
    return OpenAI(api_key=api_key, base_url="https://api.x.ai/v1")


def load_species_data() -> list:
    candidates = [
        ROOT / "client" / "public" / "data" / "species.json",
        ROOT / "server" / "data" / "species.json",
    ]
    for path in candidates:
        try:
            if path.exists():
                return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            continue
    return []


def build_pet_prompt(species_data: list) -> str:
    lines = []
    for item in species_data:
        species = item.get("species", "")
        breeds = item.get("breeds") or []
        lines.append(f'{species}: {", ".join(breeds)}')
    breed_block = "\n".join(lines) if lines else "Pies: Husky syberyjski, Kundel / mieszaniec\nKot: Mixed Breed"

    return f"""
You are an expert pet breed identifier for a Polish adoption site.
Analyze the photo carefully (ears, snout, coat, body, eyes, markings).

Return ONLY valid JSON (no markdown):
{{
  "species": "Pies" or "Kot" or "",
  "breed": "EXACT string from the allowed list below",
  "breed_candidates": ["up to 3 exact allowed breed names, best first"],
  "gender": "Male" or "Female" or "",
  "size": "Small" or "Medium" or "Large" or "Extra Large" or "",
  "description": "2-4 warm Polish sentences for an adoption bio, no pet name"
}}

ALLOWED SPECIES + BREEDS (breed MUST be copied exactly from this list):
{breed_block}

Hard rules:
- Prefer a specific breed when visual traits match (e.g. Siberian Husky features => "Husky syberyjski").
- Use "Kundel / mieszaniec" or "Mixed Breed" ONLY when the animal clearly looks mixed or you truly cannot identify a breed.
- Never invent breed names outside the list.
- If unsure between specific breeds, pick the closest specific breed, not mixed.
- Do not invent a pet name in description.
""".strip()


def file_to_data_url(path: Path) -> str:
    mime, _ = mimetypes.guess_type(path.name)
    if mime not in {"image/jpeg", "image/png"}:
        mime = "image/jpeg"
    b64 = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{b64}"


def extract_text(response) -> str:
    if getattr(response, "output_text", None):
        return response.output_text
    chunks = []
    for item in getattr(response, "output", []) or []:
        for content in getattr(item, "content", []) or []:
            text = getattr(content, "text", None)
            if text:
                chunks.append(text)
    return "\n".join(chunks).strip()


def parse_json_text(text: str) -> dict:
    cleaned = (text or "").strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return json.loads(cleaned)


def analyze(image_url: str, model: str) -> dict:
    species_data = load_species_data()
    client = get_client()
    response = client.responses.create(
        model=model,
        input=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_image",
                        "image_url": image_url,
                        "detail": "high",
                    },
                    {
                        "type": "input_text",
                        "text": build_pet_prompt(species_data),
                    },
                ],
            }
        ],
    )
    data = parse_json_text(extract_text(response))
    candidates = data.get("breed_candidates") or []
    if not isinstance(candidates, list):
        candidates = []
    return {
        "species": data.get("species") or "",
        "breed": data.get("breed") or "",
        "breed_candidates": [str(c) for c in candidates if c],
        "gender": data.get("gender") or "",
        "size": data.get("size") or "",
        "description": data.get("description") or "",
    }


def punctuate_text(text: str, lang: str, model: str) -> dict:
    text = (text or "").strip()
    if not text:
        return {"text": ""}

    prompt = f"""
You clean raw speech-to-text into natural written sentences.
Language may be Polish, English, or mixed.

Requirements:
- Add proper punctuation: periods, commas, question marks, exclamation marks
- Split into short clear sentences
- Capitalize sentence starts
- Keep the speaker's words and language mix — DO NOT translate
- Light grammar fixes only when needed for readability
- Do NOT invent new facts
- Return ONLY the corrected text (no quotes, no markdown)

Bad:
Okres i desant Bike i is very Trendy Booking You Can I tylko with you Willy boki decym bite is very dog is very friendly What the fuck are you write in this in english in Polish czy coś się

Good:
Okres i desant Bike i is very trendy. Booking? You can. I tylko with you. Willy boki decym bite is very dog, is very friendly. What the fuck are you writing? Is this in English, in Polish, czy coś się?

Transcript:
{text}
""".strip()

    client = get_client()
    response = client.responses.create(
        model=model,
        input=[
            {
                "role": "user",
                "content": [
                    {"type": "input_text", "text": prompt},
                ],
            }
        ],
    )
    fixed = extract_text(response).strip()
    if (fixed.startswith('"') and fixed.endswith('"')) or (
        fixed.startswith("'") and fixed.endswith("'")
    ):
        fixed = fixed[1:-1].strip()
    return {"text": fixed or text}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", help="Path to jpg/png")
    parser.add_argument("--stdin-b64", action="store_true")
    parser.add_argument("--punctuate", action="store_true", help="Punctuate stdin text")
    parser.add_argument("--lang", default="pl-PL")
    parser.add_argument("--mime", default="image/jpeg")
    parser.add_argument("--model", default=DEFAULT_MODEL)
    args = parser.parse_args()

    try:
        if args.punctuate:
            raw = sys.stdin.read()
            emit(punctuate_text(raw, args.lang, args.model), 0)

        if args.stdin_b64:
            raw = sys.stdin.read().strip()
            if not raw:
                emit({"error": "Empty stdin image data"}, 1)
            if raw.startswith("data:"):
                image_url = raw
            else:
                image_url = f"data:{args.mime};base64,{raw}"
        elif args.image:
            path = Path(args.image).expanduser().resolve()
            if not path.exists():
                emit({"error": f"File not found: {path}"}, 1)
            image_url = file_to_data_url(path)
        else:
            emit({"error": "Provide --image, --stdin-b64, or --punctuate"}, 1)

        result = analyze(image_url, args.model)
        emit(result, 0)
    except SystemExit:
        raise
    except Exception as exc:
        emit({"error": str(exc)}, 1)


if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass
    main()
