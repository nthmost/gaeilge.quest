# constructions.json Schema

Each entry in the array:

```json
{
  "id": "unique-slug",           // kebab-case, used for anchor links and see_also refs
  "title": "Display Title",
  "category": "verbs",           // one of: verbs, nouns, pronouns, adjectives, syntax,
                                 //   phonology, numbers, copula, overview
  "subcategory": "tenses",       // optional finer grouping within category
  "difficulty": "beginner",      // beginner | intermediate | advanced
  "tags": ["tag1", "tag2"],      // free-form, used in search
  "summary": "One-line description shown in collapsed card.",
  "content": "Full explanation, plain text. Use \\n for newlines.",
  "examples": [
    {
      "irish": "Tá mé anseo.",
      "english": "I am here.",
      "dialect": "standard",     // standard | munster | connacht | ulster
                                 // omit or use "standard" if universal
      "note": "Optional per-example note, e.g. 'Munster contracted form'"
    },
    {
      "irish": "Táim anseo.",
      "english": "I am here.",
      "dialect": "munster",
      "note": "Contracted 1sg form common in Munster"
    }
  ],
  "notes": "General notes, caveats, exceptions shown at bottom of card.",
  "see_also": ["other-id", "another-id"]  // ids of related constructions
}
```

## Dialects

- `standard` — Caighdeán Oifigiúil (default; use when universal or standard form)
- `munster` — Kerry, Cork, Waterford Irish
- `connacht` — Galway, Mayo Irish
- `ulster` — Donegal Irish (most divergent)

If an example applies to all dialects, use `standard` or omit the field.
If showing dialect variants, include one example per relevant dialect.

## Categories

| category    | description                          |
|-------------|--------------------------------------|
| verbs       | Conjugation, tenses, moods           |
| nouns       | Declension, gender, articles         |
| pronouns    | Personal, prepositional, possessive  |
| adjectives  | Agreement, comparison                |
| syntax      | Word order, clauses, sentences       |
| phonology   | Mutations, spelling, pronunciation   |
| numbers     | Cardinal, ordinal, personal          |
| copula      | The copula 'is'                      |
| overview    | General/introductory topics          |

## Teanglann / Focloir linking

Irish words in examples are automatically linked to teanglann.ie when clicked —
no special markup needed in the data. Just write plain Irish text.
