// Coin economy. Pure addition (patches addXP by wrapping it, like features.js does).
// Earning is capped per day, spending is cheap but not free, so coins matter without being a grind.
//
//  EARN   practice XP (existing)      ~1 coin per 5 XP
//         daily gift from Astro       5 + streak days (max +7), once a day
//         streak bonuses              3d +10, 7d +25, 14d +50, 30d +100, 60d +150 (once each)
//         active time                 +3 every 20 active minutes, max 6 a day, +5 bonus each active hour
//         surprise gifts              2-6, at most 3 a day, only while you are actively learning
//         card goals                  25 cards +5, 50 cards +10, 100 cards +20 (each once a day)
//         level up                    +10
//         exams / lessons (existing)  +10 lesson, +25 exam (first pass)
//  SPEND  word lookup                 2 (3 after 20 a day). 3 free a day. Words you already learned and repeat taps are free.
//         quiz hint                   3
//         Astro online chat           5 free a day, then 3
//         streak freeze               50 (max 2)
(function(){
const COST={look:2,look2:3,hint:3,chat:3},FREE={look:3,chat:5};
function E(){const t=day();if(!ST.eco||ST.eco.d!=t)ST.eco={d:t,act:0,tr:0,gf:0,lk:0,fl:FREE.look,ch:0,ms:"",by:{},seen:{},hint:0,sp:0};return ST.eco}
const say=(m,a,f)=>typeof astroSay=="function"?astroSay(m,a,f===undefined?true:f):pop(m.replace(/<[^>]+>/g,""));
function earn(n,why){n=Math.round(n);if(!(n>0))return 0;ST.ce=(ST.ce||0)+n;const e=E();e.by[why]=(e.by[why]||0)+n;save();topbar();return n}
function spend(n,why){if(coins()<n)return false;ST.cs=(ST.cs||0)+n;const e=E();e.sp=(e.sp||0)+n;save();topbar();return true}
window.ecoEarn=earn;window.ecoSpend=spend;window.ecoCost=COST;window.ecoState=E;

// ---- word lookups ----
window.ecoLookupPreview=function(word,known){const e=E(),k=String(word).toLowerCase();
 if(known)return{cost:0,why:"known"};if(e.seen[k])return{cost:0,why:"again"};if(e.fl>0)return{cost:0,why:"free"};return{cost:e.lk<20?COST.look:COST.look2,why:"paid"}};
window.ecoLookup=function(word,known){const e=E(),k=String(word).toLowerCase(),p=ecoLookupPreview(word,known);
 if(p.why=="known"||p.why=="again")return{ok:true,cost:0,why:p.why};
 if(p.why=="free"){e.fl--;e.seen[k]=1;e.lk++;save();return{ok:true,cost:0,why:"free"}}
 if(!spend(p.cost,"lookup"))return{ok:false,cost:p.cost,why:"broke"};e.seen[k]=1;e.lk++;save();return{ok:true,cost:p.cost,why:"paid"}};
window.ecoChatCharge=function(){const e=E();if(e.ch<FREE.chat){e.ch++;save();return{ok:true,cost:0}}if(!spend(COST.chat,"chat"))return{ok:false,cost:COST.chat};e.ch++;save();return{ok:true,cost:COST.chat}};
window.ecoHint=function(){const e=E();if(!spend(COST.hint,"hint"))return false;e.hint++;save();return true};

// ---- daily gift + streak bonuses ----
const SMS={3:10,7:25,14:50,30:100,60:150};
window.claimDaily=function(){const t=day();if(ST.ci==t)return false;ST.ci=t;const a=5+Math.min(ST.streak||0,7);earn(a,"daily");let extra=0,txt="";
 Object.keys(SMS).forEach(k=>{if((ST.streak||0)>=+k&&!(ST.sms||"").includes(","+k+",")){ST.sms=(ST.sms||"")+","+k+",";extra+=SMS[k];txt=` And a ${k}-day streak bonus: +${SMS[k]} 🪙!`}});
 if(extra)earn(extra,"streak");save();try{sfx.ach()}catch(e){}
 say(`${ABrain.gift(a)}${txt}`);return true};
let offered=false;
function offerDaily(){if(offered||ST.ci==day()||!(ST.tour||ST.xp))return;offered=true;
 say(ABrain.hello()+" I’ve got your daily gift.",["🎁 Open gift",()=>{claimDaily();if(typeof tab!="undefined"&&tab=="l"&&typeof render=="function")render()}],true)}
setTimeout(offerDaily,3500);setInterval(offerDaily,20000);

// ---- addXP wrapper: practice coins tracked, goals and level-ups rewarded ----
{const _ax=addXP;addXP=function(x){const b=lvl(),c0=ST.ce||0,e=E();_ax(x);e.by.practice=(e.by.practice||0)+((ST.ce||0)-c0);
 if(lvl()>b)earn(10,"levelup");
 const n=ST.today&&ST.today.d==day()?ST.today.n:0;
 [[25,5],[50,10],[100,20]].forEach(([k,v])=>{if(n>=k&&!e.ms.includes(","+k+",")){e.ms+=","+k+",";earn(v,"goal");say(`${k} cards today, ${uname()||"nice"}! +${v} 🪙`,null,true)}});
 const l=learned().length;[10,25,50,100,250,500].forEach(m=>{if(l>=m&&!(ST.lms||"").includes(","+m+",")){ST.lms=(ST.lms||"")+","+m+",";say(ABrain.milestone(m),null,true)}})}}

// ---- active time ----
let lastIn=Date.now();["pointerdown","keydown","touchstart","scroll"].forEach(ev=>document.addEventListener(ev,()=>lastIn=Date.now(),{passive:true,capture:true}));
setInterval(()=>{if(document.visibilityState!="visible"||Date.now()-lastIn>9e4)return;const e=E();e.act+=.25;
 if(e.tr<6&&e.act>=20*(e.tr+1)){e.tr++;let a=earn(3,"time");if(e.tr%3==0){a+=earn(5,"time");say(`${ABrain.hour()} +${a} 🪙`)}else say(`${e.act|0} minutes of real practice. +${a} 🪙 from me.`)}
 if(Math.round(e.act*4)%8==0)save()},15000);

// ---- surprise gifts ----
if(!ST.lg)ST.lg=Date.now()-5*6e4;
function giftBox(){if(document.getElementById("gbox"))return;const b=document.createElement("button");b.id="gbox";b.type="button";b.setAttribute("aria-label","Open the gift from Astro");b.textContent="🎁";document.body.appendChild(b);
 setTimeout(()=>{if(b.isConnected)b.remove()},75000)}
setInterval(()=>{const e=E();if(document.visibilityState!="visible"||Date.now()-lastIn>6e4||e.gf>=3||document.getElementById("gbox")||document.getElementById("sheet")&&document.getElementById("sheet").classList.contains("on"))return;
 if(Date.now()-(ST.lg||0)<10*6e4)return;if(Math.random()<.25)giftBox()},60000);
document.addEventListener("click",e=>{const g=e.target.closest("#gbox");if(!g)return;g.remove();const r=Math.random(),a=r<.35?2:r<.65?3:r<.85?4:r<.95?5:6,x=E();x.gf++;ST.lg=Date.now();earn(a,"surprise");try{sfx.ach();burst()}catch(_){}say(ABrain.gift(a),null,true)});

// ---- wallet sheet (tap the 🪙 in the top bar) ----
function row(ok,t,d){return`<div class="wrow"><span>${ok?"✅":"▫️"}</span><span><b>${t}</b><span class="en" style="display:block;font-size:13px">${d}</span></span></div>`}
function wallet(){const e=E(),by=e.by,tot=Object.values(by).reduce((a,x)=>a+x,0),fz=(ST.fb||0)-(ST.fu||0),nxt=Object.keys(SMS).map(Number).find(k=>(ST.streak||0)<k),
 lab={practice:"Practice",daily:"Daily gift",time:"Time spent",surprise:"Surprise gifts",goal:"Card goals",levelup:"Level ups",streak:"Streak bonuses"};
 const earned=Object.keys(by).filter(k=>by[k]>0).map(k=>`<span class="tg">${lab[k]||k} +${by[k]}</span>`).join("")||`<span class="en" style="font-size:14px">Nothing yet today.</span>`;
 const nextT=e.tr<6?`next in ${Math.max(1,Math.ceil(20*(e.tr+1)-e.act))} min`:"all done today";
 return`<div class="sh-h"><span>${astroAv(34)}</span><b style="font-size:20px">🪙 ${coins()} coins</b><button class="chip" data-sh="x" style="margin:0 0 0 auto">Close</button></div>
 <p class="en" style="margin:6px 0 10px;font-size:14px">Coins reward effort. Spend them when you really need a hand, and earn them back by learning.</p>
 <div class="note" style="margin-top:6px"><b>Earned today: ${tot}</b><div style="margin-top:6px">${earned}</div></div>
 <div class="note"><b>Ways to earn</b>
 ${row(ST.ci==day(),"Daily gift from Astro",`5 + your streak days (max +7). ${ST.ci==day()?"Claimed today.":""}`)}${ST.ci!=day()?`<button class="btn p" data-wclaim="1" style="margin:4px 0 8px">🎁 Open today’s gift</button>`:""}
 ${row(e.tr>=6,"Time spent learning",`+3 every 20 active minutes (${e.tr}/6 today, ${nextT}). +5 bonus every active hour.`)}
 ${row(e.gf>=3,"Surprise gifts",`Astro drops a 🎁 while you practice. ${e.gf}/3 found today.`)}
 ${row(e.ms.includes(",100,"),"Card goals",`25 cards +5 · 50 cards +10 · 100 cards +20. Today: ${ST.today&&ST.today.d==day()?ST.today.n:0}.`)}
 ${row(false,"Streaks and levels",`${nxt?`Next streak bonus at ${nxt} days (+${SMS[nxt]}). `:""}Level up +10. Passing a lesson +10, an exam +25.`)}
 </div>
 <div class="note"><b>What coins buy</b>
 ${row(false,"Tap a word to see its meaning",`${COST.look} 🪙 (${COST.look2} after 20 a day). ${e.fl} free left today. Words you already learned and repeat taps are free.`)}
 ${row(false,"Quiz hint",`${COST.hint} 🪙, removes one wrong answer.`)}
 ${row(false,"Streak freeze",`50 🪙 · you have ${fz} (max 2). Protects your streak for one missed day.`)}<button class="btn" data-wbuy="fz" style="margin-top:6px">Buy a freeze · 50 🪙</button></div>`}
window.walletSheet=()=>openSheet(wallet());
document.addEventListener("click",e=>{
 if(e.target.closest("[data-wallet]")){walletSheet();return}
 if(e.target.closest("[data-wclaim]")){claimDaily();walletSheet();return}
 if(e.target.closest("[data-wbuy]")){if((ST.fb||0)-(ST.fu||0)>=2)pop("You already have 2 freezes");else if(!spend(50,"freeze"))pop("Not enough coins yet");else{ST.fb=(ST.fb||0)+1;save();pop("❄️ Streak freeze added")}walletSheet()}});
})();
