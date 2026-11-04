// =====================================================================================================================
// Astrolingo READ-ALONG + READ-ALOUD + PRONUNCIATION LAB   (readalong.js, v1)
// Pure addition: loaded last in index.html. It wraps storyView() / readView() / render() and does not edit other files.
// If this file is removed, the site works exactly as before.
//
// THREE FEATURES
//  1. LISTEN ALONG (stories): ▶ plays the story with the German voice. The word being spoken lights up (yellow), words
//     already spoken turn bright, the rest stay dim, like synced lyrics. ■ Stop, ⏸ Pause (continue later from the same
//     word), 🐢 slow. While a session is running, TAP ANY WORD to jump there and keep reading from that word.
//  2. READ ALOUD (stories): 🎤 you read each line, the mic follows you. Words you said correctly turn green as you say them,
//     words you missed turn red and wiggle. A line counts at >= 80% of the words. Pass = +3 XP (once per line, ever) and the
//     next line starts by itself. Fail = "Try again" or "Skip line". Whole story read aloud = +10 XP once.
//  3. PRONUNCIATION LAB (screen opened from a card on the Read screen, or window.openPronLab()): sound drills (ü/ö, ch, sch,
//     z, r, ei/ie/eu, ä) plus a drill of real sentences. Hear the model, say it, get green/red per item and a score.
//
// HOW HIGHLIGHTING WORKS (read before changing)
//  - While a session runs, each story line's German text is replaced by <span class="rw" data-w="N"> word spans (that is what
//    lets us colour, wiggle and tap single words). The original HTML (with the gender colours and word-tap) is saved in
//    el._orig and put back by stopS(). So nothing else on the page is permanently changed.
//  - Speech comes from speechSynthesis (browser text-to-speech). Word timing comes from the "boundary" events. iOS Safari
//    often does not fire them, so if none arrives within 0.9 s we ESTIMATE the timing from word length (see runEst()).
//    pause()/resume() are unreliable on iOS, so "pause" = cancel + remember the word, "resume" = speak again from there.
//  - Listening uses SpeechRecognition (Chrome, Edge, Safari 14.5+, needs HTTPS + mic permission). One recognition run per
//    line (not continuous): it is much more reliable on phones. Without SpeechRecognition the READ ALOUD and LAB buttons
//    explain it and the lab falls back to a self-check ("I said it" / "Again").
//  - Matching is forgiving on purpose (recognizers are imperfect): case, punctuation and umlauts are ignored
//    (ä=a, ö=o, ü=u, ß=ss) and ONE letter of difference is allowed in words of 5+ letters. See wordOK() and align().
//
// DATA STORED (all optional, synced like the rest of ST)
//  ST.rdl = { "<story title>#<line>": 1 }   lines already rewarded (so XP can't be farmed)
//  ST.rdb = { "<story title>": 1 }          stories already given the whole-story bonus
//  ST.pr  = { "<drill id>": {best:0-100, day:"YYYY-MM-DD", xpDay:"YYYY-MM-DD"} }  lab results
//  If you want these to sync between devices, add "rdl","rdb","pr" to the object-merge list in sync.js (next to "sp").
//
// NEXT STEPS / KNOWN LIMITS (also in READALONG_NOTES.md)
//  - Dialogues (path.js DG) do not have the bar yet: call raAttach(containerEl, linesArray) from there (see attach()).
//  - German numbers: the recognizer may write "3" for "drei"; digits are not converted yet (see norm()).
//  - Per-word accuracy is a yes/no. A real phoneme-level score needs a server (not possible on a static site).
//  - Add more drills in DRILLS below: {id, t:title, tip, items:[[german, english], ...]}.
// =====================================================================================================================
(function(){
"use strict";
const $=id=>document.getElementById(id),esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const SR=window.SpeechRecognition||window.webkitSpeechRecognition,synth=window.speechSynthesis;
const today=()=>new Date().toISOString().slice(0,10),reduced=()=>matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches;
const xp=n=>{try{if(typeof addXP==="function")addXP(n)}catch(e){}};
const sv=()=>{try{save()}catch(e){}};

/* ---------------------------------------- styles ---------------------------------------- */
const st=document.createElement("style");st.textContent=`
.ra-bar{position:sticky;top:0;z-index:5;background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:10px;margin:8px 0}
.ra-bar .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.ra-bar .btn{width:auto;padding:8px 12px;margin:0}
.ra-msg{font-size:13px;opacity:.75;margin-top:6px;min-height:18px}
.ra-on .ln .de{color:var(--mut)}
.rw{border-radius:4px;transition:color .15s,background-color .15s;cursor:pointer}
.rw.done{color:var(--fg)}.rw.now{background:#ffd24a;color:#111}
.rw.ok{color:#4ade80;font-weight:600}.rw.bad{color:#f87171;font-weight:600;display:inline-block;animation:ra-wig .35s 2}
.ra-line{outline:2px solid var(--der);outline-offset:3px;border-radius:6px}
@keyframes ra-wig{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
@media (prefers-reduced-motion:reduce){.rw.bad{animation:none}.rw{transition:none}}
.lab-w{font-size:34px;font-weight:700;text-align:center;margin:14px 0 4px}.lab-e{text-align:center;opacity:.7;margin-bottom:12px}`;
document.head.appendChild(st);

/* ---------------------------------------- matching ---------------------------------------- */
// norm(): lower-case, strip punctuation, fold umlauts. "Schön," -> "schon"
const norm=s=>String(s).toLowerCase().replace(/ä/g,"a").replace(/ö/g,"o").replace(/ü/g,"u").replace(/ß/g,"ss").replace(/[^a-z0-9]/g,"");
function lev(a,b){const m=a.length,n=b.length,d=[];for(let i=0;i<=m;i++){d[i]=[i];}for(let j=1;j<=n;j++)d[0][j]=j;
 for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]==b[j-1]?0:1));return d[m][n]}
