# CLAUDE.md — gaeilge.quest

Irish grammar reference site. Flask + Gunicorn (port 5200) behind nginx on **morrigan** (193.24.234.210). Deployed via rsync.

## Deployment

```bash
ssh morrigan "sudo chown -R nthmost:nthmost /var/www/gaeilge.quest"
rsync -avz --exclude '__pycache__' --exclude '*.pyc' --exclude '.git' ./ morrigan:/var/www/gaeilge.quest/
ssh morrigan "sudo chown -R www-data:www-data /var/www/gaeilge.quest && sudo systemctl restart gaeilge-quest"
```

Service: `gaeilge-quest.service`. Logs: `/var/log/gaeilge-quest-{access,error}.log`.

## Architecture

```
backend/api.py          Flask app — routes + /api/ask (Claude API)
data/constructions.json Grammar reference data
data/verbs.json         Verb conjugation paradigms (all 22 verbs)
data/SCHEMA.md          Schema docs for constructions.json
data/sources.json       Primary-source bibliographic metadata (see Sources tab below)
data/sources_index/     Built TF-IDF retrieval index (chunks.json, tfidf.joblib, matrix.npz) — committed, built by tools/build_index.py
templates/index.html    Main grammar reference page
templates/verbs.html    Verb conjugation page
templates/sources.html  Primary sources list page
static/css/style.css    Global styles (including .header-nav, .nav-link)
static/css/verbs.css    Verb page styles only
static/js/app.js        Grammar page JS
static/js/verbs.js      Verb page JS
tools/build_index.py    Offline index builder — reads sources_pdfs/ (git-ignored, not deployed), writes data/sources_index/
```

## Sources tab + primary-source RAG

The `/sources` page lists public-domain Irish/Celtic linguistics reference
works (grammars, dictionaries — see `data/sources.json`), each citing and
linking to its Internet Archive page. Only genuinely public-domain works
(pre-1930 US publication, or explicitly PD/openly-licensed) belong here —
same rule as the private `gaeilge.nthmost.net` books section this list was
ported from. The PDFs themselves are not hosted on this server; link out to
Internet Archive instead.

`/api/ask` is grounded in these works via a small retrieval pipeline:
`tools/build_index.py` OCR-extracts text per page (PyMuPDF), chunks it
(~250 words, 40-word overlap), and fits a `TfidfVectorizer` over all chunks
— chosen over dense/neural embeddings because morrigan is a small VPS with
tight disk (historically ~94% full); scikit-learn + scipy + numpy is a much
lighter dependency than a sentence-transformer + torch stack, and TF-IDF
works well here since questions tend to use the same grammatical
terminology the source texts use. `retrieve_passages()` in `backend/api.py`
cosine-matches the question against the chunk matrix and the top matches
(above `RAG_MIN_SCORE`) are appended to the system prompt as "Retrieved
passages" with title/author/page, so Claude can cite them — it's instructed
not to force a citation when nothing's actually relevant, and never to
fabricate one.

To add/remove a source: edit `data/sources.json`, drop (or remove) the PDF
in `sources_pdfs/` (git-ignored — re-download it locally when rebuilding),
then `./tools/build_index.py` and commit the regenerated `data/sources_index/`.
Requires `scikit-learn==1.9.1` (or whatever's pinned in `requirements.txt`)
to match between the build venv and the deployed venv on morrigan, since
`tfidf.joblib` is a pickled vectorizer.

## Design Decisions — Do Not Change Without Discussion

### Verb page (`/verbs`)

- **Synthetic (spoken) forms are the default display.** Analytic forms are behind an opt-in toggle ("Show standard/analytic"). This is intentional — synthetic forms are what's actually spoken in all dialects including Ulster. Do not make analytic the default or remove the toggle.
- **Default tenses shown**: Present, Past, Future. Past Habitual, Conditional, Imperative are opt-in (shown as dashed toggle buttons). Do not change which tenses are default without discussing with the user.
- **Munster variants** (`m` field in verbs.json) are shown inline in orange below the primary form, prefixed "M:". Do not hide these.
- **Verb groupings** in the sidebar: Irregular | 1st Conj. Broad | 1st Conj. Slender | 2nd Conj. -aigh/-igh | 2nd Conj. Other. Keep this grouping.
- **Two view modes**: By Verb (default) and By Tense. Both must remain functional.
- **Teanglann.ie linking**: clicking any Irish word in a primary form opens `https://www.teanglann.ie/en/fgb/{word}` in a new tab.

### Grammar page (`/`)

- **Dialect filter bar** above the cards (All / Munster / Connacht / Ulster) filters examples. Standard-dialect examples always show regardless of dialect filter.
- **Difficulty badges** (Beginner / Intermediate / Advanced) appear in the card title row.
- **See also** cross-links at the bottom of expanded cards.
- **Tags** are for search only — they are not clickable filters. This is intentional.
- **Teanglann.ie linking** works the same way: click any word in the Irish column of an examples table.

### Data schemas

See `data/SCHEMA.md` for the full constructions.json schema.

`verbs.json` per-form structure: `f` = spoken/synthetic (required, primary display), `s` = standard analytic (optional, shown when toggle is on), `m` = Munster variant (optional, always shown in orange). Persons: 1sg, 2sg, 3sg, 1pl, 2pl, 3pl, auto. Tenses: present, past, future, past_hab, conditional, imperative.

### Colors / branding

Irish tricolor palette:
- `--green: #169b62` — primary accent, active states, Irish text
- `--orange: #ff883e` — secondary accent, Munster forms, notes boxes
- `--dark: #1a1a2e` / `--mid: #2d2d44` — header, hero backgrounds

### Navigation

Both pages share the `.header-nav` / `.nav-link` styles (defined in `style.css`). The active page gets `class="nav-link active"`. Do not move these styles to verbs.css.

## Content Notes

- The 22 verbs in verbs.json cover: 11 irregulars (bí/tá, abair, beir, clois, déan, faigh, feic, ith, tabhair, tar, téigh) + 3 reg-1st-broad (mol, tóg, fan) + 2 reg-1st-slender (bris, caith) + 3 reg-2nd-igh (ceannaigh, éirigh, imigh) + 3 reg-2nd-other (oscail, inis, freagair).
- Verb paradigms should be verified against a printed grammar (e.g. *A Grammar of Modern Irish* by Stenson or *Gramadach na Gaeilge* by Ó Siadhail). Some 2nd-conjugation Munster synthetic forms are uncertain.
- `constructions.json` entries follow the schema in `data/SCHEMA.md`. Categories: verbs, nouns, pronouns, adjectives, syntax, phonology, numbers, copula, overview.
