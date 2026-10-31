if(typeof BULK!=="undefined")S.push(...BULK);
const TM={};
`Home:Haus Stuhl Tisch Fenster Tür Wohnung Garten Bett Zimmer Schlüssel Licht Bild Wand Boden Treppe Dach Balkon Sofa Lampe Spiegel Bad Schrank Miete Nachbar Telefon
Kitchen:Küche Brot Milch Messer Teller Pfanne Kühlschrank Gabel Löffel Glas Tasse Topf Ei Käse Butter Zucker Salz Reis Nudeln Tomate Zwiebel Kartoffel Apfel Rezept Ofen kochen lecker
Restaurant:Bier Kaffee Fleisch Fisch Suppe Salat Kuchen Restaurant Hotel Rechnung Speisekarte Kellner Getränk Nachtisch Mittagessen Abendessen Frühstück Essen bestellen bezahlen essen trinken
Work:Arbeit Chef Kollege Termin Firma Büro Besprechung Vertrag Gehalt Kunde Projekt Aufgabe Lehrer Stelle Feierabend Computer arbeiten
Outdoors:Wetter Sonne Regen Schnee Berg Wald Fluss See Strand Wiese Blume Baum Park Himmel Wolke Wind Insel Meer Brücke Weg Straße laufen
Animals:Hund Katze Vogel Pferd Kuh Maus Tier Schaf Schwein Huhn Hase Bär Wolf Elefant Affe Tierarzt Zoo`.split("\n").forEach(l=>{const[t,w]=l.split(":");w.split(" ").forEach(x=>TM[x]=t)});
const lvb=b=>b<=300?"A1":b<=600?"A2":b<=800?"B1":"B2";
const POS={n:"noun",v:"verb",j:"adjective",d:"adverb",p:"pronoun",r:"preposition",c:"conjunction",t:"determiner",a:"article",i:"interjection",m:"number"},LV=["","A1","A2","B1","B2"],WD=[];
W1.trim().split("\n").forEach((l,k)=>{if(l=="-")return;const[a,en,c]=l.split("|"),m=c[0]=="n"&&a.match(/^(der|die|das) (.+)$/);WD.push({rank:k+1,de:m?m[2]:a,art:m?m[1]:"",en,pos:c[0],lv:LV[+c[1]],band:Math.ceil((k+1)/100)*100,theme:TM[m?m[2]:a]||"Daily"})});
const NN=WD.filter(w=>w.pos=="n"),WR={};WD.forEach(w=>WR[w.rank]=w);
const THEMES=[...new Set(S.map(s=>s[4]))].sort(),WM={};WD.forEach(w=>{WM[w.de]=WM[w.de]||w});
const wcol=w=>w.art?`<span class="${w.art}">${w.art}</span> ${w.de}`:w.de;
const toks=t=>t.toLowerCase().match(/[a-zäöüß]+/g)||[];
function gloss(de){const seen={},o=[];(de.match(/[A-Za-zÄÖÜäöüß]+/g)||[]).forEach(t=>{const w=WM[t]||WM[t[0].toLowerCase()+t.slice(1)];if(w&&!seen[w.de]){seen[w.de]=1;o.push(`<span class="tg">${wcol(w)} = ${w.en}</span>`)}});return o.length?`<div class="gl">${o.join("")}</div>`:""}
function ex(w){const s=S.find(s=>toks(s[0]).includes(w.de.toLowerCase()));return s?`<div class="note"><div>${col(s[0])}</div><div class="en" style="font-size:15px">${s[1]}</div></div>`:""}