// wordOK(expected, heard): same word, or one letter off in a word of 5+ letters
function wordOK(e,h){e=norm(e);h=norm(h);if(!e||!h)return false;if(e==h)return true;return e.length>=5&&lev(e,h)<=1}
// align(expectedTokens, heardWords, finalised): greedy left-to-right. Returns {st:[ "ok"|"bad"|"" per expected word ], p:pointer}
//  - a heard word that matches expected[p] -> ok
//  - matches expected[p+1] -> expected[p] was skipped -> bad, then ok
//  - otherwise the heard word is noise or a mispronunciation: ignored while still listening (interim),
//    but when finalised every expected word that was never matched becomes "bad".
function align(exp,heard,fin){const st=exp.map(()=>"");let p=0;
 for(const h of heard){if(p>=exp.length)break;
  if(wordOK(exp[p],h)){st[p]="ok";p++}
  else if(p+1<exp.length&&wordOK(exp[p+1],h)){st[p]="bad";st[p+1]="ok";p+=2}}
 if(fin)for(let i=0;i<exp.length;i++)if(!st[i])st[i]="bad";
 return{st,p}}
window.__ra={norm,wordOK,align};   // for tests

/* ---------------------------------------- session state ---------------------------------------- */
let ses=null;   // {story, k, lines:[{el,toks,orig}], mode:"listen"|"read", li, wi, rate, tok, paused, tries, rec}
const bar=()=>$("ra-bar"),msg=t=>{const m=document.querySelector("#ra-bar .ra-msg");if(m)m.textContent=t||""};
function wrapLines(story){
 const els=[...document.querySelectorAll("#app .ln .de")];
 return els.map((el,i)=>{const raw=story.s[i]?story.s[i][0]:el.textContent,toks=raw.split(/\s+/).filter(Boolean);
  if(el._orig==null)el._orig=el.innerHTML;
  el.innerHTML=toks.map((t,j)=>`<span class="rw" data-w="${j}">${esc(t)}</span>`).join(" ");
  return{el,toks,spans:[...el.querySelectorAll(".rw")]}})}
function unwrap(){if(!ses)return;ses.lines.forEach(l=>{if(l.el._orig!=null){l.el.innerHTML=l.el._orig;l.el._orig=null;l.el.classList.remove("ra-line")}});
 const a=$("app");if(a)a.classList.remove("ra-on")}
