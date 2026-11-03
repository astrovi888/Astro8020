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

## The course (Learn tab) - how levels work

Defined in `course.js` (read its header comment first). Summary:
- Levels A1, A2, B1, B2. Each level is cut into lessons of 10 cards (sentences and words, most frequent first = the 80/20 idea). A lesson unlocks when the previous one is done.
- You move up only by passing a level test (15 questions, 12 right). The test unlocks after 70% of the level's lessons. "I know some German. Test me" lets a returning learner climb by tests alone.
- Progress is not stored separately: a lesson is done when its cards are past the first learning step in `ST.cards`. Only `ST.course.passed` (levels passed) and `ST.course.started` are saved.
- Card levels come from the data files: word levels from the CEFR word list, sentence levels in column 4 of each row. The 990 curriculum sentences have approximate, computed levels (see `data-curriculum.js`). Fix a level there, not in course.js.
- The old XP "Lv N" label is replaced by the CEFR level everywhere. XP still exists for coins and the leaderboard.
- Practice tab = the old Learn screen with all filters (free practice, not gated).

## Install and offline
`manifest.webmanifest`, `sw.js` and the icons make the site installable and available offline after one visit. `sw.js` is network-first, so updates are never stuck behind a cache.

## Profile, weak spots and speaking (insights.js, speak.js)
- **insights.js**: every flashcard rating is logged in `ST.ev` (newest 600). From it and `ST.cards` the site derives, live, the learner's weak cards, weakest topics and article accuracy. It powers the "For you" card on the Learn screen, "Fix weak cards" lessons and the My profile page (More > My profile). Nothing is stored twice, so weak spots update as soon as the learner improves.
- **speak.js**: Speaking practice (More > Speaking practice) plus an optional "Say it" mic button on normal flashcards. Uses the browser's SpeechRecognition (Chrome, Edge, Safari 14.5+; needs HTTPS, internet and microphone permission). Browsers without it fall back to self-check mode automatically. Matching is forgiving on purpose (see `wordOK` / `sentOK`). Results go to `ST.sp`.
- **Test integrity** (course.js `testEnd`): a pass only counts if the median answer time is over 0.9 s and the learner did not leave the page more than once mid-question. All attempts are logged in `ST.course.tests`. This is a static site, so it cannot stop someone who edits browser storage. A real anti-cheat would need server-side checks.
