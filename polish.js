// =====================================================================================================================
// Astrolingo POLISH LAYER (polish.js, v1). Pure addition, loaded LAST. Delete this file + its <script> tag to undo it all.
// (The matching styles are the "v11 POLISH LAYER" section at the end of style.css.)
//
// WHAT IT DOES (each part is a labelled block below; they are independent, so one can be removed without the others)
//  1. FLICKER-FREE TOP BAR. The old topbar() rebuilt #top with innerHTML on every call (every card, every save). That
//     re-created the progress <i>, and CSS `.bar i{animation:grow}` replayed, so the bar visibly restarted from empty on
//     every update. Now the original topbar() is still the source of truth (course.js adds the CEFR badge to it), but its
//     output is rendered off-screen and only the CHANGED bits (text, bar width) are patched into the live element.
//  2. LIGHTNING CHARGE BAR. The daily-goal bar is electric: amber fill, a travelling shimmer, a glowing bolt at the tip, and
//     a "charged" state with crackle when the goal is met. A streak going up zaps the streak counter.
//  3. MICRO-PRAISE. Short floating praise ("Nice!", "Sehr gut!", "⚡ x5 in a row!") with sparks, on right answers. The text
//     escalates with your streak of right answers. Throttled, never blocks taps, off for reduced motion (plain fade).
//  4. LOGO = HOME. The header logo/wordmark is a link; tapping it returns to the Learn home from anywhere.
//  5. PROGRESS DASHBOARD. Overview is rebuilt into: hero (level ring + 4 key numbers), "Learned so far", collapsible topics,
//     curve, "needs attention". Daily goal + backup moved into Settings, which is now grouped (Sound, Learning, Astro,
//     Wallet, Account, Data, Legal) instead of one long list. All ids/handlers (gl, bk, data-set, data-do, data-a) are
//     unchanged, so the original logic keeps working.
//  6. READ FILTERS. Stories can be filtered by CEFR level, length (word count) and topic. Filters live on the Read home
//     and replace the four level cards with a flat result list while active.
// =====================================================================================================================
(function(){
"use strict";
const $q=s=>document.querySelector(s),reduced=()=>window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
const guard=f=>function(){try{return f.apply(this,arguments)}catch(e){console.error("polish.js",e)}};

/* ===================================== 1+2. FLICKER-FREE, ELECTRIC TOP BAR ===================================== */
{
const _tb=topbar;let boot=true,prevStreak=ST.streak||0,zapT=0;
function decorate(live){
 const bar=live.querySelector(".bar");if(!bar)return;bar.classList.add("tb-bar");
 let bolt=bar.querySelector(".tb-bolt");if(!bolt){bolt=document.createElement("b");bolt.className="tb-bolt";bolt.textContent="⚡";bolt.setAttribute("aria-hidden","true");bar.appendChild(bolt)}
 const fill=bar.querySelector("i"),p=parseFloat(fill&&fill.style.width)||0;
 bar.style.setProperty("--p",p+"%");bar.classList.toggle("charged",p>=100);bar.classList.toggle("empty",p<=0);
 const sk=live.firstElementChild;if(sk)sk.classList.toggle("hot",(ST.streak||0)>=3)}
window.topbar=function(){
 const live=document.getElementById("top");if(!live)return _tb();
 // Render the ORIGINAL topbar into a hidden clone: it writes to getElementById("top"), so swap ids for a moment.
 const tmp=document.createElement("div");tmp.id="top";tmp.hidden=true;live.id="top-live";document.body.appendChild(tmp);
 try{_tb()}finally{live.id="top";tmp.remove()}
 const a=[...live.children],b=[...tmp.children];
 if(!a.length||a.length!==b.length||(a[1]&&b[1]&&a[1].tagName!==b[1].tagName)){live.innerHTML=tmp.innerHTML}      // first render / structure changed
 else b.forEach((nb,i)=>{const na=a[i];
  if(nb.classList.contains("bar")){const ni=nb.querySelector("i"),li=na.querySelector("i");if(ni&&li&&li.style.width!==ni.style.width)li.style.width=ni.style.width}   // bar: change the width only, same element, no replay
  else if(na.textContent!==nb.textContent)na.textContent=nb.textContent});
 decorate(live);
 // celebrate real changes only (not the first paint)
 const n=ST.today&&ST.today.d==day()?ST.today.n:0;
 if(boot){boot=false;prevStreak=ST.streak||0;if(n>=ST.goal)ST.gz=day()}
 else{
  if((ST.streak||0)>prevStreak){const sk=live.firstElementChild;if(sk){sk.classList.remove("zap");void sk.offsetWidth;sk.classList.add("zap");clearTimeout(zapT);zapT=setTimeout(()=>sk.classList.remove("zap"),1100)}try{sfx.zap()}catch(e){}praise("⚡ Streak: "+ST.streak+" day"+(ST.streak==1?"":"s")+"!",true)}
  if(n>=ST.goal&&ST.gz!=day()){ST.gz=day();try{save()}catch(e){}try{sfx.ach();burst()}catch(e){}praise("⚡ Daily goal complete!",true)}
  prevStreak=ST.streak||0}
};
}

/* ===================================== 3. MICRO-PRAISE ===================================== */
{
let combo=0,last=0,lastTxt="";
const POOL=[["Nice!","Richtig!","Gut!","Yes!"],["Sehr gut!","On a roll!","Stark!","Super!"],["Wahnsinn!","Unstoppable!","Perfekt!","Genial!"]];
function pickTxt(){const tier=combo>=7?2:combo>=3?1:0;let t;for(let k=0;k<6;k++){t=POOL[tier][(Math.random()*POOL[tier].length)|0];if(t!==lastTxt)break}lastTxt=t;return combo>=3&&combo%2?`⚡ ×${combo} in a row`:t}
window.praise=function(txt,force){
 const now=Date.now();if(!force&&now-last<700)return;last=now;
 const el=document.createElement("div");el.className="mp";el.setAttribute("aria-hidden","true");el.textContent=txt||pickTxt();
 if(!reduced())for(let k=0;k<7;k++){const s=document.createElement("i");s.style.setProperty("--a",(k*51+Math.random()*30)+"deg");s.style.setProperty("--d",(26+Math.random()*22)+"px");el.appendChild(s)}
 document.body.appendChild(el);setTimeout(()=>el.remove(),1100)};
window.microPraise=function(ok){if(ok){combo++;praise()}else combo=0};
// flash("ok") / flash("no") are called by every flashcard rating, Build check and Blitz match, so hook there.
const _fl=flash;window.flash=function(k){_fl(k);try{if(k==="ok")window.microPraise(true);else if(k==="no")window.microPraise(false)}catch(e){}};
}

/* ===================================== 4. LOGO = HOME ===================================== */
document.addEventListener("click",e=>{
 const a=e.target.closest&&e.target.closest("#logo");if(!a)return;e.preventDefault();
 try{closeSheet()}catch(x){}try{const m=document.getElementById("md");m&&m.classList.add("hide")}catch(x){}
 const b=$q('#bbar [data-g="c"]');if(b)b.click();window.scrollTo&&scrollTo({top:0,behavior:reduced()?"auto":"smooth"})});

/* ===================================== 5. PROGRESS DASHBOARD + SETTINGS ===================================== */
// Segmented control: "Stats" is renamed "Overview" (same data-pt keys, so every handler still works).
window.seg=function(){return`<div class="seg" role="tablist" aria-label="Progress sections">${[["s","Overview"],["a","Awards"],["l","Ranks"],["t","Settings"]].map(([k,l])=>`<button class="${ptab==k?"on":""}" data-pt="${k}" role="tab" aria-selected="${ptab==k}">${l}</button>`).join("")}</div>`};
const ring=(p,sz)=>{const r=sz/2-7,c=2*Math.PI*r;return`<svg class="dr" width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}" aria-hidden="true"><circle cx="${sz/2}" cy="${sz/2}" r="${r}" fill="none" stroke="var(--bd)" stroke-width="7"/><circle cx="${sz/2}" cy="${sz/2}" r="${r}" fill="none" stroke="var(--ac)" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(c*p/100).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${sz/2} ${sz/2})"/></svg>`};
function overview(){
 topbar();const badge=(document.getElementById("top").lastElementChild||{}).textContent||stg(lvl());
 const L=learned(),W=new Set(),now=Date.now(),l=lvl(),pct=l>=100?100:(ST.xp%150)/150*100;
 L.forEach(k=>toks(S[k][0]).forEach(x=>W.add(x)));
 const wk=Object.keys(ST.cards).filter(k=>k[0]=="w"&&ST.cards[k].reps>=1);wk.forEach(k=>WR[+k.slice(1)]&&W.add(WR[+k.slice(1)].de.toLowerCase()));
 const due=Object.keys(ST.cards).filter(k=>ST.cards[k].due<=now).length,
  ds=Object.keys(ST.hist||{}).sort().slice(-30),vs=ds.map(d=>ST.hist[d]),mx=Math.max(S.length,...vs),
  ao=Object.values(ST.art||{}).reduce((a,x)=>a+x.ok,0),ab=Object.values(ST.art||{}).reduce((a,x)=>a+x.bad,0),
  hw=Object.entries(ST.hw||{}).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([w,n])=>`${w.slice(3)} (${n})`).join(", "),
  weak=Object.entries(ST.art||{}).filter(x=>x[1].bad>0).sort((a,b)=>(b[1].bad-b[1].ok)-(a[1].bad-a[1].ok)).slice(0,5).map(x=>{const n=NN.find(w=>w.de==x[0]);return n?wcol(n):""}).join(", ");
 let g=`<p class="en" style="margin:0">Practice on two different days to see your graph.</p>`;
 if(ds.length>1){const p=vs.map((v,n)=>`${10+n*(280/(vs.length-1))},${110-v/mx*100}`).join(" ");g=`<svg viewBox="0 0 300 120" role="img" aria-label="Sentences learned over time" style="width:100%;color:var(--ac)"><polyline points="${p}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/></svg><div class="meta"><span>${ds[0]}</span><span>${ds[ds.length-1]}</span></div>`}
 const stat=(ico,v,lab)=>`<div class="dm"><i aria-hidden="true">${ico}</i><b>${v}</b><span>${lab}</span></div>`;
 app.innerHTML=seg()+`
 <div class="box dash-hero"><div class="dh-ring">${ring(pct,104)}<div class="dh-lv"><b>${badge}</b><span>level</span></div></div>
  <div class="dh-txt"><b>${stg(l)}</b><span>${ST.xp} XP${l<100?` · ${150-ST.xp%150} to next level`:""}</span><span class="en">${(ST.streak||0)>=3?"You're on a streak. Keep it charged ⚡":"A little every day adds up."}</span></div></div>
 <div class="dash-m">${stat("🔥",ST.streak||0,"day streak")}${stat("🪙",coins(),"coins")}${stat("⏱️",fmtT(ST.tm||0),"time learning")}${stat("📚",due,"cards due")}</div>
 <div class="box dash-c"><h3>Learned so far</h3>
  <div class="dc-row"><div><b>${L.length}</b><span>of ${S.length} sentences</span></div><div><b>${W.size}</b><span>words you can read</span></div><div><b>${wk.length}</b><span>word flashcards</span></div></div>
  ${["A1","A2","B1","B2"].map(x=>bar(x,L.filter(k=>S[k][3]==x).length,S.filter(s=>s[3]==x).length)).join("")}</div>
 <details class="box dash-c dash-fold"><summary><h3>By topic</h3><span>${THEMES.length} topics</span></summary>${THEMES.map(x=>bar(x,L.filter(k=>S[k][4]==x).length,S.filter(s=>s[4]==x).length)).join("")}</details>
 <div class="box dash-c"><h3>Learning curve</h3>${g}</div>
 <div class="box dash-c"><h3>Needs attention</h3><p style="margin:0 0 6px"><b>Articles:</b> ${ao+ab?Math.round(ao/(ao+ab)*100)+"% correct ("+(ao+ab)+" answers)":"not practiced yet"}</p>${weak?`<p class="en" style="margin:0 0 6px;font-size:15px">Needs work: ${weak}</p>`:""}<p style="margin:0"><b>Words you needed hints for:</b> <span class="en" style="font-size:15px">${hw||"none yet"}</span></p></div>
 <p class="en dash-note">Levels are the CEFR scale (A1 to B2). Every 150 XP is one XP level. Word levels and frequency bands are approximate.</p>`}
{const _stats=stats;window.stats=function(){if(ptab==="s")return overview();return _stats.apply(this,arguments)}}

// Settings, grouped. Same data-set / data-do keys and the same handlers as the original (features.js settingsView).
window.settingsView=function(){
 const on=x=>x?"On":"Off",row=(t,d,k,val)=>`<div class="set"><div><b>${t}</b><div class="en" style="font-size:14px">${d}</div></div><button class="btn" data-set="${k}" style="width:auto;min-width:70px">${val}</button></div>`;
 const ss=window.speechSynthesis,nv=ss?ss.getVoices().filter(x=>/^de/i.test(x.lang)):[],ac=AC?AC.state:"not started yet",fz=(ST.fb||0)-(ST.fu||0);
 const grp=(h,body)=>`<section class="set-g"><h3>${h}</h3><div class="box">${body}</div></section>`;
 app.innerHTML=seg()+
 grp("Account",USER?`<div class="set"><div><b>${esc((USER.user_metadata&&USER.user_metadata.username)||"Your account")}</b><div class="en" style="font-size:14px">${esc(USER.email||"")} · progress syncs automatically</div></div><button class="btn" data-m="acct" style="width:auto">Manage</button></div>`:`<div class="set"><div><b>Save your progress</b><div class="en" style="font-size:14px">Log in to sync between devices. Optional.</div></div><button class="btn p" data-m="login" style="width:auto">Log in</button></div>`)+
 grp("Sound and feedback",row("Sound effects","Soft tones for right and wrong answers","snd",on(ST.snd!==false))+row("Tap feedback","A tiny tick and vibration when you tap (vibration: Android)","hap",on(ST.hap!==false))+row("Auto-play pronunciation","Speak German when an answer is revealed","auto",on(ST.auto))+row("Slow speech","Slower, clearer pronunciation","slow",on(ST.slow))+
  `<div class="set-t"><div class="row"><button class="btn" data-do="tsnd">Test sound</button><button class="btn" data-do="tvoice">Test German voice</button></div><p class="en" style="font-size:13px;margin:10px 0 0">Sound engine: ${ac}. Speech: ${ss?"supported":"not supported"}. German voices found: ${nv.length?nv.map(x=>esc(x.name)).join(", "):"none"}. No sound? Raise the volume, turn off the iPhone silent switch, and open the site in Safari or Chrome instead of inside another app.</p></div>`)+
 grp("Learning",`<div class="set"><div><b>Daily goal</b><div class="en" style="font-size:14px">Reviews per day. Fills the lightning bar at the top.</div></div><select id="gl" aria-label="Reviews per day" style="width:auto">${opts([5,10,20,30].map(n=>[n,n]),ST.goal)}</select></div>`+row("Always show real-life German","Open the casual, spoken version on every card that has one","casual",on(ST.casual)))+
 grp("Astro",row("Show Astro","Astro’s chat button, tips and surprise gifts. Off by default so nothing covers your buttons.","astro",on(ST.astro))+row("Hide Astro’s pop-ups","Turn this on if Astro gets too chatty.","aoff",on(ST.aoff)))+
 grp("Wallet",`<div class="set"><div><b>🪙 ${coins()} coins · ❄️ ${fz} streak freeze${fz==1?"":"s"}</b><div class="en" style="font-size:14px">A streak freeze protects your streak if you miss a day (max 2).</div></div><button class="btn" data-do="buyfz" style="width:auto">Buy · 50 🪙</button></div>`)+
 grp("Data",`<div class="en" style="font-size:14px;margin-bottom:8px">Progress lives in this browser (or your account). Copy the text to keep a backup, paste it back to restore.</div><textarea id="bk" rows="3" aria-label="Backup text" style="width:100%;margin:0 0 8px;font:12px monospace;background:var(--card);color:var(--fg);border:1px solid var(--bd);border-radius:8px"></textarea><div class="row"><button class="btn" data-a="exp">Show backup</button><button class="btn" data-a="imp">Restore</button></div>`)+
 grp("Support and legal",row("Support with ads","Optional and off by default. Clean, non-intrusive ads help keep this free.","ads",on(ST.ads))+`<div class="set-l"><a href="#" data-m="about">About</a><a href="#" data-m="privacy">Privacy</a><a href="#" data-m="support">Support the project</a></div>`);
 const gl=document.getElementById("gl");if(gl)gl.onchange=e=>{ST.goal=+e.target.value;save();topbar()}};

/* ===================================== 6. READ FILTERS ===================================== */
// Topics are derived from each story's title/category text (the raw `cat` strings are too varied to use directly).
const TOPICS=[["Daily life",/daily|routine|home|commut|neighbo|morning|café|cafe|shopping|apartment|housing|mein /i],["Food & family",/food|family|kitchen|cook|bakery|brezel/i],["Sports & music",/sport|football|music|perform|concert|art\b|aesthetic/i],["Travel & nature",/travel|trip|nature|camping|hiking|outdoor|discovery|ausflug/i],["Work & money",/work|job|office|econom|career|stelle|problem solving/i],["Mystery & history",/mystery|suspense|history|1989|detective|police|kafka|zweig|gutenberg/i],["Society & ideas",/society|culture|philosoph|psycholog|stoic|digital|growth|resilience|reflection|communication|conflict|slow german/i]];
const topicOf=s=>{const t=(s.cat||"")+" "+(s.t||"");for(const [n,re] of TOPICS)if(re.test(t))return n;return "Other"};
const wordsOf=s=>s._wc||(s._wc=(s.s||[]).reduce((a,x)=>a+String(x[0]).split(/\s+/).filter(Boolean).length,0));
const LEN=[["any","Any length",()=>true],["short","Short · under 150 words",n=>n<150],["med","Medium · 150 to 400",n=>n>=150&&n<=400],["long","Long · over 400",n=>n>400]];
const F=ST.rf&&typeof ST.rf=="object"?ST.rf:{l:"",len:"any",t:""};
const active=()=>!!(F.l||F.t||(F.len&&F.len!=="any"));
const fmatch=s=>(!F.l||s.l==F.l)&&(!F.t||topicOf(s)===F.t)&&LEN.find(x=>x[0]===F.len)[2](wordsOf(s));
const chip=(k,v,label,on)=>`<button type="button" class="chip rf${on?" on":""}" data-rf="${k}:${v}" aria-pressed="${on}">${label}</button>`;
function filterBar(){
 const topics=[...new Set(STORY.map(topicOf))].sort(),n=STORY.filter(fmatch).length;
 const sum=[F.l||"All levels",(LEN.find(x=>x[0]===F.len)||LEN[0])[1].split(" ·")[0],F.t||"All topics"].join(" · ");
 return`<details class="ux-f rf-box"${active()?" open":""}><summary><b>Filter stories</b><span>${sum}</span></summary><div class="ux-in">
  <div class="rf-l">Level</div><div>${chip("l","","All",!F.l)}${["A1","A2","B1","B2"].map(l=>chip("l",l,l,F.l===l)).join("")}</div>
  <div class="rf-l">Length (words)</div><div>${LEN.map(([k,lab])=>chip("len",k,lab.split(" ·")[0],F.len===k)).join("")}</div>
  <div class="rf-l">Topic</div><div>${chip("t","","All",!F.t)}${topics.map(t=>chip("t",t,t,F.t===t)).join("")}</div>
  ${active()?`<button type="button" class="btn" data-rf="clear:" style="margin-top:10px">Clear filters</button>`:""}</div></details>
 ${active()?`<p class="en rf-n">${n} ${n==1?"story matches":"stories match"}</p>`:""}`}
function resultList(){
 const L=STORY.map((s,k)=>[s,k]).filter(x=>fmatch(x[0]));
 if(!L.length)return`<div class="note"><b>No stories match</b><div class="en" style="font-size:14px">Try a different length or topic, or clear the filters.</div></div>`;
 return L.map(([s,k])=>`<button class="item" data-st="${k}"><span style="min-width:0"><b>${s.e||"📖"} ${esc(s.t)}</b><span class="en" style="display:block;font-size:13px">${s.l} · ${topicOf(s)} · ${wordsOf(s)} words${s.min?" · "+s.min+" min":""}</span></span><span class="tg" style="margin:0 0 0 10px">${rdone(s)?"✓":"›"}</span></button>`).join("")}
{const _rv=readView;window.readView=function(){
 _rv.apply(this,arguments);
 if(rs>=0||rl)return;                                   // only on the Read home (not inside a story or a level list)
 const box=document.querySelector("#app>.box");if(!box)return;
 const intro=box.querySelector("p.en");
 const hold=document.createElement("div");hold.innerHTML=filterBar();while(hold.lastChild)intro?intro.after(hold.lastChild):box.prepend(hold.lastChild);
 if(active()){box.querySelectorAll(":scope>.item[data-rl]").forEach(x=>x.remove());const res=document.createElement("div");res.id="rf-res";res.innerHTML=resultList();const links=box.querySelector(".note");links?links.before(res):box.append(res)}
}}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-rf]");if(!b)return;e.preventDefault();
 const [k,v]=b.dataset.rf.split(":");
 if(k==="clear"){F.l="";F.len="any";F.t=""}else if(k==="l")F.l=F.l===v?"":v;else if(k==="len")F.len=v||"any";else if(k==="t")F.t=F.t===v?"":v;
 ST.rf=F;try{save()}catch(x){}readView()});
})();