function mark(li,wi){ // listen mode colouring: earlier lines done, current word "now"
 ses.lines.forEach((l,i)=>l.spans.forEach((s,j)=>{const done=i<li||(i==li&&j<wi);s.classList.toggle("done",done);s.classList.toggle("now",i==li&&j==wi)}));
 const el=ses.lines[li]&&ses.lines[li].el;if(el)el.scrollIntoView({block:"center",behavior:reduced()?"auto":"smooth"})}
function stopS(silent){if(!ses)return;ses.tok=(ses.tok||0)+1;try{synth&&synth.cancel()}catch(e){}try{ses.rec&&ses.rec.abort()}catch(e){}
 clearTimeout(ses.est);unwrap();ses=null;if(!silent){setBtns("idle");msg("")}}
function setBtns(state){const b=bar();if(!b)return;const q=s=>b.querySelector(s);
 q('[data-ra="listen"]').classList.toggle("hide",state!="idle"&&state!="paused");q('[data-ra="listen"]').textContent=state=="paused"?"▶ Resume":"▶ Listen along";
 q('[data-ra="pause"]').classList.toggle("hide",state!="playing");q('[data-ra="stop"]').classList.toggle("hide",state=="idle");
 q('[data-ra="read"]').classList.toggle("hide",state!="idle");q('[data-ra="again"]').classList.toggle("hide",state!="retry");q('[data-ra="skip"]').classList.toggle("hide",state!="retry")}

/* ---------------------------------------- 1. LISTEN ALONG (text to speech) ---------------------------------------- */
function voice(){try{return typeof deVoice==="function"?deVoice():null}catch(e){return null}}
function startListen(li,wi){
 if(!synth){msg("This browser can't play speech.");return}
 if(!ses||ses.mode!="listen"){stopS(true);const story=STORY[rs];ses={story,lines:wrapLines(story),mode:"listen",rate:ses&&ses.rate||(window.__raSlow?0.75:0.95)};$("app").classList.add("ra-on")}
 ses.mode="listen";ses.paused=false;ses.li=li||0;ses.wi=wi||0;speakLine()}
function speakLine(){
 const my=ses.tok=(ses.tok||0)+1,l=ses.lines[ses.li];
 if(!l){finishListen();return}
 if(ses.wi>=l.toks.length){ses.li++;ses.wi=0;return speakLine()}
 setBtns("playing");mark(ses.li,ses.wi);
 const base=ses.wi,text=l.toks.slice(base).join(" "),starts=[];let o=0;l.toks.slice(base).forEach(t=>{starts.push(o);o+=t.length+1});
 const u=new SpeechSynthesisUtterance(text);u.lang="de-DE";u.rate=ses.rate;const v=voice();if(v)u.voice=v;
 let gotB=false;
 const at=j=>{if(ses&&ses.tok==my){ses.wi=base+j;mark(ses.li,ses.wi)}};
 u.onboundary=e=>{if(e.name&&e.name!=="word")return;gotB=true;clearTimeout(ses&&ses.est);let j=0;for(let i=0;i<starts.length;i++)if(starts[i]<=e.charIndex)j=i;at(j)};
 u.onend=()=>{if(ses&&ses.tok==my){ses.li++;ses.wi=0;speakLine()}};
 u.onerror=()=>{if(ses&&ses.tok==my)msg("Speech stopped. Press ▶ to continue.")};
 synth.cancel();synth.speak(u);
 // fallback timing when the browser sends no word events (common on iPhones)
 ses.est=setTimeout(()=>{if(ses&&ses.tok==my&&!gotB)runEst(my,base)},900)}
function runEst(my,base){ // estimated word timing: ~ 65 ms per letter / rate, minimum 180 ms
 const l=ses.lines[ses.li];let j=1;const step=()=>{if(!ses||ses.tok!=my||j>=l.toks.length-base)return;ses.wi=base+j;mark(ses.li,ses.wi);
  const len=l.toks[base+j-1].length;j++;ses.est=setTimeout(step,Math.max(180,65*len/ses.rate))};
 ses.est=setTimeout(step,Math.max(180,65*l.toks[base].length/ses.rate))}
