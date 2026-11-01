
// ===== Astro 80/20: motion, sound, pronunciation, achievements, ranks, stories, dictionary =====
const nz=s=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ß/g,"ss");
const EMO={Haus:"🏠",Hund:"🐕",Katze:"🐈",Stuhl:"🪑",Fenster:"🪟",Tür:"🚪",Bett:"🛏️",Schlüssel:"🔑",Buch:"📖",Brot:"🍞",Wasser:"💧",Milch:"🥛",Kaffee:"☕",Bier:"🍺",Fleisch:"🥩",Fisch:"🐟",Suppe:"🍲",Salat:"🥗",Kuchen:"🍰",Messer:"🔪",Teller:"🍽️",Pfanne:"🍳",Uhr:"⏰",Auto:"🚗",Fahrrad:"🚲",Zug:"🚆",Flughafen:"✈️",Hotel:"🏨",Schule:"🏫",Krankenhaus:"🏥",Bank:"🏦",Supermarkt:"🛒",Kind:"🧒",Mann:"👨",Frau:"👩",Mädchen:"👧",Hand:"✋",Auge:"👁️",Herz:"❤️",Geld:"💰",Telefon:"☎️",Handy:"📱",Computer:"💻",Licht:"💡",Bild:"🖼️",Brief:"✉️",Sonne:"☀️",Regen:"🌧️",Schnee:"❄️",Wind:"💨",Wolke:"☁️",Berg:"⛰️",Wald:"🌲",Strand:"🏖️",Blume:"🌸",Baum:"🌳",Vogel:"🐦",Pferd:"🐴",Kuh:"🐄",Maus:"🐭",Schaf:"🐑",Schwein:"🐖",Huhn:"🐔",Hase:"🐰",Bär:"🐻",Wolf:"🐺",Elefant:"🐘",Affe:"🐒",Insel:"🏝️",Meer:"🌊",Brücke:"🌉",Sofa:"🛋️",Tasche:"👜",Gabel:"🍴",Löffel:"🥄",Ei:"🥚",Käse:"🧀",Butter:"🧈",Salz:"🧂",Reis:"🍚",Nudeln:"🍝",Tomate:"🍅",Zwiebel:"🧅",Kartoffel:"🥔",Apfel:"🍎",Arzt:"🧑‍⚕️",Lehrer:"🧑‍🏫",Getränk:"🥤",Geburtstag:"🎂",Reise:"🧳",Nacht:"🌙",Stadt:"🏙️",Straße:"🛣️",Bahnhof:"🚉",essen:"🍽️",trinken:"🥤",schlafen:"😴",kochen:"🍳",lesen:"📖",schreiben:"✍️",laufen:"🏃",arbeiten:"💼",wohnen:"🏠",kaufen:"🛍️",sprechen:"🗣️",hören:"👂",sehen:"👀",kalt:"🥶",heiß:"🥵",krank:"🤒",müde:"🥱",teuer:"💸"};
Object.assign(EMO,{Baby:"👶",Musik:"🎵",Film:"🎬",Foto:"📷",Hose:"👖",Kleid:"👗",Hemd:"👔",Schuh:"👟",Mantel:"🧥",Brille:"👓",Koffer:"🧳",Taxi:"🚕",Bus:"🚌",Flugzeug:"✈️",Schiff:"🚢",Boot:"⛵",Ball:"⚽",Fußball:"⚽",Zahn:"🦷",Nase:"👃",Ohr:"👂",Mund:"👄",Bein:"🦵",Fuß:"🦶",Mond:"🌙",Stern:"⭐",Feuer:"🔥",Blut:"🩸",Kirche:"⛪",Museum:"🏛️",Dorf:"🏘️",Ring:"💍",Wein:"🍷",Zeitung:"📰",Flasche:"🍾",Konzert:"🎶",rot:"🔴",blau:"🔵",grün:"🟢",gelb:"🟡",schwarz:"⚫",weiß:"⚪",schwimmen:"🏊",tanzen:"💃",singen:"🎤",weinen:"😢",lachen:"😄",küssen:"💋",waschen:"🧼",klettern:"🧗",Weihnachten:"🎄",Sport:"🏅",Kamera:"📷"});
const TE={Daily:"☀️",Home:"🏠",Work:"💼",Outdoors:"🌲",Restaurant:"🍽️",Animals:"🐾",Kitchen:"🍳"};
WD.forEach(w=>{w.e=EMO[w.de]||""});
const pic=w=>w.e?`<div class="pic" aria-hidden="true">${w.e}</div>`:"";
let ptab="s",rs=-1,dt=0,AC=null;
const spk=t=>`<button class="spk" data-say="${esc(t)}" aria-label="Play pronunciation">🔊</button><button class="spk" data-say="${esc(t)}" data-slow="1" aria-label="Play slowly">🐢</button>`;

