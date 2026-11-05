// =====================================================================================================================
// Astrolingo MIXED-FORMAT QUIZ ENGINE (quiz.js, v1). Pure addition, loaded after course.js. Delete this file (and the small
// `QUIZ` hooks in course.js) to go back to multiple-choice only.
//
// WHY: tests and practice were one format (multiple choice). Varied, short, instantly-rewarded tasks keep attention (this is
// also what makes the format friendlier for ADHD): every question takes ~10 to 25 seconds, gives feedback at once, and the
// format changes from question to question so it never gets monotonous.
//
// FORMATS (all generated from the existing sentence list S, nothing new to maintain):
//   mcq    choose the meaning / choose the German            (kept as the original course.js format)
//   build  tap the German words in the right order           (word order = the hardest part of German, trained actively)
//   cloze  a sentence with one word missing, pick it
//   listen hear the sentence (German voice), pick what you heard
//   type   see the English, type the German (umlauts optional: ae = ä, ss = ß are accepted)
//
// PUBLIC API (window.QUIZ)
//   QUIZ.fromSentence(k, kind) -> question object for sentence S[k]      (used by course.js buildTest for level tests)
//   QUIZ.mount(host, q, done, cb) -> draws question q into element host. done=true draws the solved/locked state.
//                                    cb(ok:boolean) is called once, when the learner answers.
//   QUIZ.start() -> a stand-alone "Quick mixed quiz": 8 mixed questions, lightning-bolt streak, micro-praise, XP at the end.
//
// QUESTION OBJECTS: {t, lab, p?, o?, a?, words?, bank?, say?, ans?, de, en}; de/en are the German/English of the source sentence.
// To add a format: add a case in make() (build the object), mount() (draw it) and check() (decide right/wrong).
// =====================================================================================================================
(function(){
"use strict";
const $=id=>document.getElementById(id);
const sh=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const nrm=s=>String(s).toLowerCase().replace(/ß/g,"ss").replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/[.,!?;:„“”"'’‘¿¡()\-–—]/g," ").replace(/\s+/g," ").trim();
const tokens=s=>String(s).trim().split(/\s+/).filter(Boolean);
const E=s=>(typeof esc=="function"?esc(s):String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])));
const snd=n=>{try{sfx[n]()}catch(e){}};
const canSpeak=()=>"speechSynthesis" in window;

/* ----------------------------------------------- building questions ----------------------------------------------- */
function pool(){const L=(typeof learned=="function"?learned():[]).filter(k=>S[k]);
 if(L.length>=10)return L;
 const a1=S.map((s,k)=>k).filter(k=>S[k][3]=="A1");return a1.length?a1:S.map((s,k)=>k)}
const short=(k,max)=>tokens(S[k][0]).length<=max;
function distract(k,n,test){const p=pool().filter(x=>x!=k&&S[x][0]!=S[k][0]&&(!test||test(S[x])));return sh(p).slice(0,n)}