const $=id=>document.getElementById(id),app=$("app"),MEM={};
const dflt={cards:{},xp:0,streak:0,best:0,last:"",hist:{},dir:"en2de",hw:{},art:{},today:{d:"",n:0},goal:10,f:{r:"0",l:"0",t:"0",n:"10"}};
function load(){try{const r=localStorage.getItem("a8020");if(r)return JSON.parse(r)}catch(e){}return MEM.s}
let ST=Object.assign({},dflt,load()||{}),DOC=null,tm=0,tab="s",q=[],i=0,gain=0,bank=[],out=[],bmsg="",an=null,asc=0,atot=0,cmb=0,ses={},bshow=false;
function save(){try{localStorage.setItem("a8020",JSON.stringify(ST))}catch(e){}MEM.s=ST;typeof pushSoon=="function"&&pushSoon();if(DOC){clearTimeout(tm);tm=setTimeout(()=>DOC.set({s:JSON.stringify(ST)}).catch(()=>{}),1500)}}
async function cloud(){
 try{const c=await claude.use("db"),u=await claude.use("user");if(!c||!u)return;const id=await u.id();if(!id)return;
 DOC=c.collection("data/users/"+id).doc("progress");const s=await DOC.get();
 if(s.exists){const r=JSON.parse(s.data().s);if((r.xp||0)>=ST.xp)ST=Object.assign({},dflt,r)}
 save();$("st").textContent="Progress is saved to your account";topbar();if(!q.length&&tab!="a")render()}catch(e){}
}
const coins=()=>(ST.ce||0)-(ST.cs||0);
const day=d=>(d||new Date()).toISOString().slice(0,10);
const col=t=>t.replace(/\b(der|die|das)\b/gi,m=>`<span class="${m.toLowerCase()}">${m}</span>`);
const shuf=a=>{a=a.slice();for(let k=a.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[a[k],a[j]]=[a[j],a[k]]}return a};
const opts=(a,sel)=>a.map(([v,t])=>`<option value="${v}"${v==sel?" selected":""}>${t}</option>`).join("");
const learned=()=>Object.keys(ST.cards).filter(k=>/^\d+$/.test(k)&&ST.cards[k].reps>=1);
const lvl=()=>Math.min(100,Math.floor(ST.xp/150)),stg=l=>l==0?"Level 0":l<=15?"A1":l<=40?"A2":l<=70?"B1":l<100?"B2":"Complete";
function pop(t){const p=$("pop");p.textContent=t;p.className="";void p.offsetWidth;p.className="go"}
function topbar(){const n=ST.today.d==day()?ST.today.n:0,p=Math.min(100,n/ST.goal*100);
 $("top").innerHTML=`<span>🔥 ${ST.streak} day${ST.streak==1?"":"s"}</span><div class="bar" style="flex:1;margin:0"><i style="width:${p}%"></i></div><span>${Math.min(n,ST.goal)}/${ST.goal} today</span><span>🪙 ${coins()}</span><span>Lv ${lvl()}</span>`}