function finishListen(){const was=ses;stopS(true);setBtns("idle");msg("Finished. Nice listening! 🎧")}
function pauseListen(){if(!ses)return;const li=ses.li,wi=ses.wi,rate=ses.rate;ses.tok++;try{synth.cancel()}catch(e){}clearTimeout(ses.est);ses.paused=true;ses.pauseAt=[li,wi];setBtns("paused");msg("Paused. Tap a word or press Resume.")}

/* ---------------------------------------- 2. READ ALOUD (microphone) ---------------------------------------- */
function startRead(li){
 if(!SR){msg("Your browser can't listen. Try Chrome, or Safari 14.5+ on iPhone.");return}
 if(!ses||ses.mode!="read"){stopS(true);const story=STORY[rs];ses={story,lines:wrapLines(story),mode:"read",tries:0};$("app").classList.add("ra-on")}
 ses.mode="read";ses.li=li||0;ses.tries=0;listenLine()}
function listenLine(){
 const l=ses.lines[ses.li];if(!l){finishRead();return}
 ses.lines.forEach((x,i)=>x.el.classList.toggle("ra-line",i==ses.li));
 l.spans.forEach(s=>s.className="rw");l.el.scrollIntoView({block:"center",behavior:reduced()?"auto":"smooth"});
 setBtns("playing");bar().querySelector('[data-ra="pause"]').classList.add("hide");msg("🎤 Listening… read the highlighted line.");
 const my=ses.tok=(ses.tok||0)+1,rec=new SR();ses.rec=rec;rec.lang="de-DE";rec.interimResults=true;rec.continuous=false;rec.maxAlternatives=1;
 let heard=[],fin=false;
 const paint=(res,final)=>{res.st.forEach((x,i)=>{l.spans[i].className="rw"+(x?" "+x:"")})};
 rec.onresult=e=>{let t="";for(let i=0;i<e.results.length;i++){t+=e.results[i][0].transcript+" ";if(e.results[i].isFinal)fin=true}
  heard=t.trim().split(/\s+/).filter(Boolean);
  const r=align(l.toks,heard,false);r.st=r.st.map(x=>x=="bad"?"":x);paint(r)};   // while speaking: only show greens (interim words can still change)
 rec.onerror=e=>{if(!ses||ses.tok!=my)return;ses.err=e.error;if(e.error=="not-allowed"||e.error=="service-not-allowed")msg("Microphone blocked. Allow it in your browser settings.")};
 rec.onend=()=>{if(!ses||ses.tok!=my)return;
  if(ses.err=="not-allowed"||ses.err=="service-not-allowed"){ses.err=null;setBtns("retry");return}
  const r=align(l.toks,heard,true);paint(r);
  const okN=r.st.filter(x=>x=="ok").length,frac=l.toks.length?okN/l.toks.length:0;
  if(!heard.length){msg("I didn't hear anything. Try again.");setBtns("retry");return}
  if(frac>=0.8){const key=ses.story.t+"#"+ses.li;ST.rdl=ST.rdl||{};if(!ST.rdl[key]){ST.rdl[key]=1;xp(3);sv();msg("✅ Great! +3 XP")}else msg("✅ Great!");
   setTimeout(()=>{if(ses&&ses.tok==my){ses.li++;ses.tries=0;listenLine()}},900)}
  else{ses.tries++;msg(`${Math.round(frac*100)}% right. Red words need another try.`+(ses.tries>=3?" You can skip this line.":""));setBtns("retry")}};
 try{rec.start()}catch(e){msg("Couldn't start the microphone. Press Try again.");setBtns("retry")}}
function finishRead(){const t=ses.story.t;stopS(true);setBtns("idle");ST.rdb=ST.rdb||{};
 if(!ST.rdb[t]){ST.rdb[t]=1;xp(10);sv();msg("🎉 You read the whole story aloud! +10 XP")}else msg("🎉 You read the whole story aloud!")}

