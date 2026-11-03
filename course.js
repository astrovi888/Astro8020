// =====================================================================
// Astrolingo COURSE (v1): the Duolingo-style main path.  Pure addition, loaded LAST in index.html.
//
// WHAT THIS FILE DOES
//  1. "Learn" tab (tab key "c"): your CEFR level (A1 -> A2 -> B1 -> B2), a path of lessons, a streak calendar,
//     a Continue button, due-card review and topic packs.
//  2. Lessons: every level is cut into nodes of 10 cards (sentences and words, most frequent first = the 80/20
//     idea). A node unlocks when the one before it is done. Lessons reuse the normal flashcard engine, so the
//     spaced-repetition scheduler in app.js (sched/review) is untouched.
//  3. Level tests: you move up ONLY by passing a test (15 questions, 12 right = 80%). The test unlocks after
//     70% of the level's lessons are done. "Test me" lets a returning learner climb by tests alone (placement).
//  4. New bottom bar: Learn / Practice / Progress / More. "Practice" is the old Learn screen with all filters.
//  5. The old XP "Lv N" label is replaced by your CEFR level (A1..B2) everywhere it was shown.
//
// DATA IT SAVES (ST.course, synced by sync.js merge): { started:1, passed:{A1:"2026-11-03",...} }.
// Lesson progress is NOT stored separately: a lesson is "done" when all its cards exist in ST.cards and are past
// the first learning step, so it can never disagree with the flashcards. Do not add a second progress store.
//
// RULES FOR EDITORS
//  - Level of a card comes from the data files (sentence row [3], word WD[k].lv). Change levels THERE.
//  - Never rename ST.cards keys or reorder data rows (progress is keyed by position, see data-curriculum.js).
//  - This file wraps render/form/done/topbar/pop/bbHi from earlier scripts. Keep it last in index.html.
//  - Levels are our best estimate from the CEFR word list + sentence difficulty; this is NOT an official exam.
// =====================================================================
(function(){
const LV=["A1","A2","B1","B2"],PER=10,NEED=.7,QN=15,PASS=12;
let live=null,T=null,viewL=null,calM=null,showAll=false;      // live lesson, running test, shown level, calendar month

/* ---------- state helpers ---------- */
const CR=()=>{const c=ST.course=ST.course||{};c.passed=c.passed||{};return c};
const cur=()=>LV.find(l=>!CR().passed[l])||"done";
const badge=()=>cur()=="done"?"B2 ✓":cur();
const keyOf=(k,id)=>k=="w"?"w"+WD[id].rank:id;
// a card counts as "learned for the lesson" once it is past the first learning step (not stuck on Again/Hard)
const isDone=(k,id)=>{const c=ST.cards[keyOf(k,id)];return !!c&&(c.reps>=1||c.sp>=1||(c.st||0)>=1)};
const wde=w=>(w.art?w.art+" ":"")+w.de;
const esc2=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- course structure ---------- */
function ids(L){
 // sentences: one copy per text (dedupe() in app.js), most frequent first. words: by frequency rank, no bare articles.
 const s=dedupe(S.map((x,k)=>k).filter(k=>S[k][3]==L),k=>k).sort((a,b)=>S[a][2]-S[b][2]||a-b);
 const w=WD.map((x,k)=>k).filter(k=>WD[k].lv==L&&WD[k].pos!="a");
 return{s,w}
}
function nodes(L){
 const d=ids(L),cut=(a,k)=>{const o=[];for(let j=0;j<a.length;j+=PER)o.push({k,ids:a.slice(j,j+PER)});return o};
 const A=cut(d.s,"s"),B=cut(d.w,"w"),out=[];let a=0,b=0;
 // interleave the two tracks in proportion, so a level mixes sentences and words evenly
 while(a<A.length||b<B.length){const fa=A.length?a/A.length:2,fb=B.length?b/B.length:2;(a<A.length&&(b>=B.length||fa<=fb))?out.push(A[a++]):out.push(B[b++])}
 out.forEach((n,j)=>{n.i=j;n.L=L;n.done=n.ids.every(id=>isDone(n.k,id))});
 return out
}
const lvStat=L=>{const n=nodes(L),d=n.filter(x=>x.done).length;return{n,total:n.length,done:d,frac:n.length?d/n.length:0}};
const unlocked=L=>LV.indexOf(L)<=(cur()=="done"?3:LV.indexOf(cur()));
const nextNode=L=>{const n=nodes(L);return n.find(x=>!x.done)||null};

/* ---------- starting a lesson (reuses the normal flashcard engine in app.js) ---------- */
function startNode(L,j){
 const ns=nodes(L),n=ns[j];if(!n||!unlocked(L))return;
 const first=ns.findIndex(x=>!x.done);
 if(!CR().passed[L]&&first>=0&&j>first)return pop("Finish the earlier lesson first");   // sequential unlock
 let list=n.ids.filter(id=>!isDone(n.k,id));const replay=!list.length;if(replay)list=n.ids.slice();
 live={L,i:j,k:n.k,replay};
 tab=n.k=="w"?"w":"s";q=shuf(list);i=0;gain=0;bank=[];out=[];bmsg="";bshow=false;ses={ok:0,n:0,again:[]};
 card()
}
function startReview(){
 const now=Date.now(),due=Object.keys(ST.cards).filter(k=>ST.cards[k].due<=now);
 const sd=dedupe(due.filter(k=>/^\d+$/.test(k)&&S[k]).map(Number),k=>k),wd=due.filter(k=>k[0]=="w"&&WR[+k.slice(1)]).map(k=>WD.findIndex(w=>w.rank==+k.slice(1))).filter(k=>k>=0);
 live=null;
 if(sd.length){tab="s";q=shuf(sd).slice(0,20)}else if(wd.length){tab="w";q=shuf(wd).slice(0,20)}else return pop("Nothing due right now");
 i=0;gain=0;bank=[];out=[];bmsg="";bshow=false;ses={ok:0,n:0,again:[]};card()
}
const dueCount=()=>{const now=Date.now();return Object.keys(ST.cards).filter(k=>ST.cards[k].due<=now).length};

/* ---------- lesson finished (replaces the generic "Session complete" screen for lessons) ---------- */
const _done=done;
done=function(){
 if(!live){_done();const st=[...document.querySelectorAll("#app .stat")].find(x=>/next level/.test(x.textContent));if(st)st.innerHTML=`<b>${badge()}</b><span>your level</span>`;return}
 const L=live.L,n=nodes(L)[live.i],ok=n&&n.done,left=n?n.ids.filter(id=>!isDone(n.k,id)).length:0,st=lvStat(L),nx=nextNode(L),testOK=!CR().passed[L]&&st.frac>=NEED;
 const pc=ses.n?Math.round(ses.ok/ses.n*100):0;
 app.innerHTML=`<div class="box cr-end"><div style="text-align:center">${typeof astroPose=="function"?astroPose(ok?"win":"think",96):""}</div>
 <div class="sent" style="min-height:0;text-align:center">${ok?"Lesson complete!":"Nice work, almost there"}</div>
 <div class="grid"><div class="stat"><b>+${gain}</b><span>XP earned</span></div><div class="stat"><b>${pc}%</b><span>recalled well</span></div>
 <div class="stat"><b>${L}</b><span>${st.done}/${st.total} lessons</span></div><div class="stat"><b>🔥 ${ST.streak}</b><span>day streak</span></div></div>
 ${ok?"":`<p class="en" style="text-align:center">${left} card${left==1?"":"s"} still need another try. They come back in this lesson.</p>`}
 ${testOK?`<div class="note"><b>🏆 The ${L} test is unlocked!</b><div class="en" style="font-size:15px">Pass it to unlock ${LV[LV.indexOf(L)+1]||"the finish line"}.</div></div>`:""}
 <div class="row" style="margin-top:14px"><button class="btn" data-cr="home">Back to path</button>${testOK?`<button class="btn p" data-cr="test">Take the test</button>`:nx?`<button class="btn p" data-cr="next">${ok?"Next lesson":"Try again"}</button>`:""}</div></div>`;
 save();if(ok){try{burst();sfx.ach()}catch(e){}}
};

/* ---------- level tests ---------- */
const pick=(a,n)=>shuf(a).slice(0,n);
function buildTest(L){
 const d=ids(L),qs=[],sp=d.s,wp=d.w;
 pick(sp,Math.min(8,sp.length)).forEach((k,j)=>{const s=S[k],toDe=j%2==1,f=toDe?0:1,
  o=shuf([k].concat(pick(sp.filter(x=>x!=k&&S[x][f]!=s[f]),3))).map(x=>S[x][f]);
  qs.push({lab:toDe?"Choose the German":"Choose the meaning",p:toDe?s[1]:s[0],o,a:o.indexOf(s[f]),de:s[0],en:s[1],sent:1})});
 pick(wp,Math.min(QN-qs.length,wp.length)).forEach((k,j)=>{const w=WD[k],toDe=j%2==1,same=wp.filter(x=>x!=k&&WD[x].pos==w.pos&&WD[x].en!=w.en),
  o=shuf([k].concat(pick(same.length>=3?same:wp.filter(x=>x!=k&&WD[x].en!=w.en),3))).map(x=>toDe?wde(WD[x]):WD[x].en);
  qs.push({lab:toDe?"Choose the German word":"Choose the meaning",p:toDe?w.en:wde(w),o,a:o.indexOf(toDe?wde(w):w.en),de:wde(w),en:w.en})});
 return shuf(qs)
}
function startTest(L,ladder){
 if(!unlocked(L)||CR().passed[L])return;
 const st=lvStat(L);
 if(!ladder&&st.frac<NEED)return pop(`Finish ${Math.ceil(NEED*st.total)-st.done} more lessons to unlock the ${L} test`);
 live=null;T={L,qs:buildTest(L),n:0,ok:0,miss:[],ladder:!!ladder,ans:-1};tab="c";testView()
}
function testView(){
 const x=T.qs[T.n],done=T.ans>=0;
 app.innerHTML=`<div class="box"><div class="meta"><button type="button" class="chip" data-cr="quit" style="margin:0">← Quit</button><span>${T.n+1} / ${T.qs.length}</span><span>${T.L} test</span></div>
 <div class="bar"><i style="width:${T.n/T.qs.length*100}%"></i></div>
 <p class="en" style="margin:14px 0 6px">${x.lab}</p><div class="sent" style="min-height:0">${esc2(x.p)}</div>
 <div style="margin-top:14px">${x.o.map((o,j)=>`<button type="button" class="btn cr-opt${done?(j==x.a?" good":j==T.ans?" bad":""):""}" data-cr="ans:${j}" ${done?"disabled":""} style="margin:6px 0;text-align:left">${esc2(o)}</button>`).join("")}</div>
 ${done?`<div class="note"><b>${T.ans==x.a?"Richtig!":"Not quite."}</b><div>${esc2(x.de)}</div><div class="en" style="font-size:15px">${esc2(x.en)}</div></div><button type="button" class="btn p" data-cr="tnext" style="margin-top:10px">${T.n+1>=T.qs.length?"See result":"Next"}</button>`:""}</div>`
}
function testEnd(){
 const L=T.L,pass=T.ok>=PASS,idx=LV.indexOf(L),nx=LV[idx+1];
 if(pass){CR().passed[L]=day();ST.ce=(ST.ce||0)+25;save();try{burst();sfx.ach()}catch(e){}}
 app.innerHTML=`<div class="box cr-end"><div style="text-align:center">${typeof astroPose=="function"?astroPose(pass?"celebrate":"confused",96):""}</div>
 <div class="sent" style="min-height:0;text-align:center">${pass?`${L} passed!`:"Not this time"}</div>
 <p class="en" style="text-align:center;margin:0 0 10px">${T.ok} of ${T.qs.length} right. You need ${PASS} (80%).${pass?` +25 🪙 ${nx?`${nx} is now unlocked.`:"You finished the whole path!"}`:""}</p>
 ${T.miss.length?`<div class="note"><b>${pass?"Missed":"Review these"}</b>${T.miss.map(m=>`<div style="margin-top:6px">${esc2(m.de)}<div class="en" style="font-size:14px">${esc2(m.en)}</div></div>`).join("")}</div>`:""}
 <div class="row" style="margin-top:14px"><button class="btn" data-cr="home">Back to path</button>${pass&&nx&&T.ladder?`<button class="btn p" data-cr="ladder">Test ${nx} next</button>`:pass?"":`<button class="btn p" data-cr="test">Retake test</button>`}</div></div>`;
 T=null
}

/* ---------- views ---------- */
const ring=(a,b,sz)=>{const r=sz/2-4,c=2*Math.PI*r,p=b?a/b:0;return `<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}" aria-hidden="true"><circle cx="${sz/2}" cy="${sz/2}" r="${r}" fill="none" stroke="var(--bd)" stroke-width="4"/><circle cx="${sz/2}" cy="${sz/2}" r="${r}" fill="none" stroke="var(--ac)" stroke-width="4" stroke-linecap="round" stroke-dasharray="${(c*p).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${sz/2} ${sz/2})"/></svg>`};
function calendar(){
 const t=new Date(),m=calM||{y:t.getFullYear(),m:t.getMonth()},first=new Date(m.y,m.m,1),dim=new Date(m.y,m.m+1,0).getDate(),lead=(first.getDay()+6)%7,
  studied=ST.hist||{},today=day(),p2=n=>String(n).padStart(2,"0");let cells="";
 for(let j=0;j<lead;j++)cells+=`<span></span>`;
 for(let d=1;d<=dim;d++){const k=`${m.y}-${p2(m.m+1)}-${p2(d)}`,on=studied[k]!==undefined;cells+=`<span class="cr-d${on?" on":""}${k==today?" today":""}${k>today?" fut":""}">${on?"🔥":d}</span>`}
 return `<div class="box" style="margin-top:14px"><div class="meta"><button type="button" class="chip" data-cr="cal:-1" style="margin:0" aria-label="Previous month">‹</button><b>${first.toLocaleString("en",{month:"long",year:"numeric"})}</b><button type="button" class="chip" data-cr="cal:1" style="margin:0" aria-label="Next month">›</button></div>
 <div class="cr-cal"><i>M</i><i>T</i><i>W</i><i>T</i><i>F</i><i>S</i><i>S</i>${cells}</div>
 <p class="en" style="margin:10px 0 0;text-align:center">🔥 ${ST.streak} day streak · best ${ST.best||ST.streak||0}</p></div>`
}
function topics(){
 const rows=THEMES.map((t,j)=>{const a=dedupe(S.map((x,k)=>k).filter(k=>S[k][4]==t),k=>k),l=a.filter(k=>ST.cards[k]&&ST.cards[k].reps>=1).length;return `<button type="button" class="cr-top" data-cr="topic:${j}">${ring(l,a.length,44)}<span><b>${esc2(t)}</b><small>${l}/${a.length}</small></span></button>`}).join("");
 return `<div class="box" style="margin-top:14px"><b>Topic packs</b><p class="en" style="margin:2px 0 10px;font-size:14px">Free practice on one theme. Great for real-life situations.</p><div class="cr-tops">${rows}</div></div>`
}
function welcome(){
 app.innerHTML=`<div class="box cr-end"><div style="text-align:center">${typeof astroPose=="function"?astroPose("hello",110):""}</div>
 <div class="sent" style="min-height:0;text-align:center">Welcome to Astrolingo</div>
 <p class="en" style="text-align:center">German is huge. You only need the 20% that covers 80% of real life. We teach that first, level by level: A1, A2, B1, B2.</p>
 <button class="btn p" data-cr="begin" style="margin-top:8px">I’m new. Start at A1</button>
 <button class="btn" data-cr="placement" style="margin-top:10px">I know some German. Test me</button>
 <p class="en" style="font-size:13px;text-align:center;margin-top:12px">Tests are 15 questions. Pass 12 to move up. Levels are our estimate, not an official exam.</p></div>`
}
function courseView(){
 const c=CR();
 if(!c.started){if(ST.xp>0||Object.keys(ST.cards).length)c.started=1;else return welcome()}
 const now=cur(),L=viewL&&unlocked(viewL)?viewL:(now=="done"?"B2":now),st=lvStat(L),passed=!!c.passed[L],first=st.n.findIndex(x=>!x.done),due=dueCount();
 const strip=LV.map(l=>`<button type="button" class="cr-lv${c.passed[l]?" pass":""}${l==L?" on":""}${unlocked(l)?"":" lock"}" data-cr="lv:${l}">${unlocked(l)?(c.passed[l]?"✓ ":""):"🔒 "}${l}</button>`).join("");
 const nx=st.n.find(x=>!x.done),label=n=>`${n.k=="w"?"Words":"Sentences"} ${n.i+1}`;
 const testOK=!passed&&st.frac>=NEED,needMore=Math.max(0,Math.ceil(NEED*st.total)-st.done);
 // path window: a few lessons back, the current one and the next ones; "Show all" expands
 const a=showAll?0:Math.max(0,(first<0?st.n.length:first)-2),b=showAll?st.n.length:Math.min(st.n.length,(first<0?st.n.length:first)+7),offs=[0,34,56,34,0,-34,-56,-34];
 const path=st.n.slice(a,b).map(n=>{const isCur=!passed&&n.i==first,locked=!passed&&first>=0&&n.i>first,cls=n.done?"done":isCur?"cur":locked?"lock":"open";
  return `<div class="cr-nw" style="--o:${offs[n.i%8]}px"><button type="button" class="cr-node ${cls}" data-cr="node:${L}:${n.i}" ${locked?"disabled":""} aria-label="${label(n)}${n.done?", done":locked?", locked":""}">${n.done?"✓":locked?"🔒":n.k=="w"?"🔤":"💬"}</button><small>${label(n)}</small></div>`}).join("");
 app.innerHTML=`<div class="cr-lvls">${strip}</div>
 <div class="box cr-hero"><div style="display:flex;align-items:center;gap:14px"><div class="cr-big">${now=="done"?"B2 ✓":now}</div><div style="flex:1"><b style="font-size:18px">${now=="done"?"You finished the path!":L==now?"Your level":"Viewing "+L}</b>
 <div class="en" style="color:inherit;opacity:.85;font-size:14px">${st.done} of ${st.total} ${L} lessons</div><div class="bar" style="margin:8px 0 0"><i style="width:${st.frac*100}%"></i></div></div></div>
 ${nx?`<button class="btn cr-go" data-cr="next:${L}">Continue · ${label(nx)}</button>`:""}
 ${due?`<button class="btn cr-go2" data-cr="review">Review ${due} due card${due==1?"":"s"}</button>`:""}</div>
 ${passed?`<div class="note" style="margin-top:12px"><b>✓ ${L} passed</b><div class="en" style="font-size:14px">${c.passed[L]}</div></div>`:`<div class="note" style="margin-top:12px"><b>🏆 ${L} test</b><div class="en" style="font-size:14px">${testOK?`Unlocked. Pass it (12 of 15) to unlock ${LV[LV.indexOf(L)+1]||"the finish line"}.`:`Unlocks after ${needMore} more lesson${needMore==1?"":"s"}. Move up only by proving it.`}</div>
 <button class="btn${testOK?" p":""}" data-cr="test" style="margin-top:8px"${testOK?"":" disabled"}>Take the ${L} test</button>
 ${L=="A1"&&st.done<3?`<button class="btn" data-cr="placement" style="margin-top:8px">I know some German. Test me from A1</button>`:""}</div>`}
 <div class="cr-path">${a>0?`<button type="button" class="chip" data-cr="all">Show earlier lessons</button>`:""}${path}${b<st.n.length?`<button type="button" class="chip" data-cr="all">Show all ${st.n.length} lessons</button>`:""}</div>
 ${calendar()}${topics()}
 <div class="box" style="margin-top:14px"><b>⏰ Daily reminder</b><p class="en" style="margin:2px 0 8px;font-size:14px">Adds a repeating event to your calendar app.</p>
 <div class="row"><select id="cr-t" aria-label="Reminder time"><option value="08:00">8:00</option><option value="12:30">12:30</option><option value="18:00">18:00</option><option value="19:00" selected>19:00</option><option value="21:00">21:00</option></select><button class="btn" data-cr="ics">Add reminder</button></div></div>`
}
function reminder(){
 const t=($("cr-t")||{}).value||"19:00",d=new Date();d.setDate(d.getDate()+1);const p=n=>String(n).padStart(2,"0"),ds=`${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}T${t.replace(":","")}00`;
 const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Astrolingo//EN","BEGIN:VEVENT","UID:astrolingo-daily@astrolingo","DTSTAMP:"+new Date().toISOString().replace(/[-:]|\.\d+/g,""),"DTSTART:"+ds,"RRULE:FREQ=DAILY","SUMMARY:Astrolingo: 5 minutes of German","BEGIN:VALARM","TRIGGER:PT0M","ACTION:DISPLAY","DESCRIPTION:Keep your streak alive","END:VALARM","END:VEVENT","END:VCALENDAR"].join("\r\n");
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([ics],{type:"text/calendar"}));a.download="astrolingo-reminder.ics";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)
}
function more(){
 openSheet(`<div style="padding:4px 2px"><b style="font-size:18px">More</b><div style="height:8px"></div>
 ${[["m","⏱️","Word Match Blitz"],["r","📖","Read stories"],["d","🔎","Dictionary and translate"],["l","🎓","Classic lessons and dialogues"],["set","⚙️","Settings"],["ab","ℹ️","About Astrolingo"]].map(([k,i2,t])=>`<button type="button" class="btn" data-cr="go:${k}" style="text-align:left;margin:6px 0">${i2} ${t}</button>`).join("")}</div>`)
}
function goTo(k){
 try{closeSheet()}catch(e){}
 if(k=="ab"){const a=document.querySelector('[data-m="about"]');return a&&a.click()}
 if(k=="set"){tab="p";ptab="t"}else tab=k;
 live=null;rs=-1;rl="";try{mgStop()}catch(e){}render();scrollTo&&scrollTo(0,0)
}

