# UX plan: "never make the learner think about the app"

Status: STEP 1 DONE (`ux.js`: Practice filters collapsed behind one "Options" line with a live summary; tested). Everything else below is still a proposal.

Previous status: AUDIT ONLY. Navigation was already rebuilt by the previous update (`course.js`: bottom bar Learn / Practice / Progress / More). I did not change it without seeing the current screens, because a wrong move here breaks the whole site. Send 3 screenshots (Learn home, Practice, More menu) and this plan can be applied safely.

## Rules to apply (the same ones Apple/Duolingo use)
1. One obvious next action per screen (a single big "Continue" button). Everything else is quieter.
2. Four tabs maximum at the bottom, named after what the learner WANTS: Today, Learn, Practice, Me. Same place, same order, always.
3. Anything reachable in 2 taps or fewer. Rarely used things (settings, support, credits, sound check) live in Me, not on the main screens.
4. Hide filters by default. Show one line ("A1 · Daily · 10 cards") with a "Change" chip. Most people never touch filters.
5. One word for one thing everywhere (Practice vs Learn vs Path: pick one meaning each and never mix).
6. Back is always top-left and says where it goes ("← A1 stories").
7. Never show two ways to do the same thing on one screen (duplicate Match/Read/Dictionary entries).
8. Empty states and errors say what to do next, not what went wrong.
9. Tap targets at least 44px, thumb-reachable actions at the bottom, text never smaller than 14px.
10. Motion only to explain (a card moving to the end of the line), never decoration; respect reduced-motion (already done).

## Concrete changes proposed (in priority order)
1. TODAY screen as the first tab: "Continue lesson" button, cards due, one Astro suggestion, streak. Replaces hunting.
2. Move Dictionary to a 🔍 icon in the header (search is an action, not a destination).
3. Merge duplicate entry points: Match, Read, Speaking and Pronunciation lab become tiles inside Practice.
4. Collapse the Practice filters behind a "Change" chip.
5. Account/sound/help/support icons into a single profile button; keep the "?" only on the first week.
6. Replace the long top "More" list with 3 groups: Study, Progress, Settings.

## Safe order of work
Do 2 and 4 first (small, reversible), then 1, then 3 and 6. After each step run the DOM test in `READALONG_NOTES.md` style (load index.html in jsdom, click through the tabs).

## Done so far
- `ux.js` v1: on Practice > Sentences / Words / Build the 4 dropdowns + direction are folded into one "Options" row that shows the current choice (e.g. "A2 · 10 cards · English → German"). Start stays visible. Tested: filters still apply, Start uses them, Articles/Match untouched.

## Measured clutter (controls visible on first view, from a real render)
Practice 11, Dictionary 100+ (one 🔊 per word row), Path 25, Progress 7, Read 5, Match 1. After step 1 Practice shows about 6.

## Next safe steps (each is small and reversible)
1. Dictionary: show the first 20 rows + "Show more" instead of 100+ buttons.
2. Path: collapse the locked A1/A2 circles behind "Show all levels" and keep only the current level open.
3. More sheet: group into Study / Progress / Settings (needs a look at the sheet markup in `course.js` ~line 193).
4. TODAY tab (new first screen). This changes navigation, so it needs your OK first.