/* ---- sound effects (synthesised, no files) ---- */
function audioCtx(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();return AC}catch(e){return null}}
function tone(f,t,d,ty,v){if(ST.snd===false)return;const A=audioCtx();if(!A)return;try{const n=A.currentTime+t,o=A.createOscillator(),g=A.createGain();o.type=ty||"sine";o.frequency.value=f;g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(v||.12,n+.015);g.gain.exponentialRampToValueAtTime(.0001,n+d);o.connect(g);g.connect(A.destination);o.start(n);o.stop(n+d+.05)}catch(e){}}
const sfx={tap(){tone(520,0,.05,"sine",.05)},good(){tone(660,0,.12);tone(880,.09,.2)},easy(){tone(660,0,.1);tone(880,.08,.1);tone(1320,.16,.22)},bad(){tone(240,0,.2,"triangle",.1);tone(180,.12,.22,"triangle",.1)},level(){[523,659,784,1047].forEach((f,k)=>tone(f,k*.1,.28))},done(){[392,523,659,784].forEach((f,k)=>tone(f,k*.11,.3))},ach(){tone(784,0,.14);tone(1175,.12,.3)}};
function sndBtn(){const b=$("snd");b.textContent=ST.snd===false?"🔇":"🔊";b.setAttribute("aria-label",ST.snd===false?"Turn sounds on":"Turn sounds off")}
function shake(){const b=app.firstElementChild;if(b){b.classList.remove("shake");void b.offsetWidth;b.classList.add("shake")}}
function burst(){if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;const w=document.createElement("div");w.className="cf";const c=["var(--der)","var(--die)","var(--das)","var(--ac)"];for(let k=0;k<24;k++){const p=document.createElement("i");p.style.cssText=`left:${50+(Math.random()-.5)*30}%;background:${c[k%4]};--dx:${(Math.random()-.5)*340}px;--dy:${-90-Math.random()*200}px;--r:${Math.random()*540}deg;animation-delay:${Math.random()*.12}s`;w.appendChild(p)}document.body.appendChild(w);setTimeout(()=>w.remove(),1500)}

/* ---- pronunciation (browser text-to-speech) ---- */
function deVoice(){const v=window.speechSynthesis?speechSynthesis.getVoices():[];return v.find(x=>/^de[-_]DE/i.test(x.lang))||v.find(x=>/^de/i.test(x.lang))}
function speak(t,slow){
 const ss=window.speechSynthesis;if(!ss){pop("This browser can’t play speech");return}
 const go=()=>{const u=new SpeechSynthesisUtterance(t),v=deVoice();u.lang=v?v.lang:"de-DE";if(v)u.voice=v;else if(ss.getVoices().length)pop("No German voice found. See Progress → Settings");
  u.rate=(slow||ST.slow)?.7:.95;u.onerror=e=>{if(e.error&&e.error!=="canceled"&&e.error!=="interrupted")pop("Speech error: "+e.error)};window._u=u;
  if(ss.paused)ss.resume();if(ss.speaking||ss.pending){ss.cancel();setTimeout(()=>ss.speak(u),90)}else ss.speak(u)};
 if(ss.getVoices().length)go();else{let d=false;const run=()=>{if(!d){d=true;go()}};ss.onvoiceschanged=run;setTimeout(run,500)}}
if(window.speechSynthesis&&speechSynthesis.addEventListener)speechSynthesis.addEventListener("voiceschanged",()=>{if(tab=="p"&&ptab=="t")settingsView()});
const sayNow=()=>tab=="s"&&q[i]!==undefined?S[q[i]][0]:tab=="w"&&q[i]!==undefined?(WD[q[i]].art?WD[q[i]].art+" ":"")+WD[q[i]].de:null;
function decorate(){const a=$("ans"),say=sayNow();if(!a||!say||i>=q.length)return;
 const b=spk(say);a.insertAdjacentHTML("afterbegin",`<div class="spr">${b}</div>`);
 if(ST.dir=="de2en"){const f=app.querySelector(".sent");if(f)f.insertAdjacentHTML("beforeend",` <span class="spr">${b}</span>`);if(ST.auto)speak(say)}}

/* ---- wrap existing functions ---- */
{const _c=card;card=function(){_c();decorate()};
 const _ax=addXP;addXP=function(x){const b=lvl();_ax(x);if(lvl()>b){sfx.level();burst()}checkAch()};
 const _d=done;done=function(){_d();ST.nses=(ST.nses||0)+1;if(ses.n>0&&ses.ok==ses.n)ST.perfect=(ST.perfect||0)+1;save();sfx.done();burst();checkAch()};
 const _r=render;render=function(){if(tab=="r"||tab=="d"||tab=="m"){q=[];topbar();return tab=="r"?readView():tab=="d"?dictView():mgSetup()}_r()};
 const _s=stats;stats=function(){if(ptab=="a")return awardsView();if(ptab=="l")return ranksView();if(ptab=="t")return settingsView();_s();app.insertAdjacentHTML("afterbegin",seg())};
 const A=act,_rr=A.r,_rv=A.rev,_ch=A.chk,_ar=A.art,_hw=A.hw,_up=A.up,_un=A.un;
 A.r=function(v){sfx[+v==0?"bad":+v==5?"easy":"good"]();flash(+v==0?"no":"ok");_rr.call(A,v);if(+v==0)shake()};
 A.rev=function(){_rv.call(A);const s=sayNow();if(ST.auto&&ST.dir!="de2en"&&s)speak(s)};
 A.hw=function(v){_hw.call(A,v)};A.up=function(v){_up.call(A,v)};A.un=function(v){_un.call(A,v)};
 A.chk=function(){_ch.call(A);if(app.innerHTML.indexOf("Richtig!")>-1){ST.built=(ST.built||0)+1;sfx.good();flash("ok");const s=S[q[i]];app.firstElementChild.insertAdjacentHTML("beforeend",`<div class="spr" style="margin-top:10px">${spk(s[0])}</div>`);if(ST.auto)speak(s[0]);checkAch()}else{sfx.bad();shake();flash("no")}};
 A.art=function(v){const was=an.done;_ar.call(A,v);if(was)return;if($("am").textContent.indexOf("Correct")==0){sfx.good();flash("ok")}else{sfx.bad();shake();flash("no")}};
}