/* ---------------------------------------- story screen: the control bar ---------------------------------------- */
function injectBar(){
 const first=document.querySelector("#app .ln");if(!first||bar())return;
 const b=document.createElement("div");b.id="ra-bar";b.className="ra-bar";
 b.innerHTML=`<div class="row"><button type="button" class="btn p" data-ra="listen">▶ Listen along</button><button type="button" class="btn hide" data-ra="pause">⏸ Pause</button><button type="button" class="btn hide" data-ra="stop">■ Stop</button><button type="button" class="btn hide" data-ra="again">🎤 Try again</button><button type="button" class="btn hide" data-ra="skip">Skip line ›</button><button type="button" class="btn" data-ra="read">🎤 Read aloud</button><button type="button" class="chip" data-ra="slow" style="margin:0" aria-pressed="false">🐢 Slow</button></div><div class="ra-msg">Tap ▶ to hear it with the words lighting up, or 🎤 to read it yourself.</div>`;
 first.parentNode.insertBefore(b,first)}
document.addEventListener("click",e=>{
 const w=e.target.closest(".rw");
 if(w&&ses){e.preventDefault();e.stopPropagation();   // while a session runs, tapping a word jumps there (and blocks the paid word lookup)
  const li=ses.lines.findIndex(l=>l.el.contains(w)),wi=+w.dataset.w;if(li<0)return;
  if(ses.mode=="listen")startListen(li,wi);else{ses.li=li;ses.tries=0;try{ses.rec&&ses.rec.abort()}catch(x){}listenLine()}return}
 const t=e.target.closest("[data-ra]");if(!t)return;const a=t.dataset.ra;
 if(a=="listen"){if(ses&&ses.paused&&ses.pauseAt)startListen(ses.pauseAt[0],ses.pauseAt[1]);else startListen(0,0)}
 else if(a=="pause")pauseListen();
 else if(a=="stop")stopS();
 else if(a=="read")startRead(0);
 else if(a=="again"){ses&&listenLine()}
 else if(a=="skip"){if(ses){ses.li++;ses.tries=0;listenLine()}}
 else if(a=="slow"){window.__raSlow=!window.__raSlow;t.setAttribute("aria-pressed",!!window.__raSlow);t.classList.toggle("on",!!window.__raSlow);if(ses&&ses.mode=="listen"){ses.rate=window.__raSlow?0.75:0.95;startListen(ses.li,ses.wi)}}
},true);

/* ---------------------------------------- 3. PRONUNCIATION LAB ---------------------------------------- */
// To add a drill: push {id,t,tip,items:[[german,english],...]}. Keep items short (single words work best for the recognizer).
const DRILLS=[
 {id:"uo",t:"Ü and Ö",tip:"For ü: say “ee” but round your lips like for “oo”. For ö: say “eh” with rounded lips.",items:[["über","over"],["Tür","door"],["müde","tired"],["schön","beautiful"],["können","can"],["Brötchen","bread roll"]]},
 {id:"ch",t:"The CH sounds",tip:"After e, i, ä, ö, ü, l, n it is soft, like a hiss (ich). After a, o, u, au it is rough, from the throat (Buch, acht).",items:[["ich","I"],["nicht","not"],["Milch","milk"],["Buch","book"],["acht","eight"],["Nacht","night"]]},
 {id:"sch",t:"SCH, SP, ST",tip:"sch = “sh”. At the start of a word, sp and st also sound like “shp” and “sht”.",items:[["Schule","school"],["Fisch","fish"],["Spiel","game"],["Straße","street"],["sprechen","to speak"],["Stuhl","chair"]]},
 {id:"z",t:"Z and W",tip:"z is “ts” (Zeit = tsite). w is like English “v” (Wasser = vasser).",items:[["Zeit","time"],["zehn","ten"],["Katze","cat"],["Platz","place"],["Wasser","water"],["wohnen","to live"]]},
 {id:"r",t:"The German R",tip:"Soft and made in the back of the throat, not rolled. After a vowel (Uhr, Bruder) it almost turns into a soft “a”.",items:[["rot","red"],["Brot","bread"],["Bruder","brother"],["fahren","to drive"],["Uhr","clock"],["richtig","correct"]]},
 {id:"ei",t:"EI, IE, EU",tip:"ei = “eye”, ie = long “ee”, eu/äu = “oy”. Mixing ei and ie is the classic mistake (Wein vs. Wien).",items:[["Eis","ice cream"],["Wein","wine"],["Bier","beer"],["Liebe","love"],["heute","today"],["Freund","friend"]]},
 {id:"ae",t:"Ä",tip:"Like the “e” in “bed”, with a little more open mouth.",items:[["Käse","cheese"],["Mädchen","girl"],["spät","late"],["Äpfel","apples"],["hätte","would have"],["Männer","men"]]}
];
function sentenceDrill(){ // real sentences from the course, short ones, around the learner's level
 const lv=(typeof curLv==="function"?curLv():(ST.plt2>=80?"B1":ST.plt>=80?"A2":"A1"))   /* default level from the course exams if curLv() is not global */,pool=S0().filter(s=>s[3]==lv&&s[0].split(/\s+/).length<=7);
 const pick=pool.sort(()=>Math.random()-.5).slice(0,6);return{id:"sent",t:"Real sentences ("+lv+")",tip:"Say the whole sentence smoothly. Short pauses are fine.",items:pick.map(s=>[s[0],s[1]])}}
