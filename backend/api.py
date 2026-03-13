#!/usr/bin/env python3
"""
gaeilge.quest — Flask backend
Serves the static site and provides /api/ask endpoint backed by Claude.
"""

import os
import json
import logging
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory, render_template
import anthropic

# ── Config ────────────────────────────────────────────────────────────────────

ROOT = Path(__file__).parent.parent
STATIC_DIR = ROOT / "static"
TEMPLATE_DIR = ROOT / "templates"
DATA_DIR = ROOT / "data"

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
MODEL = "claude-opus-4-6"

SYSTEM_PROMPT = """You are a knowledgeable and concise Irish (Gaeilge) language tutor.
Answer questions about Irish grammar clearly and accurately.
Use the standard written form (Caighdeán Oifigiúil) by default, but note dialectal
differences when they are significant.
When giving examples, format them as: Irish sentence — English translation.
Keep answers focused and practical. Aim for 150-300 words unless the question requires more detail.
Do not use markdown headers or bullet points — write in clear prose with examples inline."""

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

# ── App ───────────────────────────────────────────────────────────────────────

app = Flask(__name__, static_folder=str(STATIC_DIR), template_folder=str(TEMPLATE_DIR))
client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None

def load_constructions():
    with open(DATA_DIR / "constructions.json") as f:
        return json.load(f)

def load_verbs():
    with open(DATA_DIR / "verbs.json") as f:
        return json.load(f)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    constructions = load_constructions()
    return render_template("index.html", constructions_json=json.dumps(constructions))


@app.route("/verbs")
def verbs():
    verbs_data = load_verbs()
    return render_template("verbs.html", verbs_json=json.dumps(verbs_data))


@app.route("/static/<path:filename>")
def static_files(filename):
    return send_from_directory(STATIC_DIR, filename)


@app.route("/data/constructions.json")
def constructions_data():
    return send_file(DATA_DIR / "constructions.json", mimetype="application/json")


@app.route("/api/ask", methods=["POST"])
def ask():
    if not client:
        return jsonify({"error": "AI answering is not configured on this server."}), 503

    data = request.get_json(silent=True) or {}
    question = (data.get("question") or "").strip()

    if not question:
        return jsonify({"error": "No question provided."}), 400

    if len(question) > 500:
        return jsonify({"error": "Question too long (max 500 characters)."}), 400

    log.info("Ask: %s", question[:100])

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": question}],
        )
        answer = next(
            (block.text for block in response.content if block.type == "text"),
            "No answer returned.",
        )
        return jsonify({"answer": answer})

    except anthropic.RateLimitError:
        log.warning("Rate limited by Anthropic API")
        return jsonify({"error": "Too many requests — please try again in a moment."}), 429
    except anthropic.AuthenticationError:
        log.error("Anthropic authentication failed")
        return jsonify({"error": "AI service authentication error."}), 500
    except Exception as exc:
        log.exception("Unexpected error in /api/ask: %s", exc)
        return jsonify({"error": "Something went wrong. Please try again."}), 500


@app.route("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "ai_configured": client is not None,
    })


# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    if not ANTHROPIC_API_KEY:
        log.warning("ANTHROPIC_API_KEY not set — /api/ask will return 503")
    app.run(host="0.0.0.0", port=port, debug=debug)
