"""
Test Grok (xAI) image recognition locally.

Usage:
  1) pip install openai python-dotenv
  2) Set XAI_API_KEY in server/.env (or export it)
  3) python scripts/test_grok_vision.py path/to/pet.jpg
     python scripts/test_grok_vision.py   # uses a public sample image

What it checks:
  - API key works
  - Model accepts images (Responses API + input_image)
  - Pet JSON extraction (species / breed / description)
"""

from __future__ import annotations

import argparse
import base64
import json
import mimetypes
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / "server" / ".env")
load_dotenv(ROOT / ".env")

DEFAULT_MODEL = os.getenv("XAI_VISION_MODEL", "grok-4.5")
SAMPLE_IMAGE_URL = (
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb"
    "?auto=format&fit=crop&w=800&q=80"
)

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


def get_client() -> OpenAI:
    api_key = os.getenv("XAI_API_KEY")
    if not api_key:
        print("ERROR: XAI_API_KEY is missing. Add it to server/.env")
        sys.exit(1)
    return OpenAI(api_key=api_key, base_url="https://api.x.ai/v1")


def file_to_data_url(path: Path) -> str:
    mime, _ = mimetypes.guess_type(path.name)
    if mime not in {"image/jpeg", "image/png"}:
        # xAI docs: jpg/jpeg or png only
        print(f"WARNING: mime={mime}. xAI prefers jpg/png. Continuing anyway...")
        mime = mime or "image/jpeg"
    b64 = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{b64}"


def extract_text(response) -> str:
    # Responses API shape varies slightly by SDK version
    if getattr(response, "output_text", None):
        return response.output_text

    chunks = []
    for item in getattr(response, "output", []) or []:
        for content in getattr(item, "content", []) or []:
            text = getattr(content, "text", None)
            if text:
                chunks.append(text)
    return "\n".join(chunks).strip()


def analyze_image(client: OpenAI, image_url: str, model: str) -> str:
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
    return extract_text(response)


def main() -> None:
    parser = argparse.ArgumentParser(description="Test Grok image recognition")
    parser.add_argument(
        "image",
        nargs="?",
        help="Local image path (jpg/png). If omitted, uses a sample dog photo URL.",
    )
    parser.add_argument("--model", default=DEFAULT_MODEL, help="xAI model id")
    args = parser.parse_args()

    client = get_client()
    print(f"Model: {args.model}")
    print("Calling xAI Responses API (image understanding)...")

    if args.image:
        path = Path(args.image).expanduser().resolve()
        if not path.exists():
            print(f"ERROR: file not found: {path}")
            sys.exit(1)
        print(f"Image: {path}")
        image_url = file_to_data_url(path)
    else:
        print(f"Image: sample URL\n  {SAMPLE_IMAGE_URL}")
        image_url = SAMPLE_IMAGE_URL

    try:
        text = analyze_image(client, image_url, args.model)
    except Exception as exc:
        print("\nFAILED")
        print(exc)
        sys.exit(1)

    print("\nRAW RESPONSE:")
    print(text or "(empty)")

    # Try parse JSON for a clear pass/fail on our pet fields
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].strip()

    try:
        data = json.loads(cleaned)
        print("\nPARSED JSON:")
        print(json.dumps(data, ensure_ascii=False, indent=2))
        print("\nSUCCESS — image recognition works.")
    except json.JSONDecodeError:
        print("\nPARTIAL — API answered, but response was not valid JSON.")
        print("Image recognition itself is working; prompt/parsing may need tweaks.")


if __name__ == "__main__":
    # Windows consoles often default to cp1252; force UTF-8 for Polish output
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass
    main()
