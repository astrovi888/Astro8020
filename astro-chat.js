// "Real life" German section + "Ask Astro" chat. Pure addition.
(function(){
const $$=id=>document.getElementById(id);
// Flip to true later to show "Smarter Astro" (on-device model) and use /api/astro. Off = plain rule-based Astro that needs nothing.
const AI=false;

/* ============ Real life German (Learn → Real life) ============ */
let xc=0;
function realView(){
 const C=REAL[xc],card=p=>`<div class="note" style="margin:10px 0"><div class="en" style="font-size:12px;letter-spacing:.04em;text-transform:uppercase">Textbook</div><div class="wtx" style="opacity:.75">${esc(p[0])}</div>
  <div class="en" style="font-size:12px;letter-spacing:.04em;text-transform:uppercase;margin-top:8px">Real life</div><div class="wtx" style="font-size:20px;font-weight:600">${esc(p[1])} ${spk(p[1].split(" / ")[0])}</div>
  <div class="en" style="font-size:15px;margin-top:4px">${esc(p[2])}</div>${p[3]?`<div class="en" style="font-size:13px;margin-top:6px">💡 ${esc(p[3])}</div>`:""}</div>`;
 app.innerHTML=lseg()+`<div class="box"><div class="meta"><span>${astroAv(28)} <b>How Germans really talk</b></span><span class="tg">${REAL.reduce((a,c)=>a+c.p.length,0)} phrases</span></div>
 <p class="en" style="font-size:14px;margin:8px 0">Textbook German is correct, but people shorten, soften and mix it up in real life. Here is the difference. Tap any German word for its meaning.</p>
 <div>${REAL.map((c,k)=>`<button class="chip${k==xc?" on":""}" data-xc="${k}" style="margin:3px 4px 3px 0">${c.i} ${c.c}</button>`).join("")}</div>
 <h3 style="margin:14px 0 2px">${C.i} ${C.c}</h3>${C.p.map(card).join("")}
 <details class="note"><summary><b>Little words that make you sound German (${REALW.fill.length})</b></summary>${REALW.fill.map(w=>`<div style="margin:10px 0"><b>${esc(w[0])}</b> <span class="en">= ${esc(w[1])}</span><div class="wtx">${esc(w[2])} ${spk(w[2])}</div><div class="en" style="font-size:14px">${esc(w[3])}</div></div>`).join("")}</details>
 <details class="note"><summary><b>Shortcuts you’ll hear and see (${REALW.short.length})</b></summary>${REALW.short.map(w=>`<div style="margin:10px 0"><b>${esc(w[0])}</b> <span class="en">= ${esc(w[1])}</span><div class="wtx">${esc(w[2])}</div><div class="en" style="font-size:14px">${esc(w[3])}</div></div>`).join("")}</details>
 <details class="note"><summary><b>How spoken German really works (${REALW.tips.length})</b></summary>${REALW.tips.map(t=>`<div style="margin:12px 0"><b>${esc(t[0])}</b><div class="en" style="font-size:15px;margin-top:2px">${esc(t[1])}</div></div>`).join("")}</details>
 <button class="btn p" data-chat="open:How would a German say this in real life? ">Ask Astro how to say something</button></div>`}
{const _r=render;render=function(){if(tab=="x"){q=[];topbar();realView();if(typeof bbHi=="function")bbHi();return}_r()}}
document.addEventListener("click",e=>{const b=e.target.closest("[data-xc]");if(b){xc=+b.dataset.xc;realView();window.scrollTo&&scrollTo(0,0)}});
// Card back: also fall back to the Real life section for sentences that have no spoken version of their own
{const _c=cas;cas=function(s){const r=_c(s);if(r)return r;const k=String(s[0]).replace(/[.!?]+$/,"").toLowerCase();for(const c of REAL)for(const p of c.p)if(p[0].replace(/[.!?]+$/,"").toLowerCase()==k)return _c([s[0],s[1],0,0,0,0,p[1].split(" / ")[0]]);return""}}

/* ============ Ask Astro chat ============ */
const CH=[];let askName=false,online=null,busyC=false;
/* ---- Smarter Astro: a small open-source model that runs ON THE USER'S PHONE (WebLLM + WebGPU). Free, no server, no key. ---- */
const MODELS={light:["Qwen2.5-0.5B-Instruct-q4f16_1-MLC","Qwen2.5-0.5B-Instruct-q4f32_1-MLC"],better:["Qwen2.5-1.5B-Instruct-q4f16_1-MLC","Llama-3.2-1B-Instruct-q4f16_1-MLC","Qwen2.5-0.5B-Instruct-q4f16_1-MLC"]};
let eng=null,bState=eng?"ready":"idle",bMsg="";
function brainUI(){const el=$$("cbrain");if(!el)return;
 if(bState=="ready")el.innerHTML=`<span class="en" style="font-size:13px">🧠 Smarter Astro is on (runs on your phone, free). Small models make mistakes, so double-check important German.</span>`;
 else if(bState=="loading")el.innerHTML=`<span class="en" style="font-size:13px">🧠 ${esc(bMsg)}</span>`;
 else el.innerHTML=`<details><summary class="en" style="font-size:14px;cursor:pointer">🧠 <b>Smarter Astro</b> (free, runs on your phone)</summary><p class="en" style="font-size:13px;margin:6px 0">Downloads a small open-source AI model once and keeps it on this device. Nothing is sent to any server, and it costs no coins. It needs a recent browser with WebGPU and works best on Wi-Fi.${bMsg?`<br><b>${esc(bMsg)}</b>`:""}</p><button class="chip" data-chat="brain:light" style="margin:2px 6px 2px 0">Light · about 0.4 GB</button><button class="chip" data-chat="brain:better" style="margin:2px 0">Better · about 1 GB</button></details>`}
async function loadBrain(kind){if(bState=="loading"||eng)return;bMsg="";
 if(!navigator.gpu){bMsg="This browser has no WebGPU, so the on-device model can’t run here (try a recent Chrome, or Safari 18 or newer).";return brainUI()}
 bState="loading";bMsg="Preparing…";brainUI();
 try{const W=await import("https://esm.run/@mlc-ai/web-llm"),have=new Set(W.prebuiltAppConfig.model_list.map(m=>m.model_id)),id=(MODELS[kind]||MODELS.light).find(x=>have.has(x));if(!id)throw new Error("no model");
  eng=await W.CreateMLCEngine(id,{initProgressCallback:p=>{bMsg=(p&&p.text?p.text:"Loading…").slice(0,90);brainUI()}});
  bState="ready";ST.brain=kind;save();brainUI();bubble("a",fmt("Smarter Astro is ready. Ask me anything!"))}
 catch(e){eng=null;bState="idle";bMsg="Couldn’t load the model (not enough memory, offline, or unsupported). The built-in basics still work.";brainUI()}}
const hist=()=>CH.slice(-6).map(m=>({role:m.r=="u"?"user":"assistant",content:(m.raw||m.h).replace(/<br>/g,"\n").replace(/<[^>]+>/g,"").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"')}));
async function llmAsk(){const c=ctx(),sys=`You are Astro, a warm, concise German coach for English speakers. ${c.name?"The learner is called "+c.name+". ":""}Answer in simple English with short German examples and their translations. Keep answers under 90 words. When the learner writes German, show the corrected sentence and one short reason. Only use German words you are sure about. If you are unsure, say so.`;
 const r=await eng.chat.completions.create({messages:[{role:"system",content:sys},...hist()],max_tokens:260,temperature:.4});return r.choices&&r.choices[0]&&r.choices[0].message&&r.choices[0].message.content||null}

const fmt=t=>esc(t).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/\n/g,"<br>");
const ctx=()=>({name:uname(),streak:ST.streak||0,learned:learned().length,mistakes:Object.keys(ST.mk||{}).length,level:typeof lvl=="function"?lvl():0,tab:typeof tab!="undefined"?tab:""});
function bubble(who,html,raw){const m=$$("cmsgs");if(!m)return;const d=document.createElement("div");d.className="cb "+who;d.innerHTML=who=="a"?`<span class="cav">${astroAv(26)}</span><div class="cbt wtx">${html}</div>`:`<div class="cbt">${html}</div>`;m.appendChild(d);m.scrollTop=m.scrollHeight;return d}
function chatHtml(){return`<div class="sh-h">${astroAv(38)}<span><b style="font-size:18px">Astro</b><span class="en" style="display:block;font-size:12px">your German coach</span></span><button class="chip" data-sh="x" style="margin:0 0 0 auto">Close</button></div>
 <div id="cbrain" style="margin-top:8px"></div><div id="cmsgs"></div>
 <div id="cchips">${["What does Haus mean?","How do I say thank you?","Conjugate gehen","Explain der, die, das","When do I use dative?"].map(x=>`<button class="chip" data-chat="send:${esc(x)}" style="margin:3px 4px 3px 0">${esc(x)}</button>`).join("")}</div>
 <div class="crow"><textarea id="cin" rows="1" maxlength="500" placeholder="Ask me anything about German…" aria-label="Message Astro"></textarea><button class="btn p" id="csend" data-chat="go" style="width:auto;margin:0">Send</button></div>`}
function openChat(pre){openSheet(chatHtml(),"chat");const n=uname();if(AI){brainUI();if(ST.brain&&!eng&&bState=="idle")loadBrain(ST.brain)}
 if(CH.length){CH.forEach(m=>bubble(m.r=="u"?"u":"a",m.h))}
 else{askName=!n;bubble("a",fmt(n?`${ABrain.hello()} Ask me about a word, a grammar topic, or how Germans really say something. For example: “what does Haus mean?”, “conjugate gehen”.`:`Hi, I’m Astro, your German coach! What should I call you?`))}
 if(pre){const i=$$("cin");i.value=pre;i.focus()}}
window.openAstroChat=openChat;

function setName(x){const m=x.match(/(?:my name is|i am called|i['’]m called|call me|ich hei(?:ß|ss)e|ich bin|i am|i['’]m)\s+([A-Za-zÄÖÜäöüß-]{2,20})/i),w=m?m[1]:(x.trim().split(/\s+/).length<=2?x.trim().replace(/[^A-Za-zÄÖÜäöüß-]/g,""):"");if(!w||w.length<2)return null;ST.name=w[0].toUpperCase()+w.slice(1);save();return ST.name}


// ---- simple word helpers (use your own word list + sentences, no AI) ----
const nameOf=w=>(w.art?w.art+" ":"")+w.de,card=w=>`**${nameOf(w)}** = ${w.en} (${POS[w.pos]||"word"}, ${w.lv})`;
const IRRV={sein:["bin","bist","ist","sind","seid","sind"],haben:["habe","hast","hat","haben","habt","haben"],werden:["werde","wirst","wird","werden","werdet","werden"],können:["kann","kannst","kann","können","könnt","können"],müssen:["muss","musst","muss","müssen","müsst","müssen"],wollen:["will","willst","will","wollen","wollt","wollen"],sollen:["soll","sollst","soll","sollen","sollt","sollen"],dürfen:["darf","darfst","darf","dürfen","dürft","dürfen"],mögen:["mag","magst","mag","mögen","mögt","mögen"],wissen:["weiß","weißt","weiß","wissen","wisst","wissen"],tun:["tue","tust","tut","tun","tut","tun"]};
const STEM={fahren:["fahre","fährst","fährt"],sehen:["sehe","siehst","sieht"],geben:["gebe","gibst","gibt"],nehmen:["nehme","nimmst","nimmt"],essen:["esse","isst","isst"],lesen:["lese","liest","liest"],sprechen:["spreche","sprichst","spricht"],helfen:["helfe","hilfst","hilft"],schlafen:["schlafe","schläfst","schläft"],laufen:["laufe","läufst","läuft"],tragen:["trage","trägst","trägt"],lassen:["lasse","lässt","lässt"],treffen:["treffe","triffst","trifft"],werfen:["werfe","wirfst","wirft"]};
function conj(inf){inf=inf.toLowerCase();if(!/en$|ern$|eln$|^sein$|^tun$/.test(inf))return null;let f;
 if(IRRV[inf])f=IRRV[inf];else{const st=inf.endsWith("n")&&!/en$/.test(inf)?inf.slice(0,-1):inf.slice(0,-2),base=/[dt]$|[^aeiouäöülr]n$|[^aeiouäöülr]m$/.test(st)&&!/[lr][nm]$/.test(st),e=base?"e":"";
  const du=/[sßzx]$/.test(st)?st+"t":st+e+"st",er=st+e+"t",ich=inf.endsWith("ln")||inf.endsWith("rn")?st+"e":st+"e";
  f=STEM[inf]?[STEM[inf][0],STEM[inf][1],STEM[inf][2],inf,er,inf]:[ich,du,er,inf,er,inf]}
 return `**${inf}** (present tense)\nich ${f[0]}\ndu ${f[1]}\ner/sie/es ${f[2]}\nwir ${f[3]}\nihr ${f[4]}\nsie/Sie ${f[5]}`}
function exFor(x){const k=x.toLowerCase(),hit=S.filter(s=>(s[0].toLowerCase().match(/[a-zäöüß]+/g)||[]).some(t=>t==k||t.startsWith(k.slice(0,Math.max(3,k.length-2))))).slice(0,3);return hit.length?hit.map(s=>`• ${s[0]}\n  ${s[1]}`).join("\n"):null}
function wordAnswer(l,t,short){let m;if(!short){
 if((m=l.match(/(?:conjugat\w*|present tense of|forms? of|verb forms? of)\s+(?:the verb\s+)?([a-zäöüß]+)/))){const r=conj(m[1]);if(r)return r;return"I can only conjugate verbs that end in -en, like gehen or machen. Try one!"}
 if((m=l.match(/(?:what does|what is the meaning of|meaning of|define|translate)\s+["“']?([a-zäöüß ]+?)["”']?(?:\s+mean)?\s*\??$/))&&!/german (word )?for/.test(l)){const x=m[1].trim(),f=wtFind(x);if(f)return card(f.entry)+(f.form&&f.form!=f.entry.de.toLowerCase()?`\n“${x}” is a form of ${f.entry.de}.`:"");const r=dsearch(x);if(r.w.length)return`**${x}** →\n`+r.w.slice(0,3).map(card).join("\n")}
 if((m=l.match(/(?:article|gender)\s+(?:of|for|is)\s+(?:the\s+word\s+)?([a-zäöüß]+)/))||(m=l.match(/(?:is|which article is|der die or das for)\s+([a-zäöüß]+)\s+(?:der|die|das|masculine|feminine|neuter)/))||(m=l.match(/(?:der,? die,? (?:or|oder) das)\s+([a-zäöüß]+)/))){const f=wtFind(m[1]);if(f&&f.entry.art)return`**${nameOf(f.entry)}** (${f.entry.en}). Learn it with its article!`;if(f)return`${f.entry.de} isn’t a noun, so it has no article.`}
 if((m=l.match(/example(?:s)?\s+(?:with|of|for|using)\s+([a-zäöüß]+)/))||(m=l.match(/(?:sentence|sentences)\s+(?:with|using)\s+([a-zäöüß]+)/))){const r=exFor(m[1]);return r?`Examples with **${m[1]}**:\n${r}`:`I don’t have an example with “${m[1]}” yet.`}
 return null}
 const tk=(l.match(/[a-zäöüß]+/g)||[]);
 if(tk.length&&tk.length<=2&&!/^(hi|hello|hallo|hey|moin|thanks|danke|yes|no|ok|okay|help)$/.test(l)){const f=wtFind(tk[0]);if(f&&tk.length==1)return card(f.entry)+(exFor(tk[0])?`\n${exFor(tk[0]).split("\n").slice(0,2).join("\n")}`:"");const r=dsearch(tk.join(" "));if(r.w.length)return`**${tk.join(" ")}** →\n`+r.w.slice(0,3).map(card).join("\n")}
 return null}

function localReply(text){const t=text.trim(),l=t.toLowerCase();
 let m=setName_cmd(l,t);if(m)return m;
 if(/^(help|what can you do)\b/.test(l))return"I can: explain a word (“what does Haus mean?”), translate (“how do I say thank you?”), conjugate verbs (“conjugate gehen”), tell the article (“which article is Tisch?”), give examples (“example with Zeit”), show how Germans really say things, and explain basic grammar like cases, word order, the perfect tense or du vs Sie.";
 const wa=wordAnswer(l,t,false);
 if(/^(hi|hello|hallo|hey|moin|servus)\b/.test(l))return`${ABrain.hello()} What shall we look at?`;
 if(l.split(/\s+/).length<=4&&/\b(thanks|thank you|danke)\b/.test(l)&&!/\b(say|how|german)\b/.test(l))return"Gern geschehen! (You’re welcome.) Anything else?";
 if(wa)return wa;
 // how do I say / translate
 const q=l.match(/(?:how (?:do|would|can|should) (?:i|you|we|germans?|people) (?:say|ask|write)|what(?:'s| is) the german (?:word )?for|translate|say|in german)[: ]+["“']?(.+?)["”']?(?:\s+in german|\s+like a german|\s+in real life)?\??$/);
 const phrase=q?q[1]:null;
 if(phrase||/\b(real life|really say|casual)\b/.test(l)){const w=(phrase||l).replace(/[^a-zäöüß' ]/g," ").split(/\s+/).filter(x=>x.length>3&&!/^(the|how|would|german|say|real|life|casual|really|like|that|this|you|and|for|with)$/.test(x));
  let best=null,bs=0;REAL.forEach(c=>c.p.forEach(p=>{const hay=p[2].toLowerCase();let s=0;w.forEach(x=>{if(new RegExp("\\b"+x.replace(/[^a-z]/g,"")+"\\b").test(hay))s++});if(s>bs){bs=s;best=p}}));
  if(best&&bs>=Math.max(1,Math.ceil(w.length/2)))return`In real life you’d hear:\n**${best[1]}**\nThe textbook version is: ${best[0]}\n(${best[2]})${best[3]?"\n💡 "+best[3]:""}`;
  if(phrase){const r=dsearch(phrase);if(r.w.length)return`**${phrase}** →\n`+r.w.slice(0,4).map(x=>`${x.art?x.art+" ":""}${x.de} (${POS[x.pos]||""}, ${x.lv})`).join("\n")+"\nTap any German word for its meaning."}}
 // grammar knowledge base
 const lk=" "+l.replace(/[,;.!?]/g," ").replace(/\s+/g," ")+" ";let top=null,ts=0;ASKB.forEach(k=>{let s=0;k.k.forEach(x=>{if(lk.includes(x))s+=x.length});if(s>ts){ts=s;top=k}});
 if(top&&ts>=3)return`**${top.t}**\n${top.a}`;
 {const w2=wordAnswer(l,t,true);if(w2)return w2}
 // German text: light check
 if(/[äöüß]|\b(ich|ist|und|nicht|habe|bin|das|der|die)\b/.test(l)&&l.split(/\s+/).length>=3){const bad=[];(t.match(/[A-Za-zÄÖÜäöüß]+/g)||[]).forEach(x=>{const w=WM[x[0].toUpperCase()+x.slice(1)];if(w&&w.pos=="n"&&x[0]==x[0].toLowerCase())bad.push(x)});
  return(bad.length?`One thing I can see right away: German nouns are capitalised. Write **${[...new Set(bad)].map(x=>x[0].toUpperCase()+x.slice(1)).join(", ")}** with a capital letter.\n`:"")+"I can only do a light check offline (capital letters). I can’t fully correct sentences yet. Ask me about word order, cases or the perfect tense instead."}
 return"I’m a simple Astro, so I only know the basics. Try: “what does Haus mean?”, “how do I say thank you?”, “conjugate gehen”, “which article is Tisch?”, “example with Zeit”, or a grammar topic like cases, word order, the perfect tense, du vs Sie, pronunciation."}
function setName_cmd(l,t){if(/(my name is|call me|ich hei(ß|ss)e)\s+\w/i.test(t)){const n=setName(t);if(n)return`Nice to meet you, ${n}! I’ll use your name from now on.`}return null}

async function ask(text){if(busyC)return;text=text.trim();if(!text)return;busyC=true;const i=$$("cin");if(i)i.value="";const cc=$$("cchips");if(cc)cc.remove();
 CH.push({r:"u",h:esc(text)});bubble("u",esc(text));
 if(askName){askName=false;const n=setName(text);if(n){const h=fmt(`Nice to meet you, ${n}! Ask me anything about German, or tell me how you want to practice.`);CH.push({r:"a",h});bubble("a",h);busyC=false;return}}
 const t=bubble("a","<span class='en'>…</span>");let out=null,paid=0;
 if(AI&&online!==false){const ch=ecoChatCharge();if(ch.ok){paid=ch.cost;try{const r=await fetch(window.ASTRO_API||"/api/astro",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:CH.slice(-8).map(m=>({role:m.r=="u"?"user":"assistant",content:(m.raw||m.h).replace(/<br>/g,"\n").replace(/<[^>]+>/g,"").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"')})),ctx:ctx()})});
   if(r.ok){const j=await r.json();if(j&&j.reply){online=true;out=j.reply}}else if(r.status==403||r.status==404||r.status==501||r.status==503)online=false}catch(e){online=online===true?true:false}
   if(!out&&paid){ST.cs=Math.max(0,(ST.cs||0)-paid);save();topbar()}}
  else{t.querySelector(".cbt").innerHTML=fmt(`That’s ${ecoCost.chat} 🪙 per message after your ${5} free ones today, and you’re short on coins. I can still answer the basics for free, like “how do I say…” and grammar questions.`);busyC=false;CH.push({r:"a",h:t.querySelector(".cbt").innerHTML});return}}
 if(!out){const kb=localReply(text);if(AI&&eng&&/Smarter Astro/.test(kb)){try{out=await llmAsk()}catch(e){}}out=out||kb}
 const h=fmt(out);t.querySelector(".cbt").innerHTML=h;CH.push({r:"a",h,raw:out});const m=$$("cmsgs");if(m)m.scrollTop=m.scrollHeight;busyC=false}

document.addEventListener("click",e=>{const b=e.target.closest("[data-chat]");if(!b)return;const v=b.dataset.chat;
 if(v=="go"){const i=$$("cin");if(i)ask(i.value)}else if(v.startsWith("send:"))ask(v.slice(5));else if(v.startsWith("open:"))openChat(v.slice(5));else if(v.startsWith("brain:"))loadBrain(v.slice(6));else openChat()});
document.addEventListener("keydown",e=>{if(e.target&&e.target.id=="cin"&&e.key=="Enter"&&!e.shiftKey){e.preventDefault();ask(e.target.value)}});

// floating button: Astro is always one tap away (small, never covers the bottom bar)
const fab=document.createElement("button");fab.type="button";fab.className="afab";fab.setAttribute("aria-label","Ask Astro");fab.innerHTML=astroAv(42);fab.dataset.chat="open";document.body.appendChild(fab);
// first meeting: ask for the name once
setTimeout(()=>{if(!uname()&&!ST.nameAsked&&(ST.tour||ST.xp)&&typeof astroSay=="function"){ST.nameAsked=1;save();astroSay("Hi! I’m Astro, your German coach. What should I call you?",["Tell Astro",()=>openChat()],true)}},12000);
})();