// kind: "build" | "cloze" | "listen" | "type" | "mcq"
function make(k,kind){
 const s=S[k],de=s[0],en=s[1];
 if(kind=="build"){const w=tokens(de);if(w.length<3||w.length>9)return null;
  return{t:"build",lab:"Build the German sentence",p:en,words:w,bank:sh(w),de,en}}
 if(kind=="cloze"){const w=tokens(de),cand=w.map((x,i)=>[x,i]).filter(([x])=>x.replace(/[.,!?]/g,"").length>=4&&/^[A-Za-zÄÖÜäöüß]+[.,!?]?$/.test(x));
  if(w.length<3||!cand.length)return null;const [word,idx]=cand[(Math.random()*cand.length)|0],bare=word.replace(/[.,!?]$/,"");
  const others=sh(pool().flatMap(x=>tokens(S[x][0])).map(x=>x.replace(/[.,!?]$/,"")).filter(x=>x.length>=4&&x!==bare&&/^[A-Za-zÄÖÜäöüß]+$/.test(x)&&(x[0]===x[0].toUpperCase())===(bare[0]===bare[0].toUpperCase()))),
   o=sh([bare,...[...new Set(others)].slice(0,2)]);if(o.length<3)return null;
  const gap=w.slice();gap[idx]=word.replace(bare,"_____");
  return{t:"cloze",lab:"Fill the gap",p:gap.join(" "),o,a:o.indexOf(bare),de,en,sub:en}}
 if(kind=="listen"){if(!canSpeak())return null;const d=distract(k,2,x=>Math.abs(tokens(x[0]).length-tokens(de).length)<=3);if(d.length<2)return null;
  const o=sh([de,...d.map(x=>S[x][0])]);return{t:"listen",lab:"Listen, then choose what you heard",say:de,o,a:o.indexOf(de),de,en}}
 if(kind=="type"){return{t:"type",lab:"Type it in German",p:en,ans:de,de,en}}
 // mcq: alternate meaning / German
 const toDe=Math.random()<.5,f=toDe?0:1,d=distract(k,3,x=>x[f]!=s[f]);if(d.length<3)return null;
 const o=sh([s[f],...d.map(x=>S[x][f])]);return{t:"mcq",lab:toDe?"Choose the German":"Choose the meaning",p:toDe?en:de,o,a:o.indexOf(s[f]),de,en}}

// n mixed questions, never the same format twice in a row
function build(n){const kinds=["mcq","build","cloze","listen","type"],ks=sh(pool()),qs=[];let last="";
 for(const k of ks){if(qs.length>=n)break;
  const order=sh(kinds).sort((a,b)=>(a==last)-(b==last));
  for(const kd of order){const q=make(k,kd);if(q){qs.push(q);last=kd;break}}}
 return qs}

/* ----------------------------------------------- checking answers ----------------------------------------------- */
const check=(q,given)=>q.t=="build"?nrm(given.join(" "))==nrm(q.words.join(" ")):q.t=="type"?nrm(given)==nrm(q.ans):given===q.a;

