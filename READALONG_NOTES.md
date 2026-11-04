# Read-along, read-aloud and pronunciation lab: notes for the next person

File: `readalong.js` (loaded last in `index.html`). Pure addition. Delete the file and its `<script>` tag and the site is exactly as before.

## What it does
| Feature | Where | How |
|---|---|---|
| Listen along | Story screen, bar under the title | `speechSynthesis` speaks the story; word spans light up (yellow = now, bright = already spoken, dim = coming). Pause, Stop, 🐢 Slow. Tap any word during playback to jump there. |
| Read aloud | Same bar, 🎤 | One `SpeechRecognition` run per line. Green = said, red + wiggle = missed. 80% of the words passes the line (+3 XP once per line), then the next line starts by itself. Whole story = +10 XP once. |
| Pronunciation lab | Card at the top of the Read list, or `openPronLab()` | Sound drills (ü/ö, ch, sch, z/w, r, ei/ie/eu, ä) + a drill of real sentences. Hear, say it, green/red, score, XP once per drill per day. |

## How it hooks in (no other file is edited)
- Wraps `storyView()` (adds the bar), `readView()` (adds the lab card) and `render()` (stops a running session on any screen change).
- While a session runs, each line's `.de` element is replaced by `<span class="rw">` words. The original HTML is saved in `el._orig` and restored by `stopS()`.
- The variable `S` in the rest of the site is the global sentence list. In this file the running session is called `ses` so the two never clash.

## Tested (real DOM, fake speech + fake mic)
Listen along wraps/highlights/stops/restores. Read aloud: perfect line passes, garbage line goes red and shows Try again, retry passes and pays XP once. Lab: right/wrong answers, summary. Matching rules: Schön~schon true, Haus~Hans false.

## NOT tested on real devices (do this first)
1. iPhone Safari: does the highlight follow the voice? (iOS often sends no word events; the timing estimator in `runEst()` takes over. If it feels early/late, change `65*len/rate` there.)
2. Chrome Android: does 🎤 ask for the microphone and turn words green while you read?
3. Firefox: no SpeechRecognition. 🎤 buttons explain it; Listen along still works.

## Known limits / next steps
- Dialogues (`path.js` `DG`) don't have the bar yet. Reuse `injectBar()` + `wrapLines()` with the dialogue lines.
- The recognizer may write digits ("3") for "drei". Add a digit->word map in `norm()` if learners hit it.
- Scores are yes/no per word, not phoneme-level. A real accuracy score needs a server (Azure Speech pronunciation assessment, for example).
- Add `"rdl","rdb","pr"` to the object-merge list in `sync.js` (next to `"sp"`) so these progress records sync between devices.
- Ideas: "Shadowing" (hear a line, repeat it immediately), a daily 1-minute pronunciation streak, tongue-twister drill (Fischers Fritz fischt frische Fische), record-and-compare playback.

## Chat fixes made in the same update (`astro-chat.js`, `api/astro.js`)
- A single failed request used to switch smart mode off for the whole visit (that is why you kept getting "I'm a simple Astro"). Now a failure only pauses it for 15 s (2 min if the server says "not configured") and the offline answer says why.
- 20 s timeout on the request; chat history (last 40 messages) is saved in `localStorage["astro-chat-v1"]`.
- Server remembers the Gemini model that worked and times out each attempt after 12 s. Default order starts with the fast "flash-lite" model; set `ASTRO_MODEL` in Vercel to force one.
