# Astrolingo
_(formerly "Astro 80/20")_

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
Status and to-do: TASKS_FOR_YOU.md (NEXT_STEPS.md is referenced there but is not in the repo yet).

## Notes for contributors

**Name vs. internal ids.** The product is called Astrolingo, but a few internal identifiers still use the old name on purpose. Do not "clean them up" without a migration:
- `localStorage` key `a8020` (app.js). Renaming it would erase every user's saved progress.
- `https://astro8020.vercel.app/api/astro` (astro-chat.js). It is the real deployed backend address, not display text.
- The GitHub repo name `Astro8020`.

**Motion.** All animation lives in the "v7 MOTION LAYER" at the end of style.css. It animates only `transform` and `opacity` (GPU-composited, so it runs at the screen's full refresh rate, including 120 Hz iPhones), uses iOS-style easing, and is switched off by `prefers-reduced-motion`. To remove it, delete that section. Read the comment at its top before editing.

**Cache busting.** After editing a file, bump its `?v=` number in index.html so returning visitors get the new copy.

**Script order.** Scripts are plain `<script>` tags and later files wrap functions from earlier ones. Do not reorder them in index.html.