/* ---------- click router (all course buttons use data-cr="action:arg:arg") ---------- */
const A={
 home(){live=null;T=null;tab="c";render();scrollTo&&scrollTo(0,0)},
 begin(){CR().started=1;save();A.home()},
 placement(){CR().started=1;save();startTest("A1",true)},
 ladder(){const n=cur();n!="done"&&startTest(n,true)},
 next(L){const l=L||(live&&live.L)||cur();if(l=="done")return;const n=nextNode(l);n?startNode(l,n.i):A.home()},
 node(L,j){startNode(L,+j)},
 lv(L){if(!unlocked(L))return pop(`Pass the ${LV[LV.indexOf(L)-1]} test to unlock ${L}`);viewL=L;showAll=false;render()},
 all(){showAll=!showAll;render()},
 cal(d){const t=new Date(),m=calM||{y:t.getFullYear(),m:t.getMonth()},x=new Date(m.y,m.m+ +d,1);calM={y:x.getFullYear(),m:x.getMonth()};render()},
 topic(j){ST.f={r:"0",l:"0",t:THEMES[+j],n:"10"};save();live=null;tab="s";act.go()},
 review(){startReview()},
 test(){const L=(live&&live.L)||(T&&T.L)||viewL||cur();startTest(L==="done"?"B2":(CR().passed[L]?cur():L),false)},
 quit(){T=null;A.home()},
 ans(j){if(!T||T.ans>=0)return;T.ans=+j;const x=T.qs[T.n];if(T.ans==x.a){T.ok++;try{sfx.good()}catch(e){}}else{T.miss.push(x);try{sfx.bad()}catch(e){}}testView()},
 tnext(){if(!T)return;T.n++;T.ans=-1;T.n>=T.qs.length?testEnd():testView()},
 more(){more()},go(k){goTo(k)},ics(){reminder()}
};
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-cr]");if(!b||b.disabled)return;const p=b.dataset.cr.split(":"),f=A[p[0]];if(f){e.preventDefault();f(...p.slice(1))}});

