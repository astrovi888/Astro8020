// Astro the person: avatar, your name, a bottom sheet helper, and a "brain" that picks varied, context-aware lines.
// Pure addition. Loaded before features.js so everything else can use astroAv(), uname(), openSheet().

// A friendly human face (inline SVG, no image files). Not a robot.
function astroAv(px){px=px||36;
 return `<svg class="aav" viewBox="0 0 64 64" width="${px}" height="${px}" role="img" aria-label="Astro" style="flex:none;vertical-align:middle;border-radius:50%"><defs><linearGradient id="aavg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#a855f7"/></linearGradient><clipPath id="aavc"><circle cx="32" cy="32" r="32"/></clipPath></defs><g clip-path="url(#aavc)"><rect width="64" height="64" fill="url(#aavg)"/><path d="M6 66c1-13 12-19 26-19s25 6 26 19z" fill="#0f766e"/><path d="M25 47l7 7 7-7z" fill="#f3cfae"/><rect x="27.5" y="39" width="9" height="10" rx="4" fill="#e3b995"/><ellipse cx="19.8" cy="31" rx="2.2" ry="3.2" fill="#e8bf9b"/><ellipse cx="44.2" cy="31" rx="2.2" ry="3.2" fill="#e8bf9b"/><ellipse cx="32" cy="29" rx="12.3" ry="14.2" fill="#f5d3b3"/><path d="M19 28c-2-11 5-18 14-17 8 0 13 6 12 17-1.6-5.5-5-8.5-9.5-9-4.5 3.4-10 6-16.5 9z" fill="#3a2a22"/><path d="M23.5 26.2q3-2 6 0M34.5 26.2q3-2 6 0" stroke="#3a2a22" stroke-width="1.5" fill="none" stroke-linecap="round"/><ellipse cx="27" cy="30.6" rx="1.7" ry="2.1" fill="#2a1f18"/><ellipse cx="37" cy="30.6" rx="1.7" ry="2.1" fill="#2a1f18"/><circle cx="27.6" cy="29.8" r=".6" fill="#fff"/><circle cx="37.6" cy="29.8" r=".6" fill="#fff"/><circle cx="23.6" cy="35.4" r="2.1" fill="#f0a08a" opacity=".45"/><circle cx="40.4" cy="35.4" r="2.1" fill="#f0a08a" opacity=".45"/><path d="M26.4 36.4c2.2 3 9 3 11.2 0" stroke="#9a4f3f" stroke-width="1.7" fill="none" stroke-linecap="round"/><path d="M45 53l1.3 2.7 3 .4-2.2 2.1.55 3-2.65-1.45-2.65 1.45.55-3-2.2-2.1 3-.4z" fill="#fde047"/></g></svg>`}

// Who is learning? Account username first, then the name you told Astro.
function uname(){let n=ST.name||"";try{if(!n&&typeof USER!=="undefined"&&USER&&USER.user_metadata&&USER.user_metadata.username)n=USER.user_metadata.username}catch(e){}return String(n||"").trim().slice(0,24)}