function addXP(x){
 const b=lvl(),t=day();ST.xp+=x;gain+=x;
 ST.ce=(ST.ce||0)+Math.ceil(x/5);
 if(ST.last!=t){const gap=ST.last?Math.round((Date.parse(t)-Date.parse(ST.last))/864e5)-1:-1,fz=(ST.fb||0)-(ST.fu||0);
  if(gap==0)ST.streak++;else if(gap>0&&gap<=fz){ST.fu=(ST.fu||0)+gap;ST.streak++;setTimeout(()=>pop("❄️ A streak freeze saved your streak"),1500)}else ST.streak=1;ST.last=t}
 ST.best=Math.max(ST.best||0,ST.streak);
 if(ST.today.d!=t)ST.today={d:t,n:0};ST.today.n++;if(ST.today.n==ST.goal)ST.ce=(ST.ce||0)+10;
 ST.hist[t]=learned().length;
 pop(lvl()>b?`Level ${lvl()}! +${x} XP`:ST.today.n==ST.goal?`Daily goal reached! +${x} XP`:`+${x} XP`);topbar();
}
const STEPS=[1,10],RESTEP=[10];
function sched(c,r){c=Object.assign({ef:2.5,iv:0,reps:0,sp:0,lp:0},c);if(c.st==null)c.st=c.reps>=1&&c.iv>=1?1:0;const n=Object.assign({},c);
 const grad=d=>{n.st=1;n.iv=d;n.dm=d*1440;n.sp=0;n.reps=c.reps+1};
 if(c.st==1){
  if(r==0){n.st=2;n.sp=0;n.lp=c.lp+1;n.ef=Math.max(1.3,c.ef-.2);n.iv=Math.max(1,Math.round(c.iv*.2));n.dm=RESTEP[0]}
  else{const h=Math.max(c.iv+1,Math.round(c.iv*1.2)),g=Math.max(c.iv+1,Math.round(c.iv*c.ef)),e=Math.max(g+1,Math.round(c.iv*c.ef*1.3));
   n.iv=r==3?h:r==4?g:e;n.dm=n.iv*1440;n.ef=Math.max(1.3,c.ef+(r==3?-.15:r==5?.15:0));n.reps=c.reps+1}
 }else{const st=c.st==2?RESTEP:STEPS;
  if(r==0){n.sp=0;n.dm=st[0]}
  else if(r==3)n.dm=st.length>1&&c.sp==0?(st[0]+st[1])/2:st[Math.min(c.sp,st.length-1)]*(st.length==1?1.5:1);
  else if(r==4){if(c.sp+1<st.length){n.sp=c.sp+1;n.dm=st[n.sp]}else grad(c.st==2?Math.max(1,c.iv):1)}
  else grad(c.st==2?Math.max(1,c.iv)+1:4)}
 return n}
