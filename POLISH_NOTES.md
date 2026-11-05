# Astrolingo v11 polish update: what changed

Drop these files over the repo (same paths). Every new JS file is an independent layer: delete its `<script>` tag in
`index.html` and that feature goes away. Every change is commented in the code with "v11".

## Done and tested
| Area | What | Where |
|---|---|---|
| Flicker | Daily progress bar no longer restarts on updates. The top bar is patched in place (same element, width transition) | `polish.js` part 1, `style.css` |
| Lightning bar | Amber charge bar with shimmer, glowing bolt at the tip, "charged" crackle at goal, streak counter zaps when it goes up | `polish.js`, `style.css` |
| Micro-praise | Floating "Nice! / Sehr gut! / x5 in a row" bursts on right answers, escalating with your streak | `polish.js` part 3 |
| Sound design | New synthesized sounds per action (soft bells, rising melody on a streak, soft "wrong", modal, mic, coin, gift, zap, Blitz). No audio files | `sound.js` (`soundTest()` in the console plays them all) |
| Blitz | Slots with empty gaps, no reuse of recent positions, delayed staggered spawns, fade/scale in and out, shake on a wrong pair | `blitz.js` |
| Test engine | Fixed: a failed "I know some German" test could never be retaken ("Retake" only said finish 33 lessons). Locked test button now explains itself. No more silent returns | `course.js` |
| Stories bug | 4 stories (Mein Zimmer, Der Ausflug am Samstag, Die neue Stelle, Zwischen zwei Welten) stored their text as one string: the "everything crammed in one block" bug, and a crash. Now split into sentences | `features.js` |
| Logo | Header shows the app icon + wordmark; tapping it goes to the Learn home from anywhere | `index.html`, `polish.js`, `style.css` |
| Help "?" | Disappears for good once tapped. Tour reachable from More > How Astrolingo works. Tour text updated to the real tabs | `start.js`, `course.js` |
| Palette | Selected level/tab/chip = soft accent tint, locked = quiet text (no more harsh bright-vs-dark) | `style.css` |
| Dashboard | Progress rebuilt: level ring + 4 key numbers, Learned so far, collapsible topics, curve, needs attention | `polish.js` part 5 |
| Settings | Grouped: Account, Sound, Learning, Astro, Wallet, Data, Support. Daily goal + backup moved here | `polish.js` part 5 |
| Read filters | Filter stories by level, length (words) and topic | `polish.js` part 6 |
| Glow highlight | Auto-read now glows the spoken word (no yellow box); spoken words settle to full brightness | `readalong.js` |
| Mixed quiz | "Quick mixed quiz" on the Learn home: build sentence, fill gap, listen, type, multiple choice | `quiz.js` |
| More menu | Grouped (Practice / You / Help) | `course.js` |

Already in the repo before this update (not changed): per-line retry in Read aloud (a missed sentence is re-said on its own, not the whole story).

## NOT finished (next session)
1. **Account modal polish** (tabs, show password, trust text). Styles are already in `style.css` (`.au-*`), but the markup in `sync.js` is not changed yet.
2. **About / Privacy / Support rewrite, plus new Terms of Service and Credits pages** and the value-proposition text. Styles (`.info-*`) are ready. `sync.js` not changed. Privacy must also mention the Astro chat (messages go to our server and Google Gemini).
3. **Mixed formats inside the level test.** `quiz.js` can already create build/cloze/listen questions (`QUIZ.fromSentence`, `QUIZ.mount`) but `course.js` `buildTest`/`testView` still show multiple choice only.
4. **Typed and spoken modes inside stories** (type the German for each sentence) and "Type it" on flashcards.
5. **Grammar, Conjugation and Interactive Stories practice modules.** `quiz.js` is the engine to build them on; the question banks are not written.
6. **Native audio** (see below): nothing implemented yet.
7. **Catalog / themes explorer** from the earlier session (`data-catalog.js` was written in the older copy, not in this repo).

## Native audio: options (not implemented; check each licence before use)
* **Pre-recorded clips (best quality).** Record or commission a native speaker for the ~1000 core words and the sentences. Store `audio/<id>.mp3`
  plus a small `audio/manifest.json`; the app plays the clip if it exists and falls back to the browser voice. Cheapest start: the 200 most common words.
* **Open recordings.** Mozilla Common Voice (sentence recordings, public-domain licence) and Wikimedia Commons word recordings (mixed Creative Commons licences,
  attribution needed). Needs matching recordings to our exact sentences, so it fits words better than sentences.
* **Generate clips once with an open neural voice** (Piper, with German voices, runs offline on a PC) and ship the mp3 files. Prefer this over live TTS:
  no server cost and no browser difference. Check the voice's licence for commercial use. Coqui XTTS needs a close look at its licence terms.
* Keep the browser voice (current) as the fallback, and keep the 🐢 slow button (a slowed clip works with pre-recorded audio too).

## Chat (Ask Astro) not answering?
Open `https://<your-site>/api/astro?check=1` (diagnostic added by the previous session). It tells you whether the key is read and whether Google accepts it.
