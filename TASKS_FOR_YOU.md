# Your tasks (all doable from a phone browser)

## 1. Upload the new files (10 min)
GitHub repo Astro8020 -> Add file -> Upload files -> select ALL of these at once -> Commit:
index.html, style.css, app.js, features.js, sync.js, data-words.js, data-sentences.js, data-stories.js, data-bulk.js (optional: README.md)
They replace the old single index.html. Wait 1-2 minutes, open the site, hard refresh.
(Your old file is safe in the repo history.)

## 2. Test audio and tell me what you see (2 min)
Progress -> Settings -> tap "Test sound" and "Test German voice". Read the line "Sound engine ... German voices found ...".
Send me that line + your phone/browser (e.g. "iPhone Safari" or "Android Chrome").
(Check: volume up, iPhone silent switch off, not inside WhatsApp/Instagram browser.)

## 3. Get 1,000+ sentences automatically (10 min)
a) Repo -> Add file -> Create new file. Name: tools/build_sentences.py  (type the slash). Paste the contents of build_sentences.py. Commit.
b) Create new file. Name: .github/workflows/build-data.yml . Paste the contents of build-data.yml. Commit.
c) Repo -> Actions tab -> "Build sentence data" -> Run workflow. Wait ~2 minutes for the green check.
d) It updates data-bulk.js in your repo. Reload the site: Sentences should now show 1,000+ sentences, each using only top-1,000 words, with real frequency bands.
   If it fails (red X): open the run, copy the red error text, send it to me.
e) Then tell me, and I add the required Tatoeba credit (CC BY 2.0 FR) to About.
Note: these bulk sentences have no grammar notes yet; levels/bands are computed from the hardest word.

## 4. Supabase (once) - see NEXT_STEPS.md (SQL + keys in sync.js: SB_URL / SB_KEY)

## 5. Decisions only you can make
- Ask Lenguia (https://www.lenguia.com/contact) if we may reuse their top-1000 list, OR tell me to switch to an open list (hermitdave/FrequencyWords on GitHub).
- Support link (Patreon etc.), About text, nickname rules.

## Open projects we can build on next (each has its own license, we credit them)
- Tatoeba (sentences) and michmech/lemmatization-lists (German lemmas): used in step 3.
- hermitdave/FrequencyWords: open frequency lists (alternative to Lenguia).
- open-spaced-repetition/ts-fsrs: modern scheduler to replace our simple SM-2.
- Wiktionary data (kaikki.org) for IPA/gender, and Wikimedia Commons German word recordings: real audio later.