const FMT=m=>m<60?Math.round(m)+" min":m<1440?Math.round(m/60)+" h":m<43200?Math.round(m/1440)+(Math.round(m/1440)==1?" day":" days"):m<525600?(Math.round(m/43200*10)/10)+" mo":(Math.round(m/525600*10)/10)+" yr";
const lab=n=>FMT(n.dm);
function review(k,r){const n=sched(ST.cards[k],r);n.due=Date.now()+n.dm*6e4;ST.cards[k]=n;addXP([2,5,10,15][[0,3,4,5].indexOf(r)])}
function readF(){const g=(id,d)=>$(id)?$(id).value:d,f=ST.f;ST.f={r:g("fr",f.r),l:g("fl",f.l),t:g("ft",f.t),n:g("fn",f.n)}}
function form(msg){
 const f=ST.f,rs=[["0","Any range"]];for(let b=100;b<=1000;b+=100)rs.push([b,`${tab=="w"?"Rank":"Words"} ${b-99}–${b}`]);
 const sel=(id,l,o,v)=>`<label for="${id}">${l}</label><select id="${id}">${opts(o,v)}</select>`;
 let h=sel("fr","Word frequency",rs,f.r)+sel("fl","Level",[["0","Any level"],["A1","A1"],["A2","A2"],["B1","B1"],["B2","B2"]],f.l)+sel("ft","Theme",[["0","Any theme"],...THEMES.map(t=>[t,t])],f.t)+sel("fn","Number per session",[5,10,15,20,25,50,100].map(n=>[n,n]),f.n);
 if(tab!="b")h+=`<label>Direction</label><button class="btn" data-a="dir">${ST.dir=="en2de"?"English → German":"German → English"} (tap to switch)</button>`;
 const info=tab=="w"?`${WD.length} words from the top 1,000`:tab=="b"?"Tap the German words in the right order.":`${S.length} sentences`;
 app.innerHTML=`<div class="box"><p class="en" style="margin:0">${info}</p>${h}<div style="height:16px"></div><button class="btn p" data-a="go">Start</button><p class="en" style="margin:12px 0 0">${msg||""}</p></div>`;
}
function render(){q=[];topbar();tab=="p"?stats():tab=="a"?(asc=atot=cmb=0,cardA()):form()}
const ok=(f,k)=>(f.r=="0"||k.band==+f.r)&&(f.l=="0"||k.lv==f.l)&&(f.t=="0"||k.theme==f.t);
function begin(list,keyOf){
 const now=Date.now(),n=+ST.f.n;
 if(!list.length)return form("Nothing matches these filters yet. Loosen one of them.");
 if(tab=="b")q=shuf(list).slice(0,n);
 else{const due=list.filter(k=>ST.cards[keyOf(k)]&&ST.cards[keyOf(k)].due<=now),nw=list.filter(k=>!ST.cards[keyOf(k)]);q=[...due,...nw].slice(0,n)}
 if(!q.length)return form("All caught up here. Come back when cards are due.");
 i=0;gain=0;bank=[];out=[];bmsg="";bshow=false;ses={ok:0,n:0,again:[]};card();
}
function card(){if(i>=q.length)return done();tab=="s"?cardS():tab=="w"?cardW():cardB()}
function done(){
 const l=lvl(),nx=l>=100?0:150-ST.xp%150,pc=ses.n?Math.round(ses.ok/ses.n*100):0;
 app.innerHTML=`<div class="box"><div class="sent" style="min-height:0">Session complete</div>
 <div class="grid"><div class="stat"><b>+${gain}</b><span>XP earned</span></div><div class="stat"><b>${pc}%</b><span>${tab=="b"?"solved first try":"recalled well"}</span></div>
 <div class="stat"><b>Level ${l}</b><span>${nx} XP to the next level</span></div><div class="stat"><b>🔥 ${ST.streak}</b><span>day streak</span></div></div>
 ${ses.again.length?`<div class="note"><b>Worth another look:</b><div class="en" style="font-size:15px">${ses.again.join("<br>")}</div></div>`:`<p class="en">Clean session. Nothing to review again.</p>`}
 <div class="row" style="margin-top:14px"><button class="btn" data-a="back">Change filters</button><button class="btn p" data-a="go">Another session</button></div></div>`;save();
}
const head=m=>`<div class="meta"><span>${i+1} / ${q.length}</span><span>${m}</span></div><div class="bar"><i style="width:${i/q.length*100}%"></i></div>`;
const rt=k=>`<div id="rt" class="row rate hide" style="margin-top:16px">${[[0,"Again"],[3,"Hard"],[4,"Good"],[5,"Easy"]].map(([v,l])=>`<button class="btn" data-a="r" data-v="${v}">${l}<small>${lab(sched(ST.cards[k],v))}</small></button>`).join("")}</div>`;
const tags=(l,t,b)=>`<span class="tg">${l}</span><span class="tg">${TE[t]||""} ${t}</span><span class="tg">words ≤${b}</span>`;
function cardS(){
 const s=S[q[i]],e=ST.dir=="en2de";window.hv=[];
 app.innerHTML=`<div class="box">${head(`${s[3]} · ${s[4]}`)}
 <div class="sent">${e?`<span class="en" style="font-size:24px">${s[1]}</span>`:col(s[0])}</div><div id="hint"></div>
 <div id="ans" class="hide"><div class="sent" style="min-height:0">${e?col(s[0]):s[1]}</div>${e?`<div class="en" style="font-size:16px">${s[1]}</div>`:""}
 <div class="note">${tags(s[3],s[4],s[2])}<div style="margin-top:8px">${s[5]}</div>${gloss(s[0])}</div></div>
 <div id="rv" class="row"><button class="btn" data-a="hint">Hint</button><button class="btn p" data-a="rev">Reveal answer</button></div>${rt(q[i])}</div>`;
}
function cardW(){
 const w=WD[q[i]],e=ST.dir=="en2de";
 app.innerHTML=`<div class="box">${head(w.art?"Noun":"Word")}${pic(w)}<div class="sent" style="text-align:center;font-size:30px">${e?w.en:wcol(w)}</div>
 <div id="ans" class="hide"><div class="sent" style="text-align:center;font-size:30px;min-height:0">${e?wcol(w):w.en}</div>
 <div style="text-align:center"><span class="tg">#${w.rank}</span><span class="tg">${w.lv}</span><span class="tg">${POS[w.pos]}</span></div>${w.art?`<div class="note">Learn it as <b>${w.art} ${w.de}</b>, never the word alone.</div>`:""}${ex(w)}</div>
 <div id="rv"><button class="btn p" data-a="rev">Reveal answer</button></div>${rt("w"+w.rank)}</div>`;
}
function cardB(){
 const s=S[q[i]];
 if(!bank.length&&!out.length)bank=shuf(s[0].split(" ").map((w,k)=>({w,k})));
 const ch=(a,l)=>l.map(c=>`<button class="chip" data-a="${a}" data-v="${c.k}">${c.w}</button>`).join("");
 app.innerHTML=`<div class="box">${head(`${s[3]} · ${s[4]}`)}<div class="sent" style="min-height:0">${s[1]}</div>
 <div class="box" style="min-height:58px;padding:10px;margin-bottom:12px">${ch("un",out)}</div><div>${ch("up",bank)}</div><div style="min-height:50px;margin:8px 0">${bmsg}</div>
 <div class="row"><button class="btn" data-a="show">Show answer</button><button class="btn p" data-a="chk">Check</button></div></div>`;
}
function cardA(){
 const w=[];NN.forEach(n=>{const a=ST.art[n.de]||{ok:0,bad:0},k=Math.max(1,Math.round(2+3*a.bad-a.ok/2));for(let j=0;j<k;j++)w.push(n)});
 an=w[Math.floor(Math.random()*w.length)];an.done=false;
 app.innerHTML=`<div class="box"><div class="meta"><span>${asc} / ${atot} correct${cmb>1?` · 🔥 ${cmb} in a row`:""}</span><span>der, die or das?</span></div>
 ${pic(an)}<div class="sent" style="text-align:center;font-size:34px">${an.de}</div><div class="en" style="text-align:center">${an.en}</div>
 <div class="row" style="margin-top:18px">${["der","die","das"].map(a=>`<button class="btn ${a}" data-a="art" data-v="${a}">${a}</button>`).join("")}</div><div id="am" style="margin-top:14px"></div></div>`;
}
function bar(l,a,b){return`<div class="meta" style="margin-top:8px"><span>${l}</span><span>${a}/${b}</span></div><div class="bar" style="margin:2px 0"><i style="width:${b?a/b*100:0}%"></i></div>`}
function stats(){
 const L=learned(),W=new Set();
 L.forEach(k=>toks(S[k][0]).forEach(x=>W.add(x)));
 Object.keys(ST.cards).filter(k=>k[0]=="w"&&ST.cards[k].reps>=1).forEach(k=>WR[+k.slice(1)]&&W.add(WR[+k.slice(1)].de.toLowerCase()));
 const l=lvl(),pct=l>=100?100:(ST.xp%150)/150*100,now=Date.now(),
 ds=Object.keys(ST.hist).sort().slice(-30),vs=ds.map(d=>ST.hist[d]),mx=Math.max(S.length,...vs),
 ao=Object.values(ST.art).reduce((a,x)=>a+x.ok,0),ab=Object.values(ST.art).reduce((a,x)=>a+x.bad,0),
 due=Object.keys(ST.cards).filter(k=>ST.cards[k].due<=now).length,
 hw=Object.entries(ST.hw).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([w,n])=>`${w.slice(3)} (${n})`).join(", "),
 wk=Object.entries(ST.art).filter(x=>x[1].bad>0).sort((a,b)=>(b[1].bad-b[1].ok)-(a[1].bad-a[1].ok)).slice(0,5).map(x=>{const n=NN.find(w=>w.de==x[0]);return n?wcol(n):""}).join(", ");
 let g=`<p class="en">Practice on two different days to see your graph.</p>`;
 if(ds.length>1){const p=vs.map((v,n)=>`${10+n*(280/(vs.length-1))},${110-v/mx*100}`).join(" ");g=`<svg viewBox="0 0 300 120" role="img" aria-label="Sentences learned over time"><polyline points="${p}" fill="none" stroke="currentColor" stroke-width="2"/></svg><div class="meta"><span>${ds[0]}</span><span>${ds[ds.length-1]}</span></div>`}
 const wl=Object.keys(ST.cards).filter(k=>k[0]=="w"&&ST.cards[k].reps>=1).length;
 app.innerHTML=`<div class="box"><div class="meta"><span>Level ${l} · ${stg(l)}</span><span>${ST.xp} XP${l<100?` · ${150-ST.xp%150} to next`:""}</span></div><div class="bar"><i style="width:${pct}%"></i></div>
 <div class="grid"><div class="stat"><b>${ST.streak}</b><span>day streak (best ${ST.best||0})</span></div><div class="stat"><b>${due}</b><span>cards due now</span></div>
 <div class="stat"><b>${L.length}/${S.length}</b><span>sentences learned</span></div><div class="stat"><b>${W.size}</b><span>words learned (${wl}/${WD.length} flashcards)</span></div></div>
 <b>By level</b>${["A1","A2","B1","B2"].map(x=>bar(x,L.filter(k=>S[k][3]==x).length,S.filter(s=>s[3]==x).length)).join("")}
 <div style="height:14px"></div><b>By theme</b>${THEMES.map(x=>bar(x,L.filter(k=>S[k][4]==x).length,S.filter(s=>s[4]==x).length)).join("")}
 <div class="note"><b>Learning curve</b>${g}</div>
 <div class="note"><b>Articles:</b> ${ao+ab?Math.round(ao/(ao+ab)*100)+"% correct ("+(ao+ab)+" answers)":"not practiced yet"}<div class="en" style="font-size:15px">${wk?"Needs work: "+wk:""}</div></div>
 <div class="note"><b>Words you needed hints for:</b><div class="en" style="font-size:15px">${hw||"None yet."}</div></div>
 <div class="note"><b>Daily goal</b><label for="gl">Reviews per day</label><select id="gl">${opts([5,10,20,30].map(n=>[n,n]),ST.goal)}</select></div>
 <div class="note"><b>Backup</b><div class="en" style="font-size:14px">Progress lives in this browser (or your account when hosted here). Copy the text to keep a backup, paste it back to restore.</div>
 <textarea id="bk" rows="3" style="width:100%;margin:8px 0;font:12px monospace;background:var(--card);color:var(--fg);border:1px solid var(--bd);border-radius:8px"></textarea>
 <div class="row"><button class="btn" data-a="exp">Show backup</button><button class="btn" data-a="imp">Restore</button></div></div>
 <p class="en" style="font-size:13px;margin-top:14px">Level 1–15 = A1, 16–40 = A2, 41–70 = B1, 71–99 = B2, 100 = complete. 150 XP per level. Frequency bands and word levels are approximate.</p></div>`;
 $("gl").onchange=e=>{ST.goal=+e.target.value;save();topbar()};
}
function revHint(){const s=S[q[i]],e=ST.dir=="en2de",ws=(e?s[0]:s[1]).split(" ");
 $("hint").innerHTML=`<div class="en" style="font-size:14px;margin-bottom:6px">Tap the word you want revealed:</div>`+ws.map((w,k)=>window.hv.includes(k)?`<span class="chip rvd">${e?col(w):w}</span>`:`<button class="chip" data-a="hw" data-v="${k}" aria-label="Reveal word ${k+1}">${"•".repeat(Math.min(Math.max(w.replace(/[^A-Za-zÄÖÜäöüß0-9]/g,"").length,2),9))}</button>`).join("")}
