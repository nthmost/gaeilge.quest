#!/usr/bin/env python3
"""
gaeilge.quest — Flask backend
Serves the static site and provides /api/ask endpoint backed by Claude.
"""

import os
import json
import logging
from pathlib import Path

from flask import Flask, Response, jsonify, request, send_from_directory, render_template, stream_with_context
import anthropic
import joblib
from scipy import sparse
from sklearn.metrics.pairwise import cosine_similarity

# ── Config ────────────────────────────────────────────────────────────────────

ROOT = Path(__file__).parent.parent
STATIC_DIR = ROOT / "static"
TEMPLATE_DIR = ROOT / "templates"
DATA_DIR = ROOT / "data"
INDEX_DIR = DATA_DIR / "sources_index"

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
MODEL = "claude-haiku-4-5-20251001"

RAG_TOP_K = 5
RAG_MIN_SCORE = 0.08

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

# ── Data loaders ──────────────────────────────────────────────────────────────

def load_constructions():
    with open(DATA_DIR / "constructions.json") as f:
        return json.load(f)

def load_verbs():
    with open(DATA_DIR / "verbs.json") as f:
        return json.load(f)

def load_preps():
    with open(DATA_DIR / "preps.json") as f:
        return json.load(f)

def load_sources():
    with open(DATA_DIR / "sources.json") as f:
        return json.load(f)

# ── RAG retrieval over primary-source texts ──────────────────────────────────
# Index built offline by tools/build_index.py (TF-IDF over chunked page text
# from the public-domain PDFs listed in data/sources.json).

_RAG = None  # lazily loaded: {"vectorizer", "matrix", "chunks"}

def load_rag_index():
    global _RAG
    if _RAG is not None:
        return _RAG
    try:
        vectorizer = joblib.load(INDEX_DIR / "tfidf.joblib")
        matrix = sparse.load_npz(INDEX_DIR / "matrix.npz")
        chunks = json.loads((INDEX_DIR / "chunks.json").read_text())
        _RAG = {"vectorizer": vectorizer, "matrix": matrix, "chunks": chunks}
        log.info("Loaded RAG index: %d chunks", len(chunks))
    except Exception:
        log.exception("Could not load RAG index — primary-source retrieval disabled")
        _RAG = {"vectorizer": None, "matrix": None, "chunks": []}
    return _RAG


def retrieve_passages(question, top_k=RAG_TOP_K):
    rag = load_rag_index()
    if rag["vectorizer"] is None or not rag["chunks"]:
        return []

    query_vec = rag["vectorizer"].transform([question])
    scores = cosine_similarity(query_vec, rag["matrix"])[0]
    ranked = scores.argsort()[::-1][:top_k]

    passages = []
    for idx in ranked:
        if scores[idx] < RAG_MIN_SCORE:
            continue
        chunk = rag["chunks"][idx]
        passages.append({**chunk, "score": float(scores[idx])})
    return passages

# ── System prompt (built once at startup) ────────────────────────────────────

def build_system_prompt():
    try:
        constructions = load_constructions()
        grammar_cards = [c for c in constructions if c.get('category') != 'literature']
        lit_cards     = [c for c in constructions if c.get('category') == 'literature']

        grammar_lines = "\n".join(
            f"- [{c.get('difficulty','')}] {c['title']} ({c.get('category','')})"
            for c in grammar_cards
        )
        lit_lines = "\n".join(
            f"- {c['title']} — {c.get('summary','')}"
            for c in lit_cards
        )
    except Exception:
        grammar_lines = "(unavailable)"
        lit_lines     = "(unavailable)"

    try:
        sources = load_sources()
        source_lines = "\n".join(
            f"- *{s['title']}* ({s['author']}, {s['year']}) — {s.get('topic', '')}"
            for s in sources
        )
    except Exception:
        source_lines = "(unavailable)"

    return f"""You are a knowledgeable Irish (Gaeilge) grammar tutor for the site gaeilge.quest.

The user has already searched the site's reference cards and found no direct match, so you are filling a gap. Be aware of what the site already covers so you can complement rather than duplicate it.

## Grammar reference cards on this site
The user has NOT found a match among these — your answer covers something beyond them:
{grammar_lines}

## Primary source texts available on this site
These are canonical Irish-language texts with cards on the site. If the user's question is relevant to any of them — style, usage, dialect, historical form — mention the connection:
{lit_lines}

## Linguistic reference works (listed on the site's Sources tab)
Public-domain grammars and dictionaries of Irish and Celtic:
{source_lines}

For each question, relevant passages retrieved from these works (if any) are
appended below as "## Retrieved passages". These are real excerpts, OCR'd
from page scans of the works above — OCR errors (odd spacing, misread
diacritics) may appear; use your judgment to read through them. When a
retrieved passage genuinely supports or informs your answer, say so and name
the source and page, e.g. "(Thurneysen, *Handbuch des Alt-Irischen*, p. 312)".
Don't force a citation if the passages aren't actually relevant — these are
19th/early-20th-century historical and comparative grammars, so they often
speak to Old Irish or cross-Celtic forms rather than the modern standard;
note that distinction when it matters. Never fabricate a citation to a
source or page you weren't given.

## How to answer

**Dialect differences — always address these.** Even if the question doesn't ask about dialects, include a brief note on how Munster, Connacht, and Ulster Irish handle the point differently, if they do. Mark it clearly (e.g. "**Dialect note:**"). If the three dialects agree, say so briefly.

**Primary sources — check for relevance.** If the question touches on a construction, form, or usage that appears prominently in one of the primary source texts above, say so. E.g. "This construction is frequent in *Peig* and *An tOileánach*, where the synthetic verb forms are used throughout."

**Format your response with markdown:**
- **Bold** for grammar labels and key Irish terms
- *Italics* for Irish words and phrases inline
- Numbered or bulleted lists for paradigms and rule sets
- Blank lines between paragraphs

**Examples** in the form: *Irish sentence* — English translation

Use the Caighdeán Oifigiúil as the base form. Aim for 200–400 words. Be practical and learner-focused."""

