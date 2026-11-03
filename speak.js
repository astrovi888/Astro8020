// =====================================================================
// Astrolingo SPEAK (v1): speaking practice with the microphone. Pure addition, loaded after insights.js.
//
// TWO FEATURES
//  1. "Speaking practice" (tab "k", More > Speaking practice, or the card on the Learn screen): fast flashcards.
//     You see a word or sentence and SAY the translation, in either direction (German -> English, English -> German,
//     or mixed). Right = green and next. Wrong = red shake, try again. Press Help, or miss it 3 times, and the card
//     flips to show the answer (and plays it), then goes to the END of the line and comes back later.
//     "Can't speak now" switches to a self-check mode (reveal, then "Got it" / "Not yet").
//  2. An optional "Say it" button on normal flashcards (Sentences and Words). It only listens and tells you if you
//     were right. It never changes the spaced-repetition rating: you still choose Again/Hard/Good/Easy yourself.
//
// HOW LISTENING WORKS (read before changing)
//  - Uses the browser's SpeechRecognition (Chrome, Edge, Safari 14.5+). It needs HTTPS, an internet connection
//    (the browser sends audio to its own speech service) and microphone permission. Firefox does not support it,
//    so there the screen falls back to self-check mode automatically.
//  - Recognition is imperfect, so matching is forgiving: accents/umlauts and punctuation are ignored, "the/to/a" and
//    "der/die/das" are optional, one typo-sized difference is allowed in longer words, and for sentences 80% of
//    the words must be heard. See wordOK() and sentOK(). They are exposed as window.__spk for tests.
//  - Results are stored in ST.sp = { cardKey: {ok, bad} } and feed the My profile page and weak-spot advice.
// =====================================================================
(function(){
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const LVS=["A1","A2","B1","B2"],wde=w=>(w.art?w.art+" ":"")+w.de,esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- matching ---------- */
// English contractions are expanded so "don't" and "do not" match whichever way the recognizer writes them
const ex=s=>String(s).toLowerCase().replace(/[\u2019`]/g,"'").replace(/won't/g,"will not").replace(/can't|cannot/g,"can not").replace(/n't/g," not").replace(/'m/g," am").replace(/'re/g," are").replace(/'ll/g," will").replace(/'ve/g," have").replace(/'d/g," would").replace(/'s\b/g," is");
const nz=s=>ex(s).replace(/ß/g,"ss").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]+/g," ").replace(/\s+/g," ").trim();
function lev(a,b){const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let p=[...Array(n+1).keys()];for(let x=1;x<=m;x++){const c=[x];for(let y=1;y<=n;y++)c[y]=Math.min(p[y]+1,c[y-1]+1,p[y-1]+(a[x-1]==b[y-1]?0:1));p=c}return p[n]}
const near=(a,b)=>a==b||(b.length>=5&&lev(a,b)<=(b.length>=10?2:1));
// English meanings like "to eat / (the) pen, ballpoint": every part is an accepted answer
const enVariants=en=>{const v=new Set();String(en).split(/[,;\/]/).forEach(p=>{p=nz(p.replace(/\([^)]*\)/g," "));if(!p)return;v.add(p);v.add(p.replace(/^(to|the|a|an) /,""))});return[...v]};
const stripArt=h=>h.replace(/^(der|die|das|ein|eine|the|a|an|to) /,"");
function wordOK(heard,item){
 const h=nz(heard);if(!h)return false;const hs=stripArt(h);
 const targets=item.dir=="en2de"?[nz(item.de),nz(item.de.replace(/^(der|die|das) /,""))]:enVariants(item.en);
 return targets.some(t=>t&&(near(h,t)||near(hs,t)))
}
function sentOK(heard,target){
 const H=nz(heard).split(" ").filter(Boolean),T=nz(target).split(" ").filter(Boolean);if(!H.length||!T.length)return{ok:false,missed:T};
 const missed=T.filter(t=>!H.some(h=>near(h,t)));
 return{ok:1-missed.length/T.length>=.8&&H.length<=T.length*1.6+1,missed}
}
window.__spk={nz,lev,wordOK,sentOK};

/* ---------- state ---------- */
const CRK=()=>(ST.course&&ST.course.passed)||{};
const curLv=()=>LVS.find(l=>!CRK()[l])||"B2";
let K=null,rec=null,setup={kind:"w",dir:"mix"};
const keyOf=it=>it.kind=="w"?"w"+WD[it.idx].rank:String(it.idx);
function bump(it,good){const m=ST.sp=ST.sp||{},k=keyOf(it),r=m[k]=m[k]||{ok:0,bad:0};good?r.ok++:r.bad++;save()}
const sayDE=t=>{try{speak(t)}catch(e){}};

function pool(kind){
 const lim=LVS.indexOf(curLv()),sp=ST.sp||{};
 let ids=kind=="w"?WD.map((w,k)=>k).filter(k=>LVS.indexOf(WD[k].lv)<=lim&&WD[k].pos!="a"):dedupe(S.map((s,k)=>k).filter(k=>LVS.indexOf(S[k][3])<=lim&&S[k][0].split(" ").length<=10),k=>k);
 // practice what you have said wrong or never tried first, with some randomness so it never repeats the same set
 const score=k=>{const r=sp[kind=="w"?"w"+WD[k].rank:String(k)]||{ok:0,bad:0};return(r.bad+1)/(r.ok+r.bad+1)+Math.random()*.6};
 return ids.map(k=>[k,score(k)]).sort((a,b)=>b[1]-a[1]).slice(0,10).map(x=>x[0])
}
function startRound(){
 const ids=pool(setup.kind);if(!ids.length){pop("Nothing to practice yet");return}
 K={kind:setup.kind,items:ids.map(k=>{const dir=setup.dir=="mix"?(Math.random()<.5?"de2en":"en2de"):setup.dir,
   it={kind:setup.kind,idx:k,dir,fails:0};
   if(setup.kind=="w"){const w=WD[k];it.de=wde(w);it.en=w.en}else{it.de=S[k][0];it.en=S[k][1]}return it}),
  p:0,total:ids.length,resolved:0,first:0,state:"idle",heard:"",mode:SR?"mic":"self",hardMiss:[],gain:0};
 K.queue=K.items.slice();tab="k";render()
}

/* ---------- screens ---------- */
function home(){
 app.innerHTML=`<div class="meta"><button type="button" class="chip" data-cr="home" style="margin:0">← Learn</button><b>Speaking practice</b><span></span></div>
 <div class="box"><div style="text-align:center">${typeof astroPose=="function"?astroPose("hello",80):""}</div>
 <p class="en" style="text-align:center;margin:6px 0 14px">Say it out loud. Words and sentences from the levels you unlocked, ${SR?"checked by your microphone":"in self-check mode (this browser can’t listen)"}.</p>
 <label>What to practice</label><div class="row"><button class="btn${setup.kind=="w"?" p":""}" data-sp="kind:w">Words</button><button class="btn${setup.kind=="s"?" p":""}" data-sp="kind:s">Sentences</button></div>
 <label>You say it in</label><div class="row"><button class="btn${setup.dir=="de2en"?" p":""}" data-sp="dir:de2en">English</button><button class="btn${setup.dir=="en2de"?" p":""}" data-sp="dir:en2de">German</button><button class="btn${setup.dir=="mix"?" p":""}" data-sp="dir:mix">Both</button></div>
 <div style="height:16px"></div><button class="btn p" data-sp="go">Start · 10 cards</button>
 ${SR?`<p class="en" style="font-size:13px;margin:12px 0 0">The first time, your browser asks to use the microphone. Audio goes to your browser’s speech service, not to us.</p>`:""}</div>`
}
function view(){
 const it=K.queue[K.p],toDE=it.dir=="en2de",st=K.state,again=K.lastKey===K.p+":"+it.idx+":"+K.queue.length;K.lastKey=K.p+":"+it.idx+":"+K.queue.length;
 const prompt=toDE?it.en:it.de,ans=toDE?it.de:it.en,big=it.kind=="s"?"font-size:24px":"";
 const body=st=="flip"?`<div class="sp-l">Answer</div><div class="sp-t good" style="${big}">${esc(ans)}</div><div class="sp-l" style="margin-top:14px">You were asked</div><div class="sp-s">${esc(prompt)}</div>`
  :`<div class="sp-t" style="${big}">${esc(prompt)}</div>${st=="good"?`<div class="sp-ok">✓ ${esc(ans)}</div>`:""}${st=="bad"?`<div class="sp-no">I heard: “${esc(K.heard||"…")}”${K.missed&&K.missed.length?`<br><span style="opacity:.8">Missing: ${esc(K.missed.slice(0,6).join(", "))}</span>`:""}</div>`:""}${K.msg?`<div class="sp-s" style="margin-top:12px">${esc(K.msg)}</div>`:""}`;
 let ctl;
 if(st=="flip")ctl=`<button class="btn p" data-sp="next">Next</button><button class="btn" data-sp="say" style="margin-top:8px">🔊 Hear it again</button>`;
 else if(K.mode=="mic")ctl=`<div class="row"><button class="btn sp-mic${st=="listen"?" on":""}" data-sp="mic" aria-label="Speak">${st=="listen"?"Listening…":"🎤 Tap and speak"}</button>${!toDE&&it.de?`<button class="btn sp-aud" data-sp="hear" aria-label="Hear the German">🔊</button>`:""}</div>
   <div class="row" style="margin-top:10px"><button class="btn" data-sp="help">Help</button><button class="btn" data-sp="self">Can’t speak now</button></div>`;
 else ctl=K.shown?`<div class="row"><button class="btn" data-sp="no">Not yet</button><button class="btn p" data-sp="yes">Got it</button></div>`:`<div class="row"><button class="btn p" data-sp="show">Show answer</button>${!toDE?`<button class="btn sp-aud" data-sp="hear" aria-label="Hear the German">🔊</button>`:""}</div>`;
 app.innerHTML=`<div class="box"><div class="meta"><button type="button" class="chip" data-sp="close" style="margin:0" aria-label="Close">✕</button><span>${K.resolved} / ${K.total}</span><span>${toDE?"Say it in German":"Say it in English"}</span></div>
 <div class="bar"><i style="width:${K.resolved/K.total*100}%"></i></div>
 <div class="sp-card ${st}"><div>${body}</div></div>
 ${K.mode=="self"&&K.shown&&st!="flip"?`<div class="note" style="margin-top:12px"><div class="sp-l">Answer</div><div class="sp-t good" style="font-size:22px;min-height:0">${esc(ans)}</div></div>`:""}
 <div style="margin-top:14px">${ctl}</div></div>`;
 if(again)app.firstElementChild.classList.add("nr")
}
function finish(){
 const pc=K.total?Math.round(K.first/K.total*100):0,miss=K.hardMiss;
 app.innerHTML=`<div class="box cr-end"><div style="text-align:center">${typeof astroPose=="function"?astroPose(pc>=70?"win":"think",96):""}</div>
 <div class="sent" style="min-height:0;text-align:center">Speaking done</div>
 <div class="grid"><div class="stat"><b>${pc}%</b><span>right first try</span></div><div class="stat"><b>${K.total}</b><span>cards</span></div><div class="stat"><b>+${K.gain}</b><span>XP earned</span></div><div class="stat"><b>🔥 ${ST.streak}</b><span>day streak</span></div></div>
 ${miss.length?`<div class="note"><b>Needs more practice</b>${miss.map(m=>`<div style="margin-top:6px">${esc(m.de)}<div class="en" style="font-size:14px">${esc(m.en)}</div></div>`).join("")}</div>`:`<p class="en" style="text-align:center">Clean run. Nothing to repeat.</p>`}
 <div class="row" style="margin-top:14px"><button class="btn" data-cr="home">Back to Learn</button><button class="btn p" data-sp="go">Another round</button></div></div>`;
 K=null;save()
}

/* ---------- flow ---------- */
function resolve(good,first){
 const it=K.queue[K.p];K.resolved++;if(first){K.first++;K.gain+=2;addXP(2)}
 K.p++;K.state="idle";K.heard="";K.missed=null;K.msg="";K.shown=false;K.p>=K.queue.length?finish():view()
}
function failed(it){
 it.fails++;K.state="bad";if(it.fails>=3)return flip();view();
 if(navigator.vibrate&&ST.hap!==false)navigator.vibrate(30)
}
function flip(){
 const it=K.queue[K.p];bump(it,false);if(!K.hardMiss.some(m=>m.idx==it.idx&&m.kind==it.kind))K.hardMiss.push(it);
 K.state="flip";view();sayDE(it.de);
 // goes to the END of the line, fresh, so it comes back later in this round
 K.queue.push({...it,fails:0,again:1})
}
function check(alts,it){
 const toDE=it.dir=="en2de",target=toDE?it.de:it.en;let good=false,missed=null;
 K.heard=alts[0]||"";
 if(it.kind=="w")good=alts.some(a=>wordOK(a,it));
 else{let best=null;alts.forEach(a=>{const r=sentOK(a,target);if(!best||r.missed.length<best.missed.length)best=r});good=best.ok;missed=best.missed;if(good)K.heard=alts[0]}
 K.missed=missed;
 if(good){K.state="good";bump(it,true);view();if(toDE||it.kind=="w")sayDE(it.de);
  setTimeout(()=>{if(K&&K.state=="good")resolve(true,!it.fails&&!it.again)},900)}
 else failed(it)
}
function listen(){
 if(!SR||!K||K.state=="listen")return;
 const it=K.queue[K.p],r=new SR();rec=r;r.lang=it.dir=="en2de"?"de-DE":"en-US";r.interimResults=false;r.maxAlternatives=5;r.continuous=false;
 let got=false;K.state="listen";K.msg="";view();
 r.onresult=e=>{got=true;const alts=[...e.results[0]].map(a=>a.transcript);if(K)check(alts,it)};
 r.onerror=e=>{if(!K)return;got=true;K.state="idle";
  K.msg=e.error=="not-allowed"||e.error=="service-not-allowed"?"Microphone is blocked. Allow it in your browser settings, or tap “Can’t speak now”.":e.error=="no-speech"?"I didn’t hear anything. Tap and try again.":e.error=="network"?"Speech needs an internet connection.":e.error=="aborted"?"":"Couldn’t listen ("+e.error+"). Try again.";
  view()};
 r.onend=()=>{if(K&&!got&&K.state=="listen"){K.state="idle";K.msg="I didn’t catch that. Tap and try again.";view()}};
 try{r.start()}catch(e){K.state="idle";K.msg="Couldn’t start the microphone.";view()}
}
const A={
 kind(v){setup.kind=v;home()},dir(v){setup.dir=v;home()},go(){startRound()},
 close(){try{rec&&rec.abort()}catch(e){}K=null;tab="c";render()},
 mic(){listen()},
 hear(){const it=K.queue[K.p];sayDE(it.de)},say(){const it=K.queue[K.p];sayDE(it.de)},
 help(){try{rec&&rec.abort()}catch(e){}flip()},
 self(){try{rec&&rec.abort()}catch(e){}K.mode="self";K.state="idle";K.shown=false;K.msg="";view()},
 show(){K.shown=true;const it=K.queue[K.p];view();sayDE(it.de)},
 yes(){const it=K.queue[K.p];bump(it,true);resolve(true,!it.fails&&!it.again)},
 no(){const it=K.queue[K.p];it.fails=3;flip()},
 next(){K.p++;K.state="idle";K.heard="";K.missed=null;K.msg="";K.shown=false;K.p>=K.queue.length?finish():view()}
};
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-sp]");if(!b||b.disabled)return;e.preventDefault();const[a,v]=b.dataset.sp.split(":");if(a=="fc")return fcMic();A[a]&&A[a](v)});

/* ---------- optional "Say it" on normal flashcards ---------- */
function fcMic(){
 if(!SR)return;const e=ST.dir=="en2de",isW=tab=="w",x=isW?WD[q[i]]:S[q[i]];if(!x)return;
 const it=isW?{kind:"w",idx:q[i],dir:e?"en2de":"de2en",de:wde(x),en:x.en}:{kind:"s",idx:q[i],dir:e?"en2de":"de2en",de:x[0],en:x[1]},
  r=new SR(),hint=$("hint"),btn=document.querySelector("[data-sp=fc]");
 r.lang=e?"de-DE":"en-US";r.interimResults=false;r.maxAlternatives=5;let got=false;
 if(btn)btn.textContent="Listening…";
 const show=(t,good)=>{if(btn)btn.textContent="🎤 Say it";if(hint)hint.innerHTML=`<div class="note" style="border-color:${good?"var(--das)":"#ef4444"}">${t}</div>`};
 r.onresult=ev=>{got=true;const alts=[...ev.results[0]].map(a=>a.transcript);
  const ok=isW?alts.some(a=>wordOK(a,it)):alts.some(a=>sentOK(a,e?it.de:it.en).ok);bump(it,ok);
  show(ok?"✓ Sounds right. Now choose how well you knew it.":`I heard “${esc(alts[0]||"")}”. Check the answer and rate yourself.`,ok);
  setTimeout(()=>{try{act.rev()}catch(_){}},ok?500:900)};
 r.onerror=ev=>{got=true;show(ev.error=="not-allowed"?"Microphone is blocked in your browser settings.":ev.error=="no-speech"?"I didn’t hear anything.":"Couldn’t listen ("+ev.error+").",false)};
 r.onend=()=>{if(!got)show("I didn’t catch that.",false)};
 try{r.start()}catch(_){show("Couldn’t start the microphone.",false)}
}
const _card=card;
card=function(){
 _card();
 if(SR&&(tab=="s"||tab=="w")&&q[i]!==undefined){const rv=$("rv");if(rv&&!rv.querySelector("[data-sp=fc]"))rv.insertAdjacentHTML("afterbegin",`<button class="btn" data-sp="fc" aria-label="Say the answer out loud">🎤 Say it</button>`)}
};

/* ---------- Learn screen card + tab wiring ---------- */
(window.CRX=window.CRX||{}).mid=(window.CRX.mid||[]).concat([()=>`<div class="box" style="margin-top:14px"><div style="display:flex;align-items:center;gap:12px"><div style="font-size:30px">🎤</div><div style="flex:1"><b>Speaking practice</b><div class="en" style="font-size:14px">Say words and sentences out loud. Flashcards that listen.</div></div></div><button class="btn" data-cr="go:k" style="margin-top:10px">Start speaking</button></div>`]);
const _render=render;
render=function(){
 if(tab=="k"){window.__wk=0;q=[];topbar();K&&K.queue?view():home();bbHi();return}
 try{rec&&rec.abort()}catch(e){}K=null;_render()
};
})();