const act={
 dir(){readF();ST.dir=ST.dir=="en2de"?"de2en":"en2de";save();form()},
 go(){readF();save();tab=="w"?begin(WD.map((w,k)=>k).filter(k=>ok(ST.f,WD[k])&&WD[k].pos!="a"),k=>"w"+WD[k].rank):begin(S.map((s,k)=>k).filter(k=>ok(ST.f,{band:S[k][2],lv:S[k][3],theme:S[k][4]})),k=>k)},
 back(){form()},
 rev(){$("ans").classList.remove("hide");$("rt").classList.remove("hide");$("rv").classList.add("hide");if($("hint"))$("hint").innerHTML=""},
 hint(){revHint()},
 hw(v){const s=S[q[i]],e=ST.dir=="en2de",ws=(e?s[0]:s[1]).split(" "),w=ws[+v],k=(e?"de:":"en:")+w.toLowerCase().replace(/[.,!?;:“”]/g,"");
  window.hv.push(+v);ST.hw[k]=(ST.hw[k]||0)+1;save();revHint()},
 r(v){v=+v;const k=tab=="w"?"w"+WD[q[i]].rank:q[i];review(k,v);ses.n++;v>=4?ses.ok++:0;
  if(v==0){q.push(q[i]);const s=tab=="w"?WD[q[i]]:S[q[i]];ses.again.push(tab=="w"?`${wcol(s)} = ${s.en}`:col(s[0]))}
  save();i++;card()},
 up(v){const k=bank.findIndex(c=>c.k==v);out.push(bank.splice(k,1)[0]);bmsg="";cardB()},
 un(v){const k=out.findIndex(c=>c.k==v);bank.push(out.splice(k,1)[0]);bmsg="";cardB()},
 chk(){const s=S[q[i]];if(bank.length){bmsg="Use every word first.";return cardB()}
  if(out.map(c=>c.w).join(" ")!=s[0]){bmsg="Not quite. Try a different order.";return cardB()}
  addXP(bshow?3:8);ses.n++;if(!bshow)ses.ok++;
  app.innerHTML=`<div class="box">${head("Richtig!")}<div class="sent" style="min-height:0">${col(s[0])}</div><div class="en">${s[1]}</div>
  <div class="note">${tags(s[3],s[4],s[2])}<div style="margin-top:8px">${s[5]}</div>${gloss(s[0])}</div><div style="height:14px"></div><button class="btn p" data-a="bn">Next</button></div>`;save()},
 bn(){i++;bank=[];out=[];bmsg="";bshow=false;card()},
 show(){bshow=true;bmsg=`<span class="en">${col(S[q[i]][0])}</span>`;cardB()},
 art(v){
  if(an.done)return;an.done=true;const g=v==an.art,a=ST.art[an.de]||{ok:0,bad:0};g?a.ok++:a.bad++;ST.art[an.de]=a;atot++;
  if(g){asc++;cmb++;addXP(2+Math.min(cmb,5)-1)}else cmb=0;save();
  $("am").innerHTML=`<p style="margin:0 0 8px">${g?"Correct: ":"Not quite: "}${wcol(an)} = ${an.en}${g&&cmb>1?` · 🔥 ${cmb} in a row`:""}</p>${g?"":ex(an)}<button class="btn p" data-a="nx" style="margin-top:8px">Next</button>`},
 nx(){cardA()},
 exp(){$("bk").value=JSON.stringify(ST);$("bk").select();try{navigator.clipboard.writeText($("bk").value)}catch(e){}},
 imp(){try{const r=JSON.parse($("bk").value);if(typeof r.xp!="number")throw 0;ST=Object.assign({},dflt,r);save();pop("Restored");topbar();stats()}catch(e){pop("Paste a valid backup first")}}
};
app.onclick=e=>{const b=e.target.closest("[data-a]");if(b&&act[b.dataset.a])act[b.dataset.a](b.dataset.v)};
$("nav").onclick=e=>{const b=e.target.closest("[data-t]");if(!b)return;tab=b.dataset.t;document.querySelectorAll("#nav button").forEach(x=>x.className=x==b?"on":"");render()};
render();cloud();
