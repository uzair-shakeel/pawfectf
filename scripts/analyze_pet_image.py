"""
JSON CLI for website integration.

Usage (called by Node):
  python scripts/analyze_pet_image.py --image path/to/pet.jpg
  python scripts/analyze_pet_image.py --stdin-b64   # reads raw base64 from stdin

Prints a single JSON object to stdout on success.
Prints {"error": "..."} to stdout and exits non-zero on failure.
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

PET_PROMPT = """
Analyze this pet photo for an adoption listing in Poland.
Return ONLY valid JSON (no markdown) with this shape:
{
  "species": "Pies" or "Kot" or "",
  "breed": "best guess breed or mixed",
  "gender": "Male" or "Female" or "",
  "size": "Small" or "Medium" or "Large" or "Extra Large" or "",
  "description": "2-4 warm Polish sentences for an adoption bio, no pet name"
}
Be factual from what is visible.
""".strip()


def emit(payload: dict, code: int = 0) -> None:
    sys.stdout.write(json.dumps(payload, ensure_ascii=False))
    sys.stdout.flush()
    raise SystemExit(code)


def get_client() -> OpenAI:
    api_key = os.getenv("XAI_API_KEY")
    if not api_key:
        emit({"error": "XAI_API_KEY is missing in server/.env"}, 1)
    return OpenAI(api_key=api_key, base_url="https://api.x.ai/v1")


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
                        "text": PET_PROMPT,
                    },
                ],
            }
        ],
    )
    data = parse_json_text(extract_text(response))
    return {
        "species": data.get("species") or "",
        "breed": data.get("breed") or "",
        "gender": data.get("gender") or "",
        "size": data.get("size") or "",
        "description": data.get("description") or "",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", help="Path to jpg/png")
    parser.add_argument(
        "--stdin-b64",
        action="store_true",
        help="Read raw base64 (or data URL) from stdin",
    )
    parser.add_argument("--mime", default="image/jpeg")
    parser.add_argument("--model", default=DEFAULT_MODEL)
    args = parser.parse_args()

    try:
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
            emit({"error": "Provide --image or --stdin-b64"}, 1)

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