/* ----------------------------------------------- drawing one question ----------------------------------------------- */
let CUR=null;   // the question currently on screen: {q, cb, host, done, placed:[], given}
function mount(host,q,done,cb){
 CUR={q,cb,host,done:!!done,placed:q._given&&q.t=="build"?q._given.slice():[],answered:!!done};
 const lock=!!done,g=q._given;
 let h="";
 if(q.t=="mcq"||q.t=="cloze"||q.t=="listen"){
  if(q.t=="listen")h+=`<div style="margin:8px 0"><button type="button" class="btn p" data-qz="say" aria-label="Play the sentence">🔊 Play</button> <button type="button" class="btn" data-qz="slow" style="width:auto" aria-label="Play slowly">🐢 Slow</button></div>`;
  else h+=`<div class="qz-q">${E(q.p)}</div>${q.sub?`<div class="en" style="margin:-6px 0 10px;font-size:15px">${E(q.sub)}</div>`:""}`;
  h+=q.o.map((o,j)=>`<button type="button" class="btn qz-o${lock?(j==q.a?" ok":j===g?" no":""):""}" data-qz="o:${j}" ${lock?"disabled":""}>${E(o)}</button>`).join("")}
 else if(q.t=="build"){
  h+=`<div class="qz-q">${E(q.p)}</div><div class="qz-ans" id="qz-ans" aria-label="Your sentence">${CUR.placed.map((w,i)=>`<button type="button" class="qz-b" data-qz="un:${i}" ${lock?"disabled":""}>${E(w)}</button>`).join("")}</div>
   <div class="qz-bank" id="qz-bank">${q.bank.map((w,i)=>`<button type="button" class="qz-b" data-qz="pl:${i}" data-w="${E(w)}">${E(w)}</button>`).join("")}</div>
   ${lock?"":`<button type="button" class="btn p" data-qz="chk" id="qz-chk" disabled>Check</button>`}`}
 else if(q.t=="type"){
  h+=`<div class="qz-q">${E(q.p)}</div><input id="qz-in" class="qz-in" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" lang="de" placeholder="Schreib auf Deutsch…" value="${lock?E(g||""):""}" ${lock?"disabled":""}>
   ${lock?"":`<button type="button" class="btn p" data-qz="chk" style="margin-top:10px">Check</button><p class="en" style="font-size:12px;margin:8px 0 0">Tip: you can type ae, oe, ue, ss instead of ä, ö, ü, ß.</p>`}`}
 host.innerHTML=h;
 if(lock&&q.t=="build"){host.querySelectorAll("#qz-bank .qz-b").forEach(b=>b.classList.add("used"))}
 if(q.t=="build")sync();
 if(q.t=="listen"&&!lock)setTimeout(()=>say(false),250);
 if(q.t=="type"&&!lock){const i=$("qz-in");if(i)setTimeout(()=>i.focus(),150)}
}
function say(slow){try{if(typeof speak=="function")speak(CUR.q.say,!!slow)}catch(e){}}
// build: re-draw the answer line and keep the bank in sync (a used word is greyed, not removed, so nothing jumps around)
function sync(){if(!CUR||CUR.q.t!="build")return;const q=CUR.q,ans=$("qz-ans"),bank=$("qz-bank"),chk=$("qz-chk");if(!ans||!bank)return;
 const used=[];ans.innerHTML=CUR.placed.map((w,i)=>{used.push(w);return`<button type="button" class="qz-b" data-qz="un:${i}" ${CUR.done?"disabled":""}>${E(w)}</button>`}).join("");
 const cnt={};used.forEach(w=>cnt[w]=(cnt[w]||0)+1);const seen={};
 [...bank.children].forEach(b=>{const w=b.dataset.w;seen[w]=(seen[w]||0)+1;b.classList.toggle("used",seen[w]<=(cnt[w]||0))});
 if(chk)chk.disabled=CUR.placed.length!==q.words.length}
function finish(given){
 if(!CUR||CUR.answered)return;CUR.answered=true;const q=CUR.q,ok=check(q,given);q._given=given;
 if(q.t=="mcq"||q.t=="cloze"||q.t=="listen"){CUR.host.querySelectorAll(".qz-o").forEach((b,j)=>{b.disabled=true;if(j==q.a)b.classList.add("ok");else if(j===given)b.classList.add("no")})}
 else if(q.t=="type"){const i=$("qz-in");if(i)i.disabled=true}
 else if(q.t=="build"){CUR.host.querySelectorAll(".qz-b").forEach(b=>b.disabled=true)}
 try{if(ok)snd("good");else snd("bad");if(typeof microPraise=="function")microPraise(ok)}catch(e){}
 CUR.cb&&CUR.cb(ok,given)}

document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-qz]");if(!b)return;const a=b.dataset.qz;
 if(a=="start"){start();return}
 if(a=="say"){say(false);return}if(a=="slow"){say(true);return}
 if(a=="quit"){const h=document.querySelector('#bbar [data-g="c"]');h&&h.click();return}
 if(a=="again"){start();return}
 if(a=="next"){nextQ();return}
 if(!CUR||CUR.done||CUR.answered)return;
 if(a.startsWith("o:"))finish(+a.slice(2));
 else if(a.startsWith("pl:")){const w=b.dataset.w;CUR.placed.push(w);sync();snd("tap")}
 else if(a.startsWith("un:")){CUR.placed.splice(+a.slice(3),1);sync()}
 else if(a=="chk"){if(CUR.q.t=="build"){if(CUR.placed.length===CUR.q.words.length)finish(CUR.placed.slice())}else{const i=$("qz-in");if(i&&i.value.trim())finish(i.value)}}
});
document.addEventListener("keydown",e=>{if(e.key=="Enter"&&e.target&&e.target.id=="qz-in"&&CUR&&!CUR.answered){e.preventDefault();const v=e.target.value.trim();if(v)finish(v)}});

