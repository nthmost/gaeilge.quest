# gaeilge.quest

An Irish (Gaeilge) grammar reference for learners. Curated by hand, with an AI assistant for questions not yet covered by the reference cards.

Live at **[gaeilge.quest](https://gaeilge.quest)**

---

## What it is

- **Grammar reference cards** — 78 cards spanning A1–C2, covering everything from broad/slender consonants and the imperative mood up through literary register, classical spelling, and defective verbs. Each card has a summary, full explanation, annotated examples (with dialect variants), and cross-references.
- **Verb conjugation tables** — 22 verbs (11 irregular + 11 regular), 6 tenses, synthetic forms by default with analytic toggle.
- **Prepositional pronoun tables** — all 15 simple prepositions, full person matrix.
- **AI grammar assistant** — for questions not covered by the reference cards. Streams answers from Claude (Haiku), informed by the full card list and primary source texts. Always addresses dialect differences.

## Stack

```
backend/api.py          Flask app — routes + /api/ask (streaming SSE, Claude API)
data/constructions.json Grammar reference cards (78 cards, A1–C2)
data/verbs.json         Verb conjugation paradigms (22 verbs × 6 tenses)
data/preps.json         Prepositional pronoun tables
data/SCHEMA.md          Schema docs for constructions.json
templates/index.html    Main grammar reference page
templates/verbs.html    Verb conjugation page
templates/preps.html    Prepositional pronouns page
static/css/style.css    Global styles
static/css/verbs.css    Verb page styles
static/js/app.js        Grammar page JS (search, filters, streaming AI)
static/js/verbs.js      Verb page JS
```

**Server:** Flask + Gunicorn (port 5200) behind nginx on morrigan (193.24.234.210).
**Service:** `gaeilge-quest.service`
**Logs:** `/var/log/gaeilge-quest-{access,error}.log`

## Reference card coverage

| Level | Cards | Topics include |
|-------|-------|----------------|
| A1 | 12 | Bí, VSO word order, noun gender, broad/slender consonants, negation, personal pronouns |
| A2 | 15 | Copula, mutations, genitive, adjective agreement, verbal noun, imperative, prepositions, h/t-prefix, days/months |
| B1 | 15 | Past & future tense, conditional sentences, personal numbers, perfect aspect (tar éis), conjunctions, adverbs |
| B2 | 14 | Relative clauses, autonomous verb, cleft sentences, subjunctive, five declensions, indirect questions, prospective aspect |
| C1 | 11 | Dependent/independent forms, preverbal particles, syncopation, advanced copula, defective verbs, discourse markers |
| C2 | 11 | Literary/archaic verb forms, classical spelling, literary register; 8 primary source texts |

## Grammar assistant behaviour

When the user searches and finds no matching card, the assistant:
1. Always notes dialect differences (Munster / Connacht / Ulster), labelled **Dialect note:**
2. Checks whether the question relates to any of the site's primary source texts (Peig, An tOileánach, Cré na Cille, etc.) and cites them if relevant
3. Complements rather than duplicates existing cards — it receives the full card list as context
4. Streams the response token-by-token for fast perceived latency

Model: `claude-haiku-4-5-20251001`. System prompt cached at startup. Responses cached in memory (256-entry FIFO, normalised key) — repeated questions are served instantly with no API call.

## Deployment

```bash
# Quick deploy (changed files only)
rsync -az <files> nthmost@morrigan:/tmp/gq-update/
ssh morrigan "sudo cp /tmp/gq-update/<file> /var/www/gaeilge.quest/<path>/ && sudo systemctl restart gaeilge-quest"

# Full deploy (see deploy.sh — requires www-data ownership fix first)
ssh morrigan "sudo chown -R nthmost:nthmost /var/www/gaeilge.quest"
bash deploy.sh
ssh morrigan "sudo chown -R www-data:www-data /var/www/gaeilge.quest"
```

## Design decisions

See `CLAUDE.md` for the full list. Key locked-in choices:

- **Synthetic verb forms are default** — analytic is opt-in. Nobody in any dialect actually speaks the standard analytic.
- **Default tenses:** Present, Past, Future. Past Habitual / Conditional / Imperative are opt-in toggles.
- **Tags are search-only** — not clickable filters. Sidebar filters (Topics, CEFR Level, Dialect) are collapsible dropdowns with multi-select AND logic: selecting A1 + Verbs shows only A1 verb cards.
- **Layout is left-flush** — no centered max-width container; content fills the screen from the left edge.
- **Irish tricolor palette:** `--green: #169b62`, `--orange: #ff883e`, `--dark: #1a1a2e`

## Content notes

- Card data is in `data/constructions.json`. See `data/SCHEMA.md` for the schema.
- Verb paradigms should be verified against a printed grammar (e.g. *A Grammar of Modern Irish* by Stenson or *Gramadach na Gaeilge* by Ó Siadhail). Some 2nd-conjugation Munster synthetic forms are uncertain.
- Categories in constructions.json: `verbs`, `nouns`, `pronouns`, `adjectives`, `syntax`, `phonology`, `numbers`, `copula`, `overview`, `prepositions`, `literature`