// Bottom sheet (used by the wallet, the word popup and the chat).
function openSheet(html,cls){let o=document.getElementById("sheet");if(!o){o=document.createElement("div");o.id="sheet";o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");o.innerHTML=`<div class="sh-bd" data-sh="x"></div><div class="sh-box"></div>`;document.body.appendChild(o)}
 const b=o.querySelector(".sh-box");b.className="sh-box "+(cls||"");b.innerHTML=html;o.classList.add("on");return b}
function closeSheet(){const o=document.getElementById("sheet");if(o){o.classList.remove("on");const b=o.querySelector(".sh-box");if(b)b.innerHTML=""}}
document.addEventListener("click",e=>{if(e.target.closest("[data-sh]"))closeSheet()});
document.addEventListener("keydown",e=>{if(e.key=="Escape")closeSheet()});

// ---- the brain: varied, context-aware lines. No line repeats until the pool is used up. ----
const ABrain=(function(){
 const used={};
 const pick=(id,a)=>{const u=used[id]=used[id]||[];let c=a.map((_,k)=>k).filter(k=>!u.includes(k));if(!c.length){used[id]=[];c=a.map((_,k)=>k)}const k=c[Math.floor(Math.random()*c.length)];used[id].push(k);return a[k]};
 const hr=()=>new Date().getHours(),n=()=>uname(),nm=(s)=>n()?s.replace("{n}",n()):s.replace(/,? ?\{n\}/,"").replace("{n}","");
 const daysAway=()=>ST.last?Math.round((Date.parse(day())-Date.parse(ST.last))/864e5):null;
 const mk=()=>Object.keys(ST.mk||{}).length;
 const L={
  hello(){const h=hr(),away=daysAway(),st=ST.streak||0;
   if(away>=3)return nm(pick("hw",[`{n}, there you are! ${away} days is a long break, so let’s start small today. Five cards and you’re back in.`,`Good to see you again, {n}. Nobody falls behind on German, you just pick it back up. Start with a short round?`,`Hey {n}! I kept your seat warm. Ease back in with a few easy cards.`]));
   const tod=h<5?"night":h<11?"morning":h<17?"afternoon":h<22?"evening":"night";
   const base={morning:[`Guten Morgen, {n}! Coffee first, then a few sentences?`,`Morgen, {n}. A little German before the day takes over?`,`Good morning {n}! Your brain is freshest now, ideal for new words.`],
    afternoon:[`Hallo {n}! Perfect time for a quick round.`,`Hey {n}, nice to see you. What are we learning today?`,`Servus, {n}! Ready when you are.`],
    evening:[`Guten Abend, {n}! A calm evening round locks in what you learned today.`,`Hey {n}. Evening sessions are great, your brain files things while you sleep.`,`Schön, dich zu sehen, {n}. Let’s do a few.`],
    night:[`Still up, {n}? Do a short round, then sleep. Memory sticks better after rest.`,`Late-night German, {n}! Keep it short so you can sleep well.`]}[tod];
   let s=pick("h"+tod,base);if(st>=3&&Math.random()<.5)s+=` ${st} days in a row, that’s real consistency.`;return nm(s)},
  idle(){const m=mk(),l=learned().length;
   const a=[`{n}, one tiny round? Even three cards count.`,`I’m here whenever you want to practice. No pressure.`,`Quick idea: tap a German sentence in a story and listen. Your ear needs training as much as your eyes.`,`Stuck on something? Open the chat and ask me, I like questions.`,`Want me to pick for you? Let’s do a short round.`,`Little reminder: tiny daily practice beats a long session once a week.`];
   if(m>=8)a.push(`You have ${m} mistakes waiting. Fixing a few now is the fastest way to stop repeating them.`);
   if(l>=20)a.push(`You’ve already learned ${l} sentences, {n}. That is real progress. Keep the rhythm.`);
   return nm(pick("idle",a))},
  struggle(note){const a=[`That one is tricky, {n}. Take your time.`,`Hard sentence, it happens to everyone.`,`Slow down, say it out loud once, then move on.`];
   return nm((note?`Here’s the trick on this one: ${note}`:pick("st",a)))},
  praise(k){return nm(pick("pr",[`${k} in a row, {n}. That’s the good stuff!`,`Look at you go! ${k} right.`,`Sehr gut, {n}! ${k} correct in a row.`,`${k} straight. Your memory is working.`]))},
  done(acc){if(acc>=80)return nm(pick("d1",[`Clean round, {n}! The shaky ones will come back at just the right time.`,`Stark! That’s how it’s done. See you tomorrow?`,`Excellent round. Come back tomorrow and the old cards will have waited for you.`]));
   if(acc>=50)return nm(pick("d2",[`Solid, {n}. The ones you missed come back sooner, that’s the trick.`,`Good work. Mistakes are the useful part.`,`Okay round. A second short one would cement it.`]));
   return nm(pick("d3",[`Tough round, {n}, but the hard ones are exactly what we need. Want a short lesson to back you up?`,`Rough one. Slow down, and try the Path lessons for the basics behind it.`]))},
  story(t){return nm(pick("sd",[`You finished “${t}”, {n}. Nice. Try saying one line out loud.`,`“${t}” done! Reading is the best way to see words working together.`,`Gut gemacht, {n}! That was “${t}”. Pick the next one when you like.`]))},
  milestone(c){return nm(`${c} sentences learned, {n}! That’s not luck, that’s habit.`)},
  broke(){return nm(pick("br",[`You’re out of coins for lookups, {n}. Earn some: daily gift, a practice round, or just keep learning. Or guess the word from the sentence first, that trains you more anyway.`,`No coins left right now. Try the sentence translation, it’s free, then check the words you still don’t get.`]))},
  gift(a){return nm(pick("gf",[`Here you go, {n}: +${a} 🪙. Spend them wisely.`,`A little something for you: +${a} 🪙.`,`Found these for you! +${a} 🪙`,`You’ve been working hard. +${a} 🪙 on me.`]))},
  hour(){return nm(pick("hr",[`An hour of real practice, {n}! Take a short break, drink water.`,`That’s an hour with German. Proud of you.`]))}
 };
 return L})();