/* ---- achievements ---- */
const ACH=[
["first","🌱","First step","Answer your first card","xp",1],["s10","📖","Ten sentences","Learn 10 sentences","sent",10],["s50","📚","Fifty sentences","Learn 50 sentences","sent",50],
["s100","🎓","One hundred","Learn 100 sentences","sent",100],["s250","🏛️","Sentence scholar","Learn 250 sentences","sent",250],
["w25","🔤","25 words","Learn 25 flashcard words","words",25],["w100","🧠","100 words","Learn 100 flashcard words","words",100],
["a25","🎯","Article apprentice","Get 25 articles right","art",25],["a100","🏹","Article master","Get 100 articles right","art",100],
["t3","🔥","3-day streak","Practice 3 days in a row","streak",3],["t7","⚡","One week","Practice 7 days in a row","streak",7],["t30","🌟","One month","Practice 30 days in a row","streak",30],
["l5","⭐","Level 5","Reach level 5","lvl",5],["l15","🅰️","A1 reached","Reach level 15","lvl",15],["l40","🥈","A2 reached","Reach level 40","lvl",40],
["x5","🔁","Regular","Finish 5 sessions","ses",5],["x25","💪","Dedicated","Finish 25 sessions","ses",25],["p1","💎","Flawless","Finish a session recalling every card well","perf",1],
["b20","🧩","Sentence builder","Build 20 sentences","built",20],["r1","📰","First story","Finish a story quiz","stories",1],["r5","📕","Bookworm","Finish every story","stories",5],
["w500","🏅","500 words","Learn 500 flashcard words","words",500],["w1000","🏆","Core 1000","Learn all core words","words",980],["m10","⏱️","Quick hands","Match 10 pairs in one Blitz","mbest",10],["m25","🚀","Lightning","Match 25 pairs in one Blitz","mbest",25],["d10","🔎","Curious","Look up 10 words in the dictionary","dict",10]];
function sstat(){const A=Object.values(ST.art||{});return{xp:ST.xp,sent:learned().length,words:Object.keys(ST.cards).filter(k=>k[0]=="w"&&ST.cards[k].reps>=1).length,art:A.reduce((a,x)=>a+x.ok,0),streak:Math.max(ST.streak||0,ST.best||0),lvl:lvl(),ses:ST.nses||0,built:ST.built||0,stories:Object.keys(ST.read||{}).length,dict:Object.keys(ST.dq||{}).length,perf:ST.perfect||0,mbest:ST.mbest||0}}
function checkAch(){ST.ach=ST.ach||{};const s=sstat();let d=0;
 ACH.forEach(a=>{if(!ST.ach[a[0]]&&s[a[4]]>=a[5]){ST.ach[a[0]]=day();setTimeout(()=>{pop(`${a[1]} ${a[2]}`);sfx.ach()},900+d++*1300)}});if(d)save()}
function seg(){return`<div class="seg" role="tablist">${[["s","Stats"],["a","Awards"],["l","Ranks"],["t","Settings"]].map(([k,l])=>`<button class="${ptab==k?"on":""}" data-pt="${k}">${l}</button>`).join("")}</div>`}
function awardsView(){ST.ach=ST.ach||{};const s=sstat(),n=ACH.filter(a=>ST.ach[a[0]]).length;
 app.innerHTML=seg()+`<div class="box"><div class="meta"><b style="color:var(--fg)">Achievements</b><span>${n} / ${ACH.length}</span></div><div class="bar"><i style="width:${n/ACH.length*100}%"></i></div>
 <div class="ach">${ACH.map(a=>{const u=ST.ach[a[0]],v=Math.min(s[a[4]],a[5]);return`<div class="ac${u?" on":""}"><span class="ic">${a[1]}</span><b>${a[2]}</b><span class="en" style="font-size:13px">${a[3]}</span>${u?`<span class="tg">${u}</span>`:`<div class="bar" style="margin:6px 0 0"><i style="width:${v/a[5]*100}%"></i></div><span class="en" style="font-size:12px">${v}/${a[5]}</span>`}</div>`}).join("")}</div></div>`}

/* ---- leaderboard (Supabase) ---- */
async function lbPush(){if(!sb||!USER||!ST.lb||!ST.nick)return;try{await sb.from("leaderboard").upsert({user_id:USER.id,name:ST.nick,xp:ST.xp,streak:ST.streak||0,sentences:learned().length,updated_at:new Date().toISOString()})}catch(e){}}
{const _p=push;push=async function(){await _p();lbPush()}}
async function ranksView(){
 app.innerHTML=seg()+`<div class="box"><p class="en">Loading…</p></div>`;
 if(!sb){app.innerHTML=seg()+`<div class="box"><p class="en">The leaderboard needs accounts, which aren’t switched on for this site yet.</p></div>`;return}
 let rows=[],err=false;
 try{const r=await sb.from("leaderboard").select("name,xp,streak,sentences").order("xp",{ascending:false}).limit(20);if(r.error)throw r.error;rows=r.data||[]}catch(e){err=true}
 if(tab!="p"||ptab!="l")return;
 const me=USER?(ST.lb?`<div class="note">You’re on the leaderboard as <b>${esc(ST.nick||"")}</b>. <a href="#" data-lb="leave">Leave</a></div>`:`<div class="note"><b>Join the leaderboard</b><div class="en" style="font-size:14px">Opt-in. Only your nickname, XP, streak and sentence count are shown publicly.</div><label for="nk">Nickname (2–20 characters)</label><input id="nk" maxlength="20" autocomplete="off"><div style="height:10px"></div><button class="btn p" data-lb="join">Join</button><p id="lm" class="en" style="font-size:14px;margin:8px 0 0"></p></div>`):`<div class="note"><a href="#" data-m="login">Log in</a> to join the leaderboard.</div>`;
 app.innerHTML=seg()+`<div class="box"><div class="meta"><b style="color:var(--fg)">Top learners</b><span>by XP</span></div>${err?`<p class="en">Couldn’t load the leaderboard. Try again later.</p>`:rows.length?`<div class="lb">${rows.map((r,k)=>`<div class="lr${ST.lb&&r.name==ST.nick?" me":""}"><span>${k+1}</span><span class="nm">${esc(r.name)}</span><span>Lv ${Math.min(100,Math.floor(r.xp/150))}</span><span>${r.xp} XP</span><span>🔥 ${r.streak}</span></div>`).join("")}</div>`:`<p class="en">No one has joined yet. Be the first.</p>`}${me}</div>`}
