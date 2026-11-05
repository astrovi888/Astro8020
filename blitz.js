// =====================================================================================================================
// Astrolingo WORD MATCH BLITZ OVERHAUL (blitz.js, v1). Pure addition, loaded after features.js. Delete this file and its
// <script> tag and the old Blitz comes back.
//
// WHAT WAS WRONG (features.js, "Word Match Blitz"): two fixed columns of 6 tiles. When you matched a pair the NEW word
// was written into the exact same screen position (MG.L[a]=nw), and the whole grid was re-rendered with innerHTML after
// every tap. Result: the same spots refilled instantly, nothing moved, and the board flickered.
//
// WHAT THIS CHANGES
//  1. SLOTS. Each column has 7 fixed rows (slots) but only ~5 words are visible, so there are always empty spaces.
//  2. NO REPEATED POSITIONS. A new word goes into a random EMPTY slot that was NOT used by the last 3 spawns on that side
//     (MG.hist), so words keep appearing in new places instead of refilling the same hole.
//  3. DELAYED SPAWNS. After a match the replacement does not appear at once: the German word appears after 350-900 ms and
//     its English partner 150-450 ms later, in a different place. The board breathes instead of snapping.
//  4. FLUID MOTION. Tiles scale/fade in; a matched pair glows green then shrinks out; a wrong pair shakes red. All DOM
//     nodes are kept (no innerHTML rebuild per tap), and only transform/opacity are animated (GPU, 60/120 Hz).
//  5. Same game rules as before: 60 s (ST.mt), +1 per pair, wrong pair costs 2 s, 500 most common words, same end screen,
//     leaderboard and XP (mgEnd/mgBoard/mgSubmit are the original functions, untouched).
//
// HOW IT HOOKS IN: re-declares mgStart/mgGrid/mgTap (the original click handler calls mgTap("L"|"R", slotIndex), so
// data-mg="L3" now means "left column, slot 3") and wraps mgStop/mgEnd to cancel pending spawn timers.
// TUNING: SLOTS (rows), SHOW (words on screen at once), the delay ranges inside spawnPair().
// =====================================================================================================================
(function(){
"use strict";
const SLOTS=7,SHOW=5,ROW=58,HIST=3;
const rnd=(a,b)=>a+Math.random()*(b-a),later=(fn,ms)=>{if(!MG)return;const id=setTimeout(()=>{if(MG&&!MG.done)fn()},ms);MG.tm.push(id);return id};
const snd=n=>{try{sfx[n]()}catch(e){}};
const label=(s,w)=>s=="L"?`${w.art?`<span class="${w.art}">${w.art}</span> `:""}${w.de}`:esc(eshort(w));

// ---- choosing what appears and where ----
function visibleRanks(){const r=new Set();["L","R"].forEach(s=>MG.slots[s].forEach(t=>{if(t)r.add(t.w.rank)}));return r}
function visibleEn(){const e=new Set();MG.slots.R.forEach(t=>{if(t)e.add(eshort(t.w))});return e}
function pickWord(){const used=visibleRanks(),en=visibleEn();
 for(let n=0;n<200;n++){const w=MG.pool[(Math.random()*MG.pool.length)|0];if(!used.has(w.rank)&&!MG.pend.has(w.rank)&&!en.has(eshort(w)))return w}
 return null}
// Random empty slot that was not among the last HIST slots used on this side (falls back to any empty slot).
function pickSlot(side){const free=[];MG.slots[side].forEach((t,k)=>{if(!t&&!MG.res[side].has(k))free.push(k)});if(!free.length)return -1;
 const fresh=free.filter(k=>!MG.hist[side].includes(k)),from=fresh.length?fresh:free,k=from[(Math.random()*from.length)|0];
 MG.hist[side].push(k);if(MG.hist[side].length>HIST)MG.hist[side].shift();return k}

// ---- DOM: one persistent element per tile ----
function place(side,w){
 const k=pickSlot(side);if(k<0)return false;
 const col=document.getElementById("mg"+side);if(!col)return false;
 const el=document.createElement("button");el.type="button";el.className="tile mgt in";el.dataset.mg=side+k;el.style.setProperty("--r",k);
 el.innerHTML=`<span>${label(side,w)}</span>`;col.appendChild(el);   // inner <span>: the tile is display:flex, so without it the space after der/die/das is lost
 MG.slots[side][k]={w,el,busy:false};snd("spawn");
 el.addEventListener("animationend",()=>el.classList.remove("in"),{once:true});
 return true}
function spawnPair(delay){
 const w=pickWord();if(!w)return;MG.pend.add(w.rank);
 const dl=delay+rnd(0,120),dr=dl+rnd(150,450);
 // The pair is two timers: if one side has no free slot yet we retry shortly rather than drop the word.
 const tryPlace=(side,ms,tries)=>later(()=>{if(!place(side,w)&&tries<8)tryPlace(side,350,tries+1)},ms);
 tryPlace("L",dl,0);tryPlace("R",dr,0);
 later(()=>MG.pend.delete(w.rank),dr+700)}

// ---- selection and matching ----
function clearSel(){if(!MG.sel)return;const t=MG.slots[MG.sel.s][MG.sel.k];if(t)t.el.classList.remove("sel");MG.sel=null}
function release(side,k){const t=MG.slots[side][k];if(!t)return;t.busy=true;
 t.el.classList.remove("sel");t.el.classList.add("out");
 setTimeout(()=>{if(t.el.parentNode)t.el.remove();if(MG&&MG.slots[side][k]===t)MG.slots[side][k]=null},300)}
window.mgTap=function(s,k){
 if(!MG||MG.done)return;const t=MG.slots[s][k];if(!t||t.busy)return;
 if(!MG.sel||MG.sel.s===s){
  if(MG.sel&&MG.sel.s===s&&MG.sel.k===k){clearSel();return}   // tap the selected tile again: deselect
  clearSel();MG.sel={s,k};t.el.classList.add("sel");return}
 const o=MG.slots[MG.sel.s][MG.sel.k],L=s==="L"?t:o,R=s==="R"?t:o;clearSel();
 if(!o||o.busy)return;
 if(L.w.rank===R.w.rank){
  MG.score++;const sc=document.getElementById("ms");if(sc)sc.textContent=MG.score;snd("match");try{flash("ok")}catch(e){}
  [L,R].forEach(x=>x.el.classList.add("ok"));
  const lk=+L.el.dataset.mg.slice(1),rk=+R.el.dataset.mg.slice(1);
  MG.res.L.add(lk);MG.res.R.add(rk);                                   // reserve the freed slots briefly so the next word lands elsewhere
  setTimeout(()=>{release("L",lk);release("R",rk)},140);
  setTimeout(()=>{MG&&MG.res.L.delete(lk);MG&&MG.res.R.delete(rk)},700);
  later(()=>spawnPair(0),rnd(350,900));                               // DELAYED replacement
 }else{
  MG.end-=2000;snd("miss");try{shake();flash("no")}catch(e){}
  [L,R].forEach(x=>{x.el.classList.remove("no");void x.el.offsetWidth;x.el.classList.add("no");setTimeout(()=>x.el.classList.remove("no"),520)})}
}
window.mgGrid=function(){};   // the old full re-render is gone; kept as a no-op in case anything still calls it

window.mgStart=function(){
 mgStop();
 MG={pool:mgPool(),slots:{L:Array(SLOTS).fill(null),R:Array(SLOTS).fill(null)},hist:{L:[],R:[]},res:{L:new Set(),R:new Set()},pend:new Set(),tm:[],
  sel:null,score:0,end:Date.now()+(ST.mt||60)*1000,done:false,iv:0,L:[],R:[]};
 app.innerHTML=`<div class="box"><div class="meta"><button type="button" class="chip" data-do="mgagain" style="margin:0">← Quit</button><span>Matched <b id="ms" style="color:var(--fg)">0</b></span><span id="mt">60s</span></div>
 <div class="bar mgbar"><i id="mgbar" style="width:100%;animation:none"></i></div>
 <div class="mg2" style="--rows:${SLOTS};--row:${ROW}px"><div id="mgL" class="mgc"></div><div id="mgR" class="mgc"></div></div></div>`;
 MG.iv=setInterval(mgTick,200);
 for(let n=0;n<SHOW;n++)spawnPair(n*300)          // staggered start: words drift in one after another
};

// cancel pending spawns whenever the game stops or ends
{const _stop=mgStop;window.mgStop=function(){if(MG&&MG.tm)MG.tm.forEach(clearTimeout);_stop()}}
{const _end=mgEnd;window.mgEnd=function(){if(MG&&MG.tm)MG.tm.forEach(clearTimeout);return _end.apply(this,arguments)}}
// last-5-seconds tick (uses the existing 200 ms timer: wrap mgTick)
{let lastS=-1;const _tick=mgTick;window.mgTick=function(){_tick();if(!MG||MG.done)return;const s=Math.ceil(Math.max(0,(MG.end-Date.now())/1000));if(s<=5&&s>0&&s!==lastS){lastS=s;snd("tick")}if(s>5)lastS=-1}}

// ---- styles (transform/opacity only; reduced motion = instant) ----
const st=document.createElement("style");st.textContent=`
.mg2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}
.mgc{position:relative;height:calc(var(--rows)*var(--row))}
.mgt{position:absolute;left:0;right:0;top:calc(var(--r)*var(--row));height:calc(var(--row) - 8px);min-height:0;padding:0 8px;display:flex;align-items:center;justify-content:center;text-align:center;line-height:1.15;overflow:hidden;
 transition:border-color .2s,box-shadow .25s,background-color .25s,opacity .28s var(--ease-out,ease),transform .28s var(--ease-out,ease)}
@keyframes mg-in{from{opacity:0;transform:translate3d(0,10px,0) scale(.82)}}
@keyframes mg-no{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}45%{transform:translateX(6px)}70%{transform:translateX(-3px)}}
.mgt.in{animation:mg-in .34s var(--ease-spring,cubic-bezier(.34,1.56,.64,1))}
.mgt.sel{border-color:var(--ac);box-shadow:0 0 0 3px color-mix(in srgb,var(--ac) 22%,transparent)}
.mgt.ok{border-color:var(--das);background:color-mix(in srgb,var(--das) 18%,var(--card))}
.mgt.out{opacity:0;transform:scale(.7);pointer-events:none}
.mgt.no{border-color:#dc2626;background:color-mix(in srgb,#dc2626 14%,var(--card));animation:mg-no .4s ease-out}
.mgt:active{transform:scale(.97)}.mgt.out:active{transform:scale(.7)}
.mgbar{margin-bottom:0}
@media (prefers-reduced-motion:reduce){.mgt,.mgt.in,.mgt.no{animation:none!important;transition:none!important}}`;
document.head.appendChild(st);
})();
