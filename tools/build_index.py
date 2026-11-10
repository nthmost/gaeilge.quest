#!/usr/bin/env python3
"""
Build the TF-IDF retrieval index for the primary-source RAG pipeline.

Reads PDFs from sources_pdfs/ (git-ignored — see data/sources.json for
where each one came from) and writes:
  data/sources_index/chunks.json      chunk text + citation metadata
  data/sources_index/tfidf.joblib     fitted TfidfVectorizer
  data/sources_index/matrix.npz       sparse chunk x term matrix

Run after adding/removing a source: ./tools/build_index.py
"""
import json
import re
from pathlib import Path

import fitz  # PyMuPDF
from scipy import sparse
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib

ROOT = Path(__file__).parent.parent
PDF_DIR = ROOT / "sources_pdfs"
INDEX_DIR = ROOT / "data" / "sources_index"
SOURCES_JSON = ROOT / "data" / "sources.json"

CHUNK_WORDS = 250
CHUNK_OVERLAP = 40


def clean_page_text(text):
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()


def chunk_words(words, size, overlap):
    i = 0
    while i < len(words):
        yield words[i:i + size]
        if i + size >= len(words):
            break
        i += size - overlap


def extract_chunks(pdf_path, meta):
    doc = fitz.open(pdf_path)
    chunks = []
    for page_num in range(len(doc)):
        text = clean_page_text(doc[page_num].get_text())
        if not text:
            continue
        words = text.split()
        if len(words) < 20:
            continue
        for piece in chunk_words(words, CHUNK_WORDS, CHUNK_OVERLAP):
            chunk_text = " ".join(piece)
            if len(chunk_text) < 80:
                continue
            chunks.append({
                "book_slug": meta["slug"],
                "title": meta["title"],
                "author": meta["author"],
                "page": page_num + 1,
                "text": chunk_text,
            })
    doc.close()
    return chunks


def main():
    sources = json.loads(SOURCES_JSON.read_text())
    all_chunks = []
    for src in sources:
        pdf_path = PDF_DIR / src["filename"]
        if not pdf_path.exists():
            print(f"skip (missing pdf): {src['filename']}")
            continue
        print(f"extracting: {src['filename']}")
        book_chunks = extract_chunks(pdf_path, src)
        print(f"  -> {len(book_chunks)} chunks")
        all_chunks.extend(book_chunks)

    print(f"total chunks: {len(all_chunks)}")

    texts = [c["text"] for c in all_chunks]
    vectorizer = TfidfVectorizer(
        max_features=60000,
        ngram_range=(1, 2),
        min_df=2,
        sublinear_tf=True,
    )
    matrix = vectorizer.fit_transform(texts)
    print(f"matrix shape: {matrix.shape}")

    INDEX_DIR.mkdir(parents=True, exist_ok=True)
    (INDEX_DIR / "chunks.json").write_text(json.dumps(all_chunks, ensure_ascii=False))
    joblib.dump(vectorizer, INDEX_DIR / "tfidf.joblib")
    sparse.save_npz(INDEX_DIR / "matrix.npz", matrix)
    print(f"wrote index to {INDEX_DIR}")


if __name__ == "__main__":
    main()