async function lbAct(v){
 if(!sb||!USER)return;
 if(v=="join"){const n=($("nk").value||"").trim(),m=$("lm");if(!/^[\p{L}\p{N} _.-]{2,20}$/u.test(n)){m.textContent="Use 2–20 letters, numbers, spaces, . _ or -";return}
  ST.lb=true;ST.nick=n;save();await lbPush();pop("You’re on the board");ranksView()}
 else{ST.lb=false;save();try{await sb.from("leaderboard").delete().eq("user_id",USER.id)}catch(e){}ranksView()}}

/* ---- settings ---- */
function settingsView(){const on=x=>x?"On":"Off",row=(t,d,k,val)=>`<div class="set"><div><b>${t}</b><div class="en" style="font-size:14px">${d}</div></div><button class="btn" data-set="${k}" style="width:auto;min-width:70px">${val}</button></div>`;
 const ss=window.speechSynthesis,nv=ss?ss.getVoices().filter(x=>/^de/i.test(x.lang)):[],ac=AC?AC.state:"not started yet";
 app.innerHTML=seg()+`<div class="box">${row("Sound effects","Short tones for right and wrong answers","snd",on(ST.snd!==false))}${row("Tap feedback","A tiny tick and vibration when you tap (vibration: Android)","hap",on(ST.hap!==false))}${row("Auto-play pronunciation","Speak German when an answer is revealed","auto",on(ST.auto))}${row("Always show real-life German","Open the casual, spoken version on every card that has one","casual",on(ST.casual))}${row("Hide Astro’s pop-ups","Astro is your coach. Turn this on if he gets too chatty.","aoff",on(ST.aoff))}${row("Slow speech","Slower, clearer pronunciation","slow",on(ST.slow))}${row("Support with ads","Optional and off by default. Clean, non-intrusive ads help keep this free.","ads",on(ST.ads))}
 <div class="note"><b>🪙 ${coins()} coins · ❄️ ${(ST.fb||0)-(ST.fu||0)} streak freeze${(ST.fb||0)-(ST.fu||0)==1?"":"s"}</b><div class="en" style="font-size:14px">Earn coins by practicing. A streak freeze protects your streak if you miss a day (max 2).</div><div style="height:8px"></div><button class="btn" data-do="buyfz">Buy a freeze · 50 🪙</button></div>
 <div class="note"><b>Check your audio</b><div class="row" style="margin-top:8px"><button class="btn" data-do="tsnd">Test sound</button><button class="btn" data-do="tvoice">Test German voice</button></div>
 <p class="en" style="font-size:13px;margin:10px 0 0">Sound engine: ${ac}. Speech: ${ss?"supported":"not supported"}. German voices found: ${nv.length?nv.map(x=>esc(x.name)).join(", "):"none"}.</p>
 <p class="en" style="font-size:13px;margin:6px 0 0">No sound? Raise the volume, turn off the iPhone silent switch, and open the site in Safari or Chrome instead of inside another app. No German voice? Install one in your system settings: Android → Text-to-speech → Google → German; iPhone → Accessibility → Spoken Content → Voices → German; Windows → Time &amp; language → Speech.</p></div></div>`}