/* ----------------------------------------------- the stand-alone quick quiz ----------------------------------------------- */
let Q=null;
function start(){
 const qs=build(8);if(qs.length<4){if(typeof pop=="function")pop("Learn a few more sentences first, then the quiz unlocks");return}
 Q={qs,i:0,ok:0,combo:0,best:0,t0:Date.now()};CUR=null;view()}
function view(){
 if(!Q)return;const q=Q.qs[Q.i],app=$("app");
 app.innerHTML=`<div class="box"><div class="qz-top"><button type="button" class="chip" data-qz="quit" style="margin:0">← Quit</button><div class="bar"><i style="width:${Q.i/Q.qs.length*100}%"></i></div><span class="qz-bolts" aria-label="${Q.combo} in a row">${Q.combo?"⚡".repeat(Math.min(Q.combo,5)):"·"}</span></div>
  <div class="qz-l">${E(q.lab)} · ${Q.i+1} of ${Q.qs.length}</div><div id="qz-host"></div><div id="qz-fb"></div></div>`;
 mount($("qz-host"),q,false,(ok)=>{
  if(ok){Q.ok++;Q.combo++;Q.best=Math.max(Q.best,Q.combo)}else Q.combo=0;
  const fb=$("qz-fb");fb.innerHTML=`<div class="qz-fb ${ok?"ok":"no"}"><b>${ok?"Richtig!":"Not quite."}</b><div>${E(q.de)}</div><div class="en" style="font-size:15px">${E(q.en)}</div></div><button type="button" class="btn p" data-qz="next" style="margin-top:12px">${Q.i+1>=Q.qs.length?"See result":"Next"}</button>`;
  const bolts=document.querySelector(".qz-bolts");if(bolts)bolts.textContent=Q.combo?"⚡".repeat(Math.min(Q.combo,5)):"·"})}
function nextQ(){if(!Q)return;Q.i++;if(Q.i>=Q.qs.length)return result();view()}
function result(){
 const n=Q.qs.length,pc=Math.round(Q.ok/n*100),xp=3+Q.ok*2;let gained=0;try{const g0=ST.xp;addXP(xp);gained=ST.xp-g0||xp}catch(e){gained=xp}
 try{snd(pc>=70?"level":"done");if(pc>=70&&typeof burst=="function")burst()}catch(e){}
 $("app").innerHTML=`<div class="box cr-end"><div style="text-align:center">${typeof astroPose=="function"?astroPose(pc>=70?"celebrate":"think",96):""}</div>
  <div class="sent" style="min-height:0;text-align:center">${pc>=70?"Great round!":"Good practice!"}</div>
  <div class="grid"><div class="stat"><b>${Q.ok}/${n}</b><span>correct</span></div><div class="stat"><b>⚡ ${Q.best}</b><span>best streak</span></div><div class="stat"><b>+${gained}</b><span>XP</span></div><div class="stat"><b>${Math.max(1,Math.round((Date.now()-Q.t0)/60000))} min</b><span>time</span></div></div>
  <div class="row" style="margin-top:14px"><button type="button" class="btn" data-qz="quit">Back</button><button type="button" class="btn p" data-qz="again">Another round</button></div></div>`;
 Q=null}

window.QUIZ={fromSentence:make,mount,start,make:build,nrm};
// A card on the Learn home (insights.js / speak.js use the same CRX hook).
window.CRX=window.CRX||{top:[],mid:[]};(window.CRX.mid=window.CRX.mid||[]).push(()=>`<div class="box" style="margin-top:14px"><b>⚡ Quick mixed quiz</b><p class="en" style="margin:2px 0 10px;font-size:14px">8 short questions: build sentences, fill gaps, listen, type. About 3 minutes.</p><button type="button" class="btn p" data-qz="start">Start</button></div>`);
})();