const S0=()=>(typeof S!=="undefined"&&Array.isArray(S)?S:[]);   // "S" is the global sentence list (data-sentences.js); this file calls its own session object "ses" so the two never clash
let L=null;   // lab state {d, i, res:[], rec}
function labView(){stopS(true);L=null;const app=$("app"),pr=ST.pr||{};
 const best=id=>pr[id]?` · best ${pr[id].best}%`:"";
 app.innerHTML=`<div class="box"><div class="meta"><button class="chip" data-lab="back" style="margin:0">← Read</button></div><h2 style="margin:12px 0 4px">🎙️ Pronunciation lab</h2><p class="en" style="margin:0 0 10px;font-size:14px">Hear it, say it, see what the computer heard. ${SR?"":"<b>Your browser can't listen, so you will check yourself.</b>"}</p>`+
 DRILLS.map(d=>`<button type="button" class="btn" data-lab="start:${d.id}" style="text-align:left;margin:6px 0"><b>${esc(d.t)}</b><span class="en" style="display:block;font-size:13px">6 words${best(d.id)}</span></button>`).join("")+
 `<button type="button" class="btn" data-lab="start:sent" style="text-align:left;margin:6px 0"><b>Real sentences</b><span class="en" style="display:block;font-size:13px">6 sentences at your level${best("sent")}</span></button></div>`}
function labStart(id){const d=id=="sent"?sentenceDrill():DRILLS.find(x=>x.id==id);if(!d||!d.items.length)return;L={d,i:0,res:[]};labItem()}
function speakText(t,slow){try{typeof speak==="function"?speak(t,slow):0}catch(e){}}
function labItem(){const it=L.d.items[L.i];
 $("app").innerHTML=`<div class="box"><div class="meta"><button class="chip" data-lab="menu" style="margin:0">← Lab</button><span class="tg">${L.i+1} / ${L.d.items.length}</span></div><p class="en" style="font-size:14px;margin:12px 0 0">💡 ${esc(L.d.tip)}</p><div class="lab-w">${esc(it[0])}</div><div class="lab-e">${esc(it[1])}</div><div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><button type="button" class="btn" data-lab="hear" style="width:auto">🔊 Hear</button><button type="button" class="btn" data-lab="slow" style="width:auto">🐢 Slow</button>${SR?`<button type="button" class="btn p" data-lab="say" style="width:auto">🎤 Say it</button>`:`<button type="button" class="btn p" data-lab="self" style="width:auto">I said it</button>`}</div><div id="lab-r" class="ra-msg" style="text-align:center;font-size:15px;margin-top:14px"></div></div>`}
function labResult(good,heard){L.res[L.i]=good;const r=$("lab-r");if(!r)return;
 r.innerHTML=(good?`<b style="color:#4ade80">✅ Right!</b>`:`<b style="color:#f87171">❌ Not quite.</b>`)+(heard?` <span class="en">I heard: “${esc(heard)}”</span>`:"")+`<div style="margin-top:12px;display:flex;gap:8px;justify-content:center"><button type="button" class="btn" data-lab="${good?"hear":"say"}" style="width:auto">${good?"🔊 Hear again":"🎤 Try again"}</button><button type="button" class="btn p" data-lab="next" style="width:auto">${L.i+1<L.d.items.length?"Next ›":"Finish"}</button></div>`}