/* ---------- wrappers around earlier scripts ---------- */
const _render=render;
render=function(){
 if(tab=="c"){q=[];live=null;topbar();courseView();bbHi();return}
 live=null;_render();
 // practice screen: say what it is
 if(tab=="s"||tab=="w"){const m=document.querySelector("#app .meta");if(!m&&!q.length){const f=document.querySelector("#app>.box");if(f)f.insertAdjacentHTML("afterbegin",`<p class="en" style="margin:0 0 10px;font-size:14px">Free practice: pick any filter. To level up, use <a href="#" data-cr="home">Learn</a>.</p>`)}}
 if(tab=="p"){const m=document.querySelector("#app .meta span");if(m&&/^Level \d+/.test(m.textContent))m.textContent="Your level: "+badge()}
};
const _form=form;
form=function(m){if(live){live=null;tab="c";return render()}return _form(m)};
const _back=act.back;act.back=function(){if(live){live=null;tab="c";return render()}return _back()};
const _topbar=topbar;
topbar=function(){_topbar();const t=$("top"),l=t&&t.lastElementChild;if(l&&/^Lv /.test(l.textContent)){l.textContent=badge();l.dataset.cr="home";l.style.cursor="pointer";l.setAttribute("role","button")}};
const _pop=pop;
pop=function(t){return _pop(String(t).replace(/^Level \d+! /,""))};
const _bbHi=bbHi;
bbHi=function(){const g=live?"c":grp(tab);document.querySelectorAll("#bbar button").forEach(b=>{const k=b.dataset.g||(b.dataset.cr=="more"?"more":"");b.classList.toggle("on",k==g||(k=="more"&&!["c","s","p"].includes(g)))})};

/* ---------- new bottom bar: Learn / Practice / Progress / More ---------- */
const bb=$("bbar");
if(bb)bb.innerHTML=`<button data-g="c"><i>🧭</i>Learn</button><button data-g="s"><i>🎯</i>Practice</button><button data-g="p"><i>📊</i>Progress</button><button data-cr="more"><i>⋯</i>More</button>`;
tab="c";render();
})();
