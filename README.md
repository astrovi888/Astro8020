# Astro 80/20
Learn German through frequency-based sentences, spaced repetition, listening, reading and a dictionary (A1 to B2).

Static site, no build step. Open index.html, or run `python3 -m http.server`.

| File | Purpose |
|---|---|
| index.html, style.css | page and styles |
| app.js | core app (sentences, flashcards, build, articles, progress) |
| features.js | navigation, sound, pronunciation, achievements, ranks, reading, dictionary, translator, match game |
| sync.js | Supabase accounts and cloud sync |
| data-words.js | top-1000 German words (rank, meaning, CEFR level) |
| data-sentences.js | hand-written sentences with grammar notes |
| data-bulk.js | generated sentences (GitHub Action) |
| data-stories.js | starter stories |

Credits: word list and CEFR levels from Lenguia (lenguia.com, reuse permission pending); sentences from Tatoeba.org contributors (CC BY 2.0 FR) once data-bulk.js is generated; translation by MyMemory; accounts by Supabase.
Status and to-do: NEXT_STEPS.md, TASKS_FOR_YOU.md