function labSay(){const it=L.d.items[L.i],r=$("lab-r");if(r)r.textContent="🎤 Listening…";
 const rec=new SR();L.rec=rec;rec.lang="de-DE";rec.interimResults=false;rec.maxAlternatives=3;let done=false;
 rec.onresult=e=>{done=true;const alts=[...e.results[0]].map(a=>a.transcript),exp=it[0].split(/\s+/);
  // a single word is right if ANY heard word matches; a sentence needs 80% of its words in order
  const good=alts.some(t=>{const h=t.trim().split(/\s+/);return exp.length==1?h.some(w=>wordOK(exp[0],w)):align(exp,h,true).st.filter(x=>x=="ok").length/exp.length>=0.8});
  labResult(good,alts[0])};
 rec.onerror=e=>{done=true;const r=$("lab-r");if(r)r.textContent=e.error=="not-allowed"?"Microphone blocked. Allow it in your browser settings.":"I couldn't hear you. Press 🎤 and try again."};
 rec.onend=()=>{if(!done){const r=$("lab-r");if(r&&/Listening/.test(r.textContent))r.textContent="I didn't hear anything. Press 🎤 and try again."}};
 try{rec.start()}catch(e){}}
function labFinish(){const n=L.res.filter(Boolean).length,tot=L.d.items.length,pct=Math.round(n/tot*100),pr=ST.pr=ST.pr||{},p=pr[L.d.id]=pr[L.d.id]||{best:0};
 p.best=Math.max(p.best,pct);p.day=today();let earned=0;
 if(p.xpDay!==today()){p.xpDay=today();earned=n*2;xp(earned)}   // XP once per drill per day, so it can't be farmed
 sv();const tip=pct>=80?"Excellent!":pct>=50?"Good start. Run it again, the second try is always better.":"Keep going. Use 🐢 Slow and copy the mouth shape in the tip.";
 $("app").innerHTML=`<div class="box" style="text-align:center"><h2>${n} / ${tot} correct</h2><p>${pct}% · ${tip}</p>${earned?`<p><b>+${earned} XP</b></p>`:`<p class="en" style="font-size:13px">XP is given once per drill per day.</p>`}<button type="button" class="btn p" data-lab="start:${L.d.id}">Again</button> <button type="button" class="btn" data-lab="menu">All drills</button></div>`}
document.addEventListener("click",e=>{const t=e.target.closest("[data-lab]");if(!t)return;const a=t.dataset.lab;
 if(a=="back"){L=null;try{rs=-1;render()}catch(x){}}
 else if(a=="menu"){try{L&&L.rec&&L.rec.abort()}catch(x){}labView()}
 else if(a.startsWith("start:"))labStart(a.slice(6));
 else if(a=="hear")speakText(L.d.items[L.i][0],false);
 else if(a=="slow")speakText(L.d.items[L.i][0],true);
 else if(a=="say")labSay();
 else if(a=="self")labResult(true,"");
 else if(a=="next"){if(L.i+1<L.d.items.length){L.i++;labItem()}else labFinish()}});
window.openPronLab=labView;

/* ---------------------------------------- wiring (wrappers; nothing else is edited) ---------------------------------------- */
try{const _sv=storyView;storyView=function(){stopS(true);const r=_sv.apply(this,arguments);try{injectBar()}catch(e){}return r}}catch(e){}
try{const _rv=readView;readView=function(){const r=_rv.apply(this,arguments);try{
  if(typeof rs!=="undefined"&&rs<0&&$("app")&&!$("lab-card")){const bx=$("app").querySelector(".box");
   if(bx)bx.insertAdjacentHTML("afterbegin",`<button type="button" id="lab-card" class="btn" data-lab="menu" style="text-align:left;margin:0 0 12px"><b>🎙️ Pronunciation lab</b><span class="en" style="display:block;font-size:13px">Practise the tricky German sounds with your voice</span></button>`)}}catch(e){}return r}}catch(e){}
try{const _r=render;render=function(){if(ses)stopS(true);return _r.apply(this,arguments)}}catch(e){}
})();