let USEMIN=0;setInterval(()=>{if(document.visibilityState=="visible"){USEMIN+=.5;ST.tm=(ST.tm||0)+.5;save()}},3e4);
const fmtT=m=>m<60?Math.round(m)+" min":Math.floor(m/60)+" h "+Math.round(m%60)+" min";
{const _st=stats;stats=function(){_st();app.insertAdjacentHTML("afterbegin",`<div class="note"><b>⏱️ Time spent learning</b><div class="en" style="font-size:15px">${fmtT(ST.tm||0)} in total</div></div>`)}}
let adOn=false;function adLoad(){if(adOn||!ST.ads||!AD_CLIENT)return;adOn=true;const s=document.createElement("script");s.async=true;s.crossOrigin="anonymous";s.src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client="+AD_CLIENT;document.head.appendChild(s)}
function adShow(){if(!ST.ads||!AD_CLIENT||!AD_SLOT)return;adLoad();app.insertAdjacentHTML("beforeend",`<div class="note" style="text-align:center"><span class="en" style="font-size:11px">Ad</span><ins class="adsbygoogle" style="display:block" data-ad-client="${AD_CLIENT}" data-ad-slot="${AD_SLOT}" data-ad-format="auto" data-full-width-responsive="true"></ins></div>`);try{(adsbygoogle=window.adsbygoogle||[]).push({})}catch(e){}}
function nag(){if(ST.ads||USEMIN<15)return;const l=ST.nag?Date.parse(ST.nag):0;if(Date.now()-l<12096e5)return;ST.nag=day();save();
 app.insertAdjacentHTML("beforeend",`<div class="note" id="nag"><b>Hey, would you like to support the creator?</b><div class="en" style="font-size:14px">You can turn on ads. They’re clean, optional and off by default.</div><div class="row" style="margin-top:8px"><button class="btn p" data-do="adson">Turn on ads</button><button class="btn" data-do="adlater">Maybe later</button></div></div>`)}
{const _d3=done;done=function(){_d3();adShow();nag()}}
adLoad();
function setting(k){ST[k]=k=="snd"?(ST.snd===false):k=="hap"?(ST.hap===false):!ST[k];save();sndBtn();settingsView();if(k=="snd")sfx.good();if(k=="ads")adLoad()}

/* ---- stories ---- */

STORY.forEach((s,k)=>s.e=["☀️","☕","🐕","🏢","✉️"][k]);
function readView(){
 if(rs>=0)return storyView();
 app.innerHTML=`<div class="box"><p class="en" style="margin:0 0 10px;font-size:15px">${STORY.length} starter stories written for this site (A1 to B1). Tap a German sentence for its translation, listen, answer a question, then write your own version.</p>
 ${STORY.map((s,k)=>`<button class="item" data-st="${k}"><span><b>${s.e} ${s.t}</b><span class="en" style="display:block;font-size:14px">${s.s.length} sentences</span></span><span class="tg">${s.l}${ST.read&&ST.read[s.t]?" ✓":""}</span></button>`).join("")}
 <div class="note"><b>Free graded reading elsewhere</b><div class="lk lib"><a href="https://www.inklingo.app/german/stories" target="_blank" rel="noopener">Inklingo</a> – graded stories A0–B2 with audio and quizzes<a href="https://www.lenguia.com/stories/german" target="_blank" rel="noopener">Lenguia</a> – free graded German stories<a href="https://learngerman.dw.com/" target="_blank" rel="noopener">DW Learn German</a> – courses and stories, A1–C1<a href="https://slowgerman.com/" target="_blank" rel="noopener">Slow German</a> – clearly spoken texts with transcripts<a href="https://www.nachrichtenleicht.de/" target="_blank" rel="noopener">Nachrichtenleicht</a> – news in simple German<a href="https://www.langcen.cam.ac.uk/resources/langg/ge_data/ge_640.html" target="_blank" rel="noopener">Cambridge Language Centre</a> – open-access B1 reader with audio<a href="https://www.projekt-gutenberg.org/" target="_blank" rel="noopener">Projekt Gutenberg-DE</a> – public-domain classics (advanced)</div><p class="en" style="font-size:13px;margin:8px 0 0">These are independent sites. Their texts belong to their authors, so we link to them instead of copying them.</p></div></div>`}
function storyView(){const s=STORY[rs],full=s.s.map(x=>x[0]).join(" ");
 app.innerHTML=`<div class="box"><div class="meta"><button class="chip" data-st="-1" style="margin:0">← Stories</button><span class="tg">${s.l}</span></div>
 <h2 style="margin:14px 0 4px;font-size:22px">${s.e} ${s.t}</h2><div style="margin-bottom:6px">${spk(full)}<span class="en" style="font-size:13px"> whole story</span></div>
 ${s.s.map((x,k)=>`<div class="ln"><span class="de" data-tr="${k}" role="button" tabindex="0">${col(esc(x[0]))}</span> <button class="spk" data-say="${esc(x[0])}" aria-label="Play sentence">🔊</button><div id="tr${k}" class="en hide" style="font-size:16px">${esc(x[1])}</div></div>`).join("")}
 <div class="note"><b>Words you know here</b>${gloss(full)||`<p class="en" style="font-size:14px;margin:4px 0 0">None from the word list yet.</p>`}</div>
 <div class="note" id="qz"><b>Check your understanding</b><p style="margin:6px 0">${s.q[0]}</p>${shuf(s.q[1].map((t,k)=>[t,k])).map(([t,k])=>`<button class="btn" style="margin:4px 0;text-align:left" data-qa="${k}">${t}</button>`).join("")}<div id="qr"></div></div>
 <div class="note"><b>Now write</b><p class="en" style="margin:6px 0;font-size:15px">${s.w[0]}</p><textarea id="wr" rows="5" placeholder="Schreib hier auf Deutsch…" style="width:100%;font:inherit;background:var(--card);color:var(--fg);border:1px solid var(--bd);border-radius:10px;padding:10px"></textarea><div style="height:8px"></div><button class="btn" data-rd="model">Show a model answer</button><div id="wm" class="hide"></div></div></div>`}
function quizAns(k){const s=STORY[rs];
 if(k==0){sfx.good();if(!(ST.read&&ST.read[s.t])){ST.read=ST.read||{};ST.read[s.t]=day();addXP(15)}save();
  $("qz").querySelectorAll("[data-qa]").forEach(b=>b.disabled=true);$("qr").innerHTML=`<p style="margin:8px 0 0"><b>Richtig!</b> Story complete.</p>`}
 else{sfx.bad();$("qr").innerHTML=`<p class="en" style="margin:8px 0 0">Not quite. Read the story again and try another answer.</p>`}}

/* ---- dictionary, translator, ranked top-1000 list ---- */
let dtab="l",tdir="en|de",bsel={r:"100",l:"0",p:"0"};
const dseg=()=>`<div class="seg">${[["l","Look up"],["t","Translate"]].map(([k,l])=>`<button class="${dtab==k?"on":""}" data-dt="${k}">${l}</button>`).join("")}</div>`;
function dsearch(qr){const x=nz(qr.trim());if(x.length<2)return{w:[],s:[]};
 const sc=w=>{const d=nz(w.de),e=nz(w.en);return d==x?100:e.split(/[ ,;()]+/).includes(x)?90:d.startsWith(x)?70:e.includes(x)?50:d.includes(x)?30:0};
 let m=WD.map(v=>[sc(v),v]).filter(a=>a[0]);if(m.some(a=>a[0]>=50))m=m.filter(a=>a[0]>30);
 return{w:m.sort((a,b)=>b[0]-a[0]||a[1].rank-b[1].rank).slice(0,15).map(a=>a[1]),s:S.filter(r=>nz(r[0]).includes(x)||nz(r[1]).includes(x)).slice(0,4)}}
function dictView(){if(dtab=="t")return transView();
 app.innerHTML=dseg()+`<div class="box"><label for="dq" style="margin-top:0">Type English or German</label><input id="dq" type="search" placeholder="e.g. hungry, Haus, to cook" autocomplete="off"><div id="dr"></div><div id="db"></div></div>`;dbrowse()}
function dres(v){
 const r=dsearch(v),x=v.trim();$("db").classList.toggle("hide",x.length>=2);
 if(x.length<2){$("dr").innerHTML="";return}
 const L=encodeURIComponent(x);
 $("dr").innerHTML=(r.w.length?r.w.map(w=>`<div class="dw"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><span><b>${w.e?w.e+" ":""}${wcol(w)}</b> <span class="en">${esc(w.en)}</span></span><span style="white-space:nowrap">${spk((w.art?w.art+" ":"")+w.de)}</span></div><div><span class="tg">#${w.rank}</span><span class="tg">${w.lv}</span><span class="tg">${POS[w.pos]}</span></div>${ex(w)}</div>`).join(""):`<p class="en">No match in the ${WD.length} most common words.</p>`)
 +(r.s.length?`<div class="note"><b>In sentences</b>${r.s.map(s=>`<div style="margin:6px 0">${col(esc(s[0]))} ${spk(s[0])}<div class="en" style="font-size:15px">${esc(s[1])}</div></div>`).join("")}</div>`:"")
 +`<div class="note lk"><a href="#" data-do="tx" data-v="${esc(x)}">Translate “${esc(x)}” with the translator</a><br>Or try <a href="https://www.dict.cc/?s=${L}" target="_blank" rel="noopener">dict.cc</a> · <a href="https://de.wiktionary.org/wiki/${L}" target="_blank" rel="noopener">Wiktionary</a> · <a href="https://www.deepl.com/translator#en/de/${L}" target="_blank" rel="noopener">DeepL</a></div>`}
function dbrowse(){const f={r:bsel.r,l:bsel.l,t:"0"},P=bsel.p,list=WD.filter(w=>ok(f,w)&&(P=="0"||w.pos==P));
 const rs_=[["0","Ranks 1–1000"]];for(let b=100;b<=1000;b+=100)rs_.push([b,`Ranks ${b-99}–${b}`]);
 const ps=[["0","All types"],...Object.keys(POS).map(k=>[k,POS[k][0].toUpperCase()+POS[k].slice(1)])];
 $("db").innerHTML=`<p class="en" style="font-size:14px;margin:16px 0 8px"><b style="color:var(--fg)">The 1,000 most common German words</b>, ranked by frequency (${list.length} shown)</p>
 <div class="row3"><select id="bb" aria-label="Rank range">${opts(rs_,bsel.r)}</select><select id="bl" aria-label="Level">${opts([["0","All levels"],["A1","A1"],["A2","A2"],["B1","B1"],["B2","B2"]],bsel.l)}</select><select id="bp" aria-label="Word type">${opts(ps,bsel.p)}</select></div>
 <div id="dl">${list.map(w=>{const c=ST.cards["w"+w.rank];return`<div class="dl"><span class="rk">${w.rank}</span><span>${w.e?w.e+" ":""}${wcol(w)}${c&&c.reps>=1?" ✓":""}</span><span class="en">${esc(w.en)} <i>· ${w.lv}</i></span><button class="spk" data-say="${esc((w.art?w.art+" ":"")+w.de)}" aria-label="Play">🔊</button></div>`}).join("")}</div>
 <p class="en" style="font-size:12px;margin-top:12px">Word list and translations: Lenguia (lenguia.com). ✓ = learned in Words.</p>`}
function transView(){app.innerHTML=dseg()+`<div class="box"><div class="row"><button class="btn${tdir=="en|de"?" p":""}" data-td="en|de">English → German</button><button class="btn${tdir=="de|en"?" p":""}" data-td="de|en">German → English</button></div>
 <label for="tx">${tdir=="en|de"?"English":"German"} text (up to 500 characters)</label><textarea id="tx" class="ta" rows="3" maxlength="500"></textarea><div style="height:10px"></div><button class="btn p" data-do="trans">Translate</button><div id="to" style="margin-top:12px"></div>
 <p class="en" style="font-size:13px;margin:12px 0 0">Machine translation by MyMemory: good for words and short sentences, but it can be wrong, especially with idioms. Your text is sent to translated.net to get the result (see Privacy). The free limit is about 5,000 characters per day per network.</p></div>`}
async function doTrans(){const x=$("tx").value.trim();if(!x)return;$("to").innerHTML=`<p class="en">Translating…</p>`;
 try{const r=await fetch("https://api.mymemory.translated.net/get?q="+encodeURIComponent(x)+"&langpair="+encodeURIComponent(tdir)),j=await r.json();
  if(j.responseStatus!=200)throw new Error("limit");
  const txt=new DOMParser().parseFromString(j.responseData.translatedText,"text/html").documentElement.textContent,de=tdir=="en|de"?txt:x;
  $("to").innerHTML=`<div class="note" style="margin:0"><div style="font-size:20px">${tdir=="en|de"?col(esc(txt)):esc(txt)}</div><div style="margin-top:8px">${spk(de)}</div></div>`;
  ST.tn=(ST.tn||0)+1;save()}
 catch(e){$("to").innerHTML=`<p class="en">Couldn’t translate right now (daily limit reached or no connection). Try again later, or use dict.cc or DeepL.</p>`}}
function doAct(a,v){
 if(a=="buyfz"){if((ST.fb||0)-(ST.fu||0)>=2)pop("You already have 2 freezes");else if(coins()<50)pop("Not enough coins yet");else{ST.cs=(ST.cs||0)+50;ST.fb=(ST.fb||0)+1;save();pop("❄️ Streak freeze added");topbar();settingsView()}}
 else if(a=="adson"){ST.ads=true;save();pop("Thank you! Ads are on");adLoad()}else if(a=="adlater"){const n=$("nag");if(n)n.remove()}
 else if(a=="trans")doTrans();
 else if(a=="tx"){dtab="t";tdir=/[äöüß]|\b(der|die|das|ich|und|nicht|ist)\b/i.test(v)?"de|en":"en|de";render();$("tx").value=v}
 else if(a=="tsnd"){sfx.level();pop("Playing test sound")}else if(a=="tvoice")speak("Guten Tag! Das ist ein Test.");
 else if(a=="mgstart")mgStart();else if(a=="mgagain")mgSetup()}

/* ---- Word Match Blitz ---- */
let MG=null;
const eshort=w=>w.en.split(/[;(,]/)[0].trim();
let mgPool=()=>WD.filter(w=>w.rank<=500&&"nvjdm".includes(w.pos)&&eshort(w).length<=20);
function mgStop(){if(MG&&MG.iv)clearInterval(MG.iv);MG=null}
function mgNew(){const u=new Set(MG.L.map(x=>x.rank)),e=new Set(MG.R.map(eshort));for(let n=0;n<200;n++){const w=MG.pool[Math.floor(Math.random()*MG.pool.length)];if(!u.has(w.rank)&&!e.has(eshort(w)))return w}return MG.pool[0]}
async function mgBoard(){if(!sb)return`<p class="en">The online leaderboard isn’t switched on yet.</p>`;
 try{const r=await sb.from("match_scores").select("name,score").order("score",{ascending:false}).limit(10);if(r.error)throw r.error;
  return r.data.length?`<div class="lb">${r.data.map((x,k)=>`<div class="lr${ST.lb&&x.name==ST.nick?" me":""}" style="grid-template-columns:28px 1fr 60px"><span>${k+1}</span><span class="nm">${esc(x.name)}</span><span>${x.score}</span></div>`).join("")}</div>`:`<p class="en">No scores yet. Be the first.</p>`}
 catch(e){return`<p class="en">Leaderboard unavailable right now.</p>`}}
async function mgSubmit(sc){if(!sb||!USER||!ST.lb||!ST.nick||sc<1)return false;
 try{const r=await sb.from("match_scores").select("score").eq("user_id",USER.id).maybeSingle();if(r.error)throw r.error;
  if(!r.data||sc>r.data.score){const w=await sb.from("match_scores").upsert({user_id:USER.id,name:ST.nick,score:sc,updated_at:new Date().toISOString()});if(w.error)throw w.error}return true}catch(e){return false}}
function mgSetup(){mgStop();
 app.innerHTML=`<div class="box"><h2 style="margin:0 0 6px;font-size:22px">Word Match Blitz ⏱️</h2><p class="en" style="margin:0 0 10px">${ST.mt||60} seconds. Match each German word with its English meaning. Every pair scores a point and a wrong match costs 2 seconds. Words come from the 500 most common German words.</p>
 <div class="meta"><span>Your best</span><b style="color:var(--fg)">${ST.mbest||0}</b></div><div style="height:14px"></div><button class="btn p" data-do="mgstart">Start</button></div>
 <div class="box" style="margin-top:12px"><b>Top 10 worldwide</b><div id="mgb"><p class="en">Loading…</p></div>${sb&&!(ST.lb&&ST.nick)?`<p class="en" style="font-size:13px;margin:10px 0 0">To post your score, log in and join the leaderboard under Progress → Ranks.</p>`:""}</div>`;
 mgBoard().then(h=>{const el=$("mgb");if(el&&tab=="m"&&!MG)el.innerHTML=h})}
function mgStart(){mgStop();MG={pool:mgPool(),L:[],R:[],sel:null,score:0,end:Date.now()+(ST.mt||60)*1000,done:false,iv:0};
 for(let k=0;k<6;k++){const w=mgNew();MG.L.push(w);MG.R.push(w)}MG.R=shuf(MG.R);
 app.innerHTML=`<div class="box"><div class="meta"><span>Matched <b id="ms" style="color:var(--fg)">0</b></span><span id="mt">60s</span></div><div class="bar"><i id="mgbar" style="width:100%;animation:none"></i></div><div id="mgg" class="mg"></div></div>`;
 mgGrid();MG.iv=setInterval(mgTick,200)}
function mgGrid(){const sl=(s,k)=>MG.sel&&MG.sel[0]==s&&MG.sel[1]==k?" sel":"";
 $("mgg").innerHTML=`<div>${MG.L.map((w,k)=>`<button class="tile${sl("L",k)}" data-mg="L${k}">${w.art?`<span class="${w.art}">${w.art}</span> `:""}${w.de}</button>`).join("")}</div><div>${MG.R.map((w,k)=>`<button class="tile${sl("R",k)}" data-mg="R${k}">${esc(eshort(w))}</button>`).join("")}</div>`}
function mgTick(){if(!MG||MG.done)return;const left=Math.max(0,(MG.end-Date.now())/1000),t=$("mt"),b=$("mgbar");if(t)t.textContent=Math.ceil(left)+"s";if(b)b.style.width=Math.min(100,left/(ST.mt||60)*100)+"%";if(left<=0)mgEnd()}
function mgTap(s,k){if(!MG||MG.done)return;
 if(!MG.sel||MG.sel[0]==s){MG.sel=[s,k];return mgGrid()}
 const a=MG.sel[0]=="L"?MG.sel[1]:k,b=MG.sel[0]=="L"?k:MG.sel[1];MG.sel=null;
 if(MG.L[a].rank==MG.R[b].rank){MG.score++;sfx.good();flash("ok");const nw=mgNew();MG.L[a]=nw;MG.R[b]=nw;$("ms").textContent=MG.score}
 else{MG.end-=2000;sfx.bad();shake();flash("no")}
 mgGrid()}
async function mgEnd(){if(!MG||MG.done)return;MG.done=true;clearInterval(MG.iv);const sc=MG.score,nb=sc>(ST.mbest||0);if(nb)ST.mbest=sc;
 addXP(Math.min(40,sc*2));save();sfx.done();burst();checkAch();
 app.innerHTML=`<div class="box"><div class="sent" style="min-height:0">Time’s up!</div><div class="grid"><div class="stat"><b>${sc}</b><span>pairs matched</span></div><div class="stat"><b>${ST.mbest||0}</b><span>${nb?"new personal best":"your best"}</span></div></div><div id="mgs" class="en" style="font-size:14px;margin-bottom:10px"></div><div class="row"><button class="btn" data-do="mgagain">Menu</button><button class="btn p" data-do="mgstart">Play again</button></div></div>
 <div class="box" style="margin-top:12px"><b>Top 10 worldwide</b><div id="mgb"><p class="en">Loading…</p></div></div>`;
 const posted=await mgSubmit(sc);if($("mgs")&&tab=="m")$("mgs").textContent=posted?"Score posted to the leaderboard.":(sb&&!(ST.lb&&ST.nick)?"Join the leaderboard in Progress → Ranks to post your score.":"");
 const h=await mgBoard();if($("mgb")&&tab=="m")$("mgb").innerHTML=h}

/* ---- events ---- */
document.addEventListener("click",e=>{let b;const t=e.target;
 if(b=t.closest("[data-say]"))speak(b.dataset.say,b.dataset.slow);
 else if(b=t.closest("[data-pt]")){ptab=b.dataset.pt;render()}
 else if(b=t.closest("[data-set]"))setting(b.dataset.set);
 else if(b=t.closest("[data-lb]")){e.preventDefault();lbAct(b.dataset.lb)}
 else if(b=t.closest("[data-st]")){rs=+b.dataset.st;readView();window.scrollTo&&scrollTo(0,0)}
 else if(b=t.closest("[data-tr]")){$("tr"+b.dataset.tr).classList.toggle("hide");sfx.tap()}
 else if(b=t.closest("[data-qa]"))quizAns(+b.dataset.qa);
 else if(b=t.closest("[data-lt]")){tab=b.dataset.lt;rs=-1;mgStop();render();window.scrollTo&&scrollTo(0,0)}
 else if(b=t.closest("[data-g]")){tab=b.dataset.g=="s"&&grp(tab)=="s"?tab:b.dataset.g;rs=-1;mgStop();render();window.scrollTo&&scrollTo(0,0)}
 else if(b=t.closest("[data-dt]")){dtab=b.dataset.dt;render()}
 else if(b=t.closest("[data-td]")){tdir=b.dataset.td;transView()}
 else if(b=t.closest("[data-mg]"))mgTap(b.dataset.mg[0],+b.dataset.mg.slice(1));
 else if(b=t.closest("[data-do]")){e.preventDefault();doAct(b.dataset.do,b.dataset.v)}
 else if(b=t.closest("[data-rd]")){const w=STORY[rs].w;$("wm").innerHTML=`<div class="note"><b>Model answer</b><div>${col(esc(w[1]))} ${spk(w[1])}</div><div class="en" style="font-size:15px;margin-top:6px">${esc(w[2])}</div></div>`;$("wm").classList.remove("hide")}});
document.addEventListener("keydown",e=>{if((e.key=="Enter"||e.key==" ")&&e.target.dataset&&e.target.dataset.tr!==undefined){e.preventDefault();e.target.click()}});
document.addEventListener("input",e=>{if(e.target.id!="dq")return;dres(e.target.value);clearTimeout(dt);
 dt=setTimeout(()=>{const x=nz(e.target.value.trim());if(x.length>=3&&dsearch(x).w.length){ST.dq=ST.dq||{};if(Object.keys(ST.dq).length<400){ST.dq[x]=1;save();checkAch()}}},1000)});
document.addEventListener("change",e=>{if(e.target.id=="bb"||e.target.id=="bl"||e.target.id=="bp"){bsel={r:$("bb").value,l:$("bl").value,p:$("bp").value};dbrowse()}});
$("nav").addEventListener("click",e=>{if(e.target.closest("[data-t]")){rs=-1;mgStop()}},true);
$("snd").onclick=()=>{ST.snd=ST.snd===false;save();sndBtn();sfx.good()};
if(ST.wv!==2){for(const k in ST.cards)if(k[0]=="w")delete ST.cards[k];ST.wv=2;save()}
sndBtn();setTimeout(checkAch,1500);
/* ---- navigation, tap feedback, flash ---- */
const LT=[["s","Sentences"],["b","Build"],["a","Articles"],["w","Words"]];
const lseg=()=>`<div class="seg" role="tablist" aria-label="Practice mode">${LT.map(([k,l])=>`<button class="${tab==k?"on":""}" data-lt="${k}">${l}</button>`).join("")}</div>`;
const grp=t=>"sbaw".includes(t)?"s":t;
function bbHi(){document.querySelectorAll("#bbar button").forEach(b=>b.classList.toggle("on",b.dataset.g==grp(tab)))}
function flash(k){let f=$("flash");if(!f){f=document.createElement("div");f.id="flash";document.body.appendChild(f)}f.className="";void f.offsetWidth;f.className="fl-"+k}
{const _f=form;form=function(m){_f(m);app.insertAdjacentHTML("afterbegin",lseg())};
 const _r2=render;render=function(){_r2();if(tab=="a")app.insertAdjacentHTML("afterbegin",lseg());bbHi()}}
document.addEventListener("pointerdown",e=>{audioCtx();const b=e.target.closest&&e.target.closest(".btn,.chip,.tile,.item,.seg button,.bb button,.spk,.x");if(!b||b.disabled)return;sfx.tap();if(ST.hap!==false&&navigator.vibrate)navigator.vibrate(8)},{passive:true});
bbHi();render();