# Cache at module load — rebuilt on process restart when data changes
_SYSTEM_PROMPT = None

def get_system_prompt():
    global _SYSTEM_PROMPT
    if _SYSTEM_PROMPT is None:
        _SYSTEM_PROMPT = build_system_prompt()
    return _SYSTEM_PROMPT

# Response cache — keyed by normalised question, capped at 256 entries (FIFO)
_RESPONSE_CACHE: dict[str, str] = {}
_CACHE_MAX = 256

def cache_key(question: str) -> str:
    return question.lower().strip()

def cache_get(question: str) -> str | None:
    return _RESPONSE_CACHE.get(cache_key(question))

def cache_set(question: str, answer: str) -> None:
    key = cache_key(question)
    if key in _RESPONSE_CACHE:
        return
    if len(_RESPONSE_CACHE) >= _CACHE_MAX:
        # drop oldest entry
        _RESPONSE_CACHE.pop(next(iter(_RESPONSE_CACHE)))
    _RESPONSE_CACHE[key] = answer

# ── App ───────────────────────────────────────────────────────────────────────

app = Flask(__name__, static_folder=str(STATIC_DIR), template_folder=str(TEMPLATE_DIR))
client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None

# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    constructions = load_constructions()
    return render_template("index.html", constructions_json=json.dumps(constructions))


@app.route("/verbs")
def verbs():
    verbs_data = load_verbs()
    return render_template("verbs.html", verbs_json=json.dumps(verbs_data))


@app.route("/preps")
def preps():
    preps_data = load_preps()
    return render_template("preps.html", preps_json=json.dumps(preps_data))


@app.route("/sources")
def sources():
    return render_template("sources.html", sources=load_sources())


@app.route("/static/<path:filename>")
def static_files(filename):
    return send_from_directory(STATIC_DIR, filename)


@app.route("/data/constructions.json")
def constructions_data():
    return send_from_directory(DATA_DIR, "constructions.json", mimetype="application/json")


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

    # Serve from cache if available (replay as a single chunk + DONE)
    cached = cache_get(question)
    if cached:
        log.info("Cache hit for: %s", question[:60])
        def replay():
            yield f"data: {json.dumps({'text': cached})}\n\n"
            yield "data: [DONE]\n\n"
        return Response(
            replay(),
            mimetype="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )

    passages = retrieve_passages(question)
    if passages:
        log.info("Retrieved %d passage(s) for: %s", len(passages), question[:60])
        passages_block = "\n\n".join(
            f'[{i+1}] {p["title"]} ({p["author"]}), p.{p["page"]}:\n"{p["text"]}"'
            for i, p in enumerate(passages)
        )
        system_prompt = f"{get_system_prompt()}\n\n## Retrieved passages\n{passages_block}"
    else:
        system_prompt = get_system_prompt()

    def generate():
        full_text = []
        try:
            with client.messages.stream(
                model=MODEL,
                max_tokens=1024,
                system=system_prompt,
                messages=[{"role": "user", "content": question}],
            ) as stream:
                for text in stream.text_stream:
                    full_text.append(text)
                    yield f"data: {json.dumps({'text': text})}\n\n"
            cache_set(question, "".join(full_text))
            yield "data: [DONE]\n\n"
        except anthropic.RateLimitError:
            yield f"data: {json.dumps({'error': 'Too many requests — please try again in a moment.'})}\n\n"
        except anthropic.AuthenticationError:
            yield f"data: {json.dumps({'error': 'AI service authentication error.'})}\n\n"
        except Exception as exc:
            log.exception("Stream error: %s", exc)
            yield f"data: {json.dumps({'error': 'Something went wrong. Please try again.'})}\n\n"

    return Response(
        stream_with_context(generate()),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.route("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "ai_configured": client is not None,
        "model": MODEL,
    })


# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    if not ANTHROPIC_API_KEY:
        log.warning("ANTHROPIC_API_KEY not set — /api/ask will return 503")
    app.run(host="0.0.0.0", port=port, debug=debug)
