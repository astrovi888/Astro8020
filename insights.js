// =====================================================================
// Astrolingo INSIGHTS (v1): learner profile, weak spots, graphs, personalized practice, recommendations.
// Pure addition, loaded after course.js.
//
// HOW IT WORKS
//  - Every flashcard rating is logged: ST.ev = [[timestamp, cardKey, rating], ...] (newest 600). Ratings:
//    0 Again, 3 Hard, 4 Good, 5 Easy. "Mistake" = 0. "Correct" = 3 or more. cardKey = sentence index or "w"+word rank.
//  - Weak spots are DERIVED live from ST.cards (lapses, low ease, relearning) plus recent Again ratings, so they
//    update the moment a learner improves. Nothing here stores a copy of progress.
//  - Screens: tab "u" = My profile (graphs, weak spots, tests, speaking). The Learn screen gets a "For you" card
//    (recommendations + "Fix weak cards") through window.CRX.top (see course.js).
//  - Privacy: all of this lives in the browser (and the learner's account if they log in). Nothing is sent anywhere new.
//
// RULES FOR EDITORS
//  - Keep ST.ev small (it is synced and saved on every review). Do not log more than 3 numbers per event.
//  - Thresholds (what counts as weak, minimum events before advising) are in weak() and tips(). Tune them there.
// =====================================================================
(function(){
const RK={};WD.forEach((w,k)=>RK[w.rank]=k);
const wde=w=>(w.art?w.art+" ":"")+w.de,esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const DAY=864e5,iso=t=>new Date(t).toISOString().slice(0,10);

/* ---------- log every rating ---------- */
const _review=review;
review=function(k,r){_review(k,r);const e=ST.ev=ST.ev||[];e.push([Date.now(),String(k),r]);if(e.length>600)e.splice(0,e.length-600)};

/* ---------- card key -> what it is ---------- */
function info(k){
 if(typeof k=="string"&&k[0]=="w"){const x=RK[+k.slice(1)];if(x===undefined)return null;const w=WD[x];return{kind:"w",idx:x,lv:w.lv,theme:w.theme,label:wde(w)+" = "+w.en}}
 const s=S[+k];return s?{kind:"s",idx:+k,lv:s[3],theme:s[4],label:s[0]+" = "+s[1]}:null
}
const acc=a=>a.length?Math.round(a.filter(e=>e[2]>=3).length/a.length*100):null;
const recent=d=>(ST.ev||[]).filter(e=>e[0]>=Date.now()-d*DAY);

/* ---------- weak spots (derived, never stored) ---------- */
function weak(){
 const ag={};recent(30).forEach(e=>{if(e[2]==0)ag[e[1]]=(ag[e[1]]||0)+1});
 const res=[];
 for(const k in ST.cards){
  const c=ST.cards[k],i=info(k);if(!i)continue;
  // lapses count double, low ease adds up, being in relearning and recent "Again" ratings add more
  const s=(c.lp||0)*2+Math.max(0,2.5-(c.ef||2.5))*6+(c.st==2?3:0)+(ag[k]||0)*1.5;
  if(s>=2.5)res.push({k,s,i})
 }
 return res.sort((a,b)=>b.s-a.s)
}
function startWeak(kind){
 const L=weak().filter(x=>x.i.kind==kind).slice(0,12);
 if(!L.length)return pop(kind=="w"?"No weak words right now":"No weak sentences right now");
 window.__wk=1;tab=kind=="w"?"w":"s";q=shuf(L.map(x=>x.i.idx));i=0;gain=0;bank=[];out=[];bmsg="";bshow=false;ses={ok:0,n:0,again:[]};card()
}
const _done=done;
done=function(){
 if(!window.__wk)return _done();
 window.__wk=0;const left=weak().length,pc=ses.n?Math.round(ses.ok/ses.n*100):0;
 app.innerHTML=`<div class="box cr-end"><div style="text-align:center">${typeof astroPose=="function"?astroPose(pc>=70?"win":"think",96):""}</div>
 <div class="sent" style="min-height:0;text-align:center">Weak spots practiced</div>
 <div class="grid"><div class="stat"><b>+${gain}</b><span>XP earned</span></div><div class="stat"><b>${pc}%</b><span>recalled well</span></div>
 <div class="stat"><b>${left}</b><span>weak cards left</span></div><div class="stat"><b>🔥 ${ST.streak}</b><span>day streak</span></div></div>
 <p class="en" style="text-align:center">${left?"Cards leave this list as soon as you recall them well a few times.":"Nothing weak right now. Nice."}</p>
 <div class="row" style="margin-top:14px"><button class="btn" data-cr="home">Back to Learn</button>${left?`<button class="btn p" data-ix="fix:${tab=="w"?"w":"s"}">Practice more</button>`:""}</div></div>`;save()
};

/* ---------- tiny SVG charts (transform-free, theme aware) ---------- */
function bars(vals,labels,o){
 const W=300,H=84,n=vals.length,bw=W/n,mx=Math.max(o.max||0,...vals,1);
 return `<svg viewBox="0 0 ${W} ${H+16}" role="img" aria-label="${esc(o.label)}">`+vals.map((v,j)=>{
  const h=v?Math.max(3,Math.round(v/mx*H)):2;
  return `<rect x="${(j*bw+2).toFixed(1)}" y="${H-h}" width="${(bw-4).toFixed(1)}" height="${h}" rx="3" fill="${o.color||"var(--ac)"}" opacity="${v?1:.25}"/>`+(labels[j]?`<text x="${(j*bw+bw/2).toFixed(1)}" y="${H+12}" font-size="8" text-anchor="middle" fill="var(--mut)">${labels[j]}</text>`:"")
 }).join("")+"</svg>"
}
const hb=(label,pct,sub)=>`<div style="margin:8px 0"><div style="display:flex;justify-content:space-between;font-size:14px"><span>${esc(label)}</span><span style="color:var(--mut)">${sub||""}</span></div><div class="bar" style="margin:4px 0 0"><i style="width:${pct||0}%${pct!=null&&pct<70?";background:#ef4444":""}"></i></div></div>`;

/* ---------- recommendations ("For you" on the Learn screen) ---------- */
function weakTheme(){
 const g={};recent(60).forEach(e=>{const i=info(e[1]);if(!i)return;(g[i.theme]=g[i.theme]||[]).push(e)});
 return Object.entries(g).filter(([,a])=>a.length>=8).map(([t,a])=>({t,a:acc(a),n:a.length})).sort((x,y)=>x.a-y.a)[0]
}
function artAcc(){let ok=0,bad=0;Object.values(ST.art||{}).forEach(a=>{ok+=a.ok||0;bad+=a.bad||0});return{n:ok+bad,p:ok+bad?Math.round(ok/(ok+bad)*100):null}}
function tips(){
 const t=[],w=weak(),ws=w.filter(x=>x.i.kind=="s").length,ww=w.length-ws,th=weakTheme(),aa=artAcc();
 if(w.length>=3)t.push(`<div><b>${w.length} cards need work</b><div class="en" style="font-size:14px;margin:2px 0 8px">The ones you miss most, picked fresh from your last reviews.</div><div class="row">${ww?`<button class="btn" data-ix="fix:w">Words (${ww})</button>`:""}${ws?`<button class="btn" data-ix="fix:s">Sentences (${ws})</button>`:""}</div></div>`);
 if(th&&th.a<75){const j=THEMES.indexOf(th.t);if(j>=0)t.push(`<div><b>${esc(th.t)}: ${th.a}% right</b><div class="en" style="font-size:14px;margin:2px 0 8px">Your weakest topic lately.</div><button class="btn" data-cr="topic:${j}">Practice this topic</button></div>`)}
 if(aa.n>=10&&aa.p<70)t.push(`<div><b>Articles: ${aa.p}% right</b><div class="en" style="font-size:14px;margin:2px 0 8px">der, die or das trips you up. Short drills fix it fast.</div><button class="btn" data-cr="go:a">Practice articles</button></div>`);
 return t.slice(0,3)
}
function forYou(){
 const n=(ST.ev||[]).length,t=tips();
 if(!t.length)return n<10?`<div class="note" style="margin-top:12px"><b>🎯 For you</b><div class="en" style="font-size:14px">Do a few lessons and this card will learn what you find hard, then build practice just for you.</div></div>`:`<div class="note" style="margin-top:12px"><b>🎯 For you</b><div class="en" style="font-size:14px">No weak spots right now. Keep going. <a href="#" data-ix="prof">See your profile</a></div></div>`;
 return `<div class="box" style="margin-top:12px"><b>🎯 For you</b><div style="display:grid;gap:14px;margin-top:10px">${t.join("")}</div><p class="en" style="font-size:13px;margin:12px 0 0"><a href="#" data-ix="prof">See your full profile and graphs</a></p></div>`
}
(window.CRX=window.CRX||{}).top=(window.CRX.top||[]).concat([forYou]);

/* ---------- My profile page (tab "u") ---------- */
function profile(){
 const days=[...Array(14)].map((_,j)=>iso(Date.now()-(13-j)*DAY)),ev=ST.ev||[],byDay=d=>ev.filter(e=>iso(e[0])==d),
  cnt=days.map(d=>byDay(d).length),pc=days.map(d=>{const a=byDay(d);return a.length?acc(a):0}),lab=days.map((d,j)=>j%2?"":d.slice(8)),
  w=weak(),e7=recent(7),e60=recent(60),total=Object.keys(ST.cards).length,learnedN=learned().length;
 const lvRows=["A1","A2","B1","B2"].map(L=>{const a=e60.filter(e=>{const i=info(e[1]);return i&&i.lv==L});return a.length?hb(L,acc(a),`${acc(a)}% · ${a.length} reviews`):""}).join("");
 const th={};e60.forEach(e=>{const i=info(e[1]);if(i)(th[i.theme]=th[i.theme]||[]).push(e)});
 const thRows=Object.entries(th).filter(([,a])=>a.length>=5).map(([t,a])=>({t,a:acc(a),n:a.length})).sort((x,y)=>x.a-y.a).slice(0,5).map(x=>hb(x.t,x.a,`${x.a}% · ${x.n}`)).join("");
 const sp=Object.entries(ST.sp||{}),spOk=sp.reduce((s,[,v])=>s+(v.ok||0),0),spBad=sp.reduce((s,[,v])=>s+(v.bad||0),0),
  spHard=sp.filter(([,v])=>v.bad>0).sort((a,b)=>b[1].bad-a[1].bad).slice(0,5).map(([k])=>info(k)).filter(Boolean),
  tests=((ST.course||{}).tests||[]).slice(-5).reverse(),aa=artAcc();
 app.innerHTML=`<div class="meta"><button type="button" class="chip" data-cr="home" style="margin:0">← Learn</button><b>My profile</b><span></span></div>
 <div class="box"><div class="grid">
  <div class="stat"><b>${(ST.course&&Object.keys(ST.course.passed||{}).length)||0}/4</b><span>levels passed</span></div>
  <div class="stat"><b>🔥 ${ST.streak}</b><span>day streak</span></div>
  <div class="stat"><b>${learnedN}</b><span>cards learned of ${total} started</span></div>
  <div class="stat"><b>${acc(e7)==null?"–":acc(e7)+"%"}</b><span>right, last 7 days</span></div></div></div>
 <div class="box" style="margin-top:12px"><b>Reviews per day</b>${bars(cnt,lab,{label:"Reviews per day, last 14 days"})}</div>
 <div class="box" style="margin-top:12px"><b>Accuracy per day</b><div class="en" style="font-size:13px;margin:0 0 4px">Share of answers you got right (not "Again").</div>${bars(pc,lab,{max:100,color:"var(--das)",label:"Accuracy per day, last 14 days"})}</div>
 ${lvRows?`<div class="box" style="margin-top:12px"><b>Accuracy by level</b>${lvRows}</div>`:""}
 ${thRows?`<div class="box" style="margin-top:12px"><b>Weakest topics</b>${thRows}</div>`:""}
 <div class="box" style="margin-top:12px"><b>Weak spots (${w.length})</b>${w.length?`<div class="row" style="margin:10px 0">${w.some(x=>x.i.kind=="w")?`<button class="btn p" data-ix="fix:w">Practice weak words</button>`:""}${w.some(x=>x.i.kind=="s")?`<button class="btn p" data-ix="fix:s">Practice weak sentences</button>`:""}</div>`+w.slice(0,8).map(x=>`<div style="padding:6px 0;border-top:1px solid var(--bd);font-size:14px">${esc(x.i.label)}</div>`).join(""):`<p class="en" style="font-size:14px;margin:6px 0 0">Nothing weak right now.</p>`}</div>
 <div class="box" style="margin-top:12px"><b>Speaking</b>${spOk+spBad?`<p class="en" style="font-size:14px;margin:6px 0">${spOk} said right, ${spBad} missed (${Math.round(spOk/(spOk+spBad)*100)}%).</p>${spHard.length?`<div class="en" style="font-size:14px">Hardest to say: ${spHard.map(h=>esc(h.label.split(" = ")[0])).join(", ")}</div>`:""}`:`<p class="en" style="font-size:14px;margin:6px 0">No speaking practice yet.</p>`}<button class="btn" data-cr="go:k" style="margin-top:8px">🎤 Speaking practice</button></div>
 ${aa.n?`<div class="box" style="margin-top:12px"><b>Articles</b>${hb("der / die / das",aa.p,`${aa.p}% · ${aa.n} answers`)}</div>`:""}
 ${tests.length?`<div class="box" style="margin-top:12px"><b>Level tests</b>${tests.map(t=>`<div style="padding:6px 0;border-top:1px solid var(--bd);font-size:14px">${t.L} · ${t.ok}/${t.n} · ${t.d}${t.flag?" · not verified":t.ok>=12?" · passed":" · not passed"}</div>`).join("")}</div>`:""}
 <p class="en" style="font-size:13px;margin-top:14px;text-align:center">This data stays on your device (and your account if you log in). It is only used to choose what you practice next.</p>`
}

/* ---------- wiring ---------- */
const _render=render;
render=function(){
 window.__wk=0;
 if(tab=="u"){q=[];topbar();profile();bbHi();return}
 _render()
};
document.addEventListener("click",e=>{
 const b=e.target.closest&&e.target.closest("[data-ix]");if(!b)return;e.preventDefault();
 const[a,x]=b.dataset.ix.split(":");
 if(a=="fix")startWeak(x);else if(a=="prof"){tab="u";render();scrollTo&&scrollTo(0,0)}
});
})();
