"""Shared utilities for MeetAssist TN agents."""

import json


def parse_json(content: str, fallback: list) -> list:
    """Parse a JSON list from an LLM response.

    Handles responses that wrap JSON in markdown code fences (```json ... ```).
    Returns *fallback* on any parse error.
    """
    try:
        text = content.strip()
        if text.startswith("```"):
            # Strip opening fence + optional language tag
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except (json.JSONDecodeError, AttributeError, IndexError) as e:
        print(f"[utils] JSON parse error: {e}")
        return fallback
