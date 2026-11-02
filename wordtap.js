// Tap any German word for its meaning. Costs a few coins (see economy.js), free for words you already know.
// Pure addition. Works in stories, Learn cards, Real-life phrases and Astro's chat.
(function(){
const WL={};WD.forEach(w=>{const k=w.de.toLowerCase();WL[k]=WL[k]||w});
const IRR={ist:"sein",bin:"sein",bist:"sein",sind:"sein",seid:"sein",war:"sein",waren:"sein",gewesen:"sein",hat:"haben",habe:"haben",hast:"haben",habt:"haben",hatte:"haben",hatten:"haben",gehabt:"haben",wird:"werden",werde:"werden",wirst:"werden",wurde:"werden",wurden:"werden",geworden:"werden",kann:"können",kannst:"können",konnte:"können",konnten:"können",muss:"müssen",musst:"müssen",musste:"müssen",will:"wollen",willst:"wollen",wollte:"wollen",soll:"sollen",sollst:"sollen",sollte:"sollen",darf:"dürfen",darfst:"dürfen",durfte:"dürfen",mag:"mögen",magst:"mögen",möchte:"mögen",möchten:"mögen",möchtest:"mögen",geht:"gehen",gehe:"gehen",ging:"gehen",gingen:"gehen",gegangen:"gehen",kommt:"kommen",komme:"kommen",kam:"kommen",kamen:"kommen",gekommen:"kommen",sieht:"sehen",siehst:"sehen",sah:"sehen",sahen:"sehen",gesehen:"sehen",gibt:"geben",gab:"geben",gegeben:"geben",weiß:"wissen",weiss:"wissen",weißt:"wissen",wusste:"wissen",gewusst:"wissen",nimmt:"nehmen",nahm:"nehmen",genommen:"nehmen",isst:"essen",aß:"essen",gegessen:"essen",fährt:"fahren",fuhr:"fahren",gefahren:"fahren",liest:"lesen",las:"lesen",gelesen:"lesen",spricht:"sprechen",sprach:"sprechen",gesprochen:"sprechen",hilft:"helfen",half:"helfen",geholfen:"helfen",schläft:"schlafen",schlief:"schlafen",geschlafen:"schlafen",trägt:"tragen",trug:"tragen",getragen:"tragen",lässt:"lassen",ließ:"lassen",gelassen:"lassen",steht:"stehen",stand:"stehen",gestanden:"stehen",bleibt:"bleiben",blieb:"bleiben",geblieben:"bleiben",findet:"finden",fand:"finden",gefunden:"finden",denkt:"denken",dachte:"denken",gedacht:"denken",bringt:"bringen",brachte:"bringen",gebracht:"bringen",tut:"tun",tue:"tun",tust:"tun",tat:"tun",getan:"tun",sitzt:"sitzen",saß:"sitzen",gesessen:"sitzen",liegt:"liegen",lag:"liegen",gelegen:"liegen",hält:"halten",hielt:"halten",gehalten:"halten",ruft:"rufen",rief:"rufen",gerufen:"rufen",schreibt:"schreiben",schrieb:"schreiben",geschrieben:"schreiben",trinkt:"trinken",trank:"trinken",getrunken:"trinken",beginnt:"beginnen",begann:"beginnen",begonnen:"beginnen",verlässt:"verlassen",verließ:"verlassen",verlassen:"verlassen",ihm:"er",ihn:"er",ihr:"sie",ihnen:"sie",mir:"ich",mich:"ich",dir:"du",dich:"du",uns:"wir",euch:"ihr",dem:"der",den:"der",des:"der",dessen:"der",einen:"ein",einem:"ein",einer:"ein",eines:"ein",eine:"ein",im:"in",am:"an",zum:"zu",zur:"zu",beim:"bei",vom:"von",ins:"in",ans:"an",aufs:"auf",fürs:"für",ums:"um",besser:"gut",beste:"gut",besten:"gut",mehr:"viel",meisten:"viel",lieber:"gern"};
const UM={ä:"a",ö:"o",ü:"u"},um=s=>s.replace(/[äöü]/g,m=>UM[m]);
function cands(w){const out=[w],add=x=>{if(x&&x.length>1&&!out.includes(x))out.push(x)};
 if(IRR[w])add(IRR[w]);
 if(w.length<4)return out;
 const st=[];["e","en","er","es","em","n","s","t","st","te","ten","et","est","ete","eten","ere","eren","erem","eres","ste","sten"].forEach(s=>{if(w.endsWith(s)&&w.length>s.length+2)st.push(w.slice(0,-s.length))});
 if(/^ge.{3,}(t|en)$/.test(w))st.push(w.slice(2).replace(/(t|en)$/,""));
 if(/^(auf|an|ab|aus|ein|mit|zu|vor|nach|um|weg|zurück|her|hin)ge.{3,}(t|en)$/.test(w))st.push(w.replace(/^(auf|an|ab|aus|ein|mit|zu|vor|nach|um|weg|zurück|her|hin)ge/,"").replace(/(t|en)$/,""));
 st.forEach(s=>{[s,s+"en",s+"n",s+"e",um(s),um(s)+"en",um(s)+"e"].forEach(add)});
 add(um(w));return out}
function find(w){w=w.toLowerCase();for(const c of cands(w)){const e=WL[c]||WL[um(c)];if(e)return{entry:e,form:c==w?"":w}}return null}
function knownSet(){const K=new Set();learned().forEach(k=>S[k]&&toks(S[k][0]).forEach(x=>K.add(x)));return K}
function isKnown(e){const c=ST.cards&&ST.cards["w"+e.rank];if(c&&c.reps>=1)return true;return false}
function storyHit(lw){if(typeof rs=="undefined"||rs<0||typeof STORY=="undefined"||!STORY[rs]||!STORY[rs].v)return null;
 return STORY[rs].v.find(v=>{const p=String(v[0]).toLowerCase().split(/[\s,/()]+/).filter(x=>x.length>2);return p.some(x=>x==lw||(lw.length>3&&(lw.startsWith(x.slice(0,Math.max(4,x.length-2)))||x.startsWith(lw.slice(0,Math.max(4,lw.length-2))))))})||null}

async function remote(raw){try{const c=new AbortController(),t=setTimeout(()=>c.abort(),6000),r=await fetch("https://api.mymemory.translated.net/get?q="+encodeURIComponent(raw)+"&langpair=de|en",{signal:c.signal});clearTimeout(t);if(!r.ok)return null;const j=await r.json(),x=j&&j.responseData&&j.responseData.translatedText;
 if(!x||/MYMEMORY|INVALID|QUERY LENGTH/i.test(x)||x.trim().toLowerCase()==raw.toLowerCase())return null;return x}catch(e){return null}}

const foot=(r,warn)=>{const e=ecoState(),left=e.fl;return`<div class="note" style="font-size:13px"><span class="en">${r.why=="known"?"Free: you already know this word.":r.why=="again"?"Free: you already looked this up today.":r.why=="free"?`Free lookup (${left} free left today).`:`−${r.cost} 🪙 · ${coins()} left. ${left?"":"Free lookups are used up for today."}`}</span>${warn?`<br><span class="en">${warn}</span>`:""}<div style="margin-top:8px"><button class="chip" data-wallet="1" style="margin:0 6px 0 0">🪙 Wallet</button><button class="chip" data-wmoff="1" style="margin:0">Turn off tap-a-word</button></div></div>`};
const close=`<button class="chip" data-sh="x" style="margin:0 0 0 auto">Close</button>`;
function broke(c){openSheet(`<div class="sh-h">${astroAv(34)}<b>Out of coins</b>${close}</div><p style="margin:10px 0">${ABrain.broke()}</p><p class="en" style="font-size:14px">This lookup costs ${c} 🪙. The sentence translation is always free.</p><button class="btn p" data-wallet="1">See how to earn coins</button>`)}

function show(raw,f,v,r){const w=f&&f.entry;let h=`<div class="sh-h"><span class="wt-w">${w?(w.art?`<span class="${w.art}">${w.art}</span> `:"")+esc(w.de):esc(raw)}</span>${w?spk(w.de):spk(raw)}${close}</div>`;
 if(w){h+=`<p style="font-size:20px;margin:8px 0 4px">${esc(w.en)}</p><div><span class="tg">${POS[w.pos]||""}</span><span class="tg">${w.lv}</span><span class="tg">#${w.rank} most common</span></div>`;
  if(f.form&&f.form!=w.de.toLowerCase())h+=`<p class="en" style="font-size:14px;margin:6px 0">“${esc(raw)}” is a form of <b>${w.art?w.art+" ":""}${esc(w.de)}</b>.</p>`;
  if(w.art)h+=`<p class="en" style="font-size:14px;margin:6px 0">Learn it with its article: <b>${w.art} ${esc(w.de)}</b>.</p>`;
  try{h+=ex(w)}catch(e){}}
 if(v)h+=`<div class="note"><b>In this story</b><p style="margin:6px 0"><b>${esc(v[0])}</b> = ${esc(v[2]||"")}</p>${v[1]?`<p class="en" style="font-size:14px;margin:0">${esc(v[1])}</p>`:""}</div>`;
 openSheet(h+foot(r))}
function showRemote(raw,t,r){openSheet(`<div class="sh-h"><span class="wt-w">${esc(raw)}</span>${spk(raw)}${close}</div><p style="font-size:20px;margin:8px 0 4px">${esc(t)}</p><p class="en" style="font-size:13px;margin:0">Machine translation (MyMemory). It can be wrong for names and idioms.</p>`+foot(r))}

async function tap(el){const raw=el.dataset.wt,lw=raw.toLowerCase();if(!raw||/^\d+$/.test(raw))return;
 document.querySelectorAll(".wt.on").forEach(x=>x.classList.remove("on"));el.classList.add("on");
 const f=find(lw),v=storyHit(lw);
 if(f||v){const known=f?isKnown(f.entry):false,p=ecoLookupPreview(lw,known);if(p.why=="paid"&&coins()<p.cost)return broke(p.cost);const r=ecoLookup(lw,known);return show(raw,f,v,r)}
 openSheet(`<div class="sh-h"><span class="wt-w">${esc(raw)}</span>${close}</div><p class="en">Looking it up…</p>`);
 const t=await remote(raw);if(!t)return openSheet(`<div class="sh-h"><span class="wt-w">${esc(raw)}</span>${spk(raw)}${close}</div><p class="en" style="margin:10px 0">I couldn’t find this one (it may be a name, or you are offline). No coins taken.</p>`);
 const p=ecoLookupPreview(lw,false);if(p.why=="paid"&&coins()<p.cost)return broke(p.cost);showRemote(raw,t,ecoLookup(lw,false))}
window.wtTap=tap;window.wtFind=find;

// Words from the top-1000 list in this text that you have NOT learned yet (shorter, more useful than listing everything).
window.wtUnknown=function(text,max){const seen={},o=[];(text.match(/[A-Za-zÄÖÜäöüß]+/g)||[]).forEach(t=>{const f=find(t);if(!f)return;const w=f.entry;if(seen[w.de]||isKnown(w)||!"nvjd".includes(w.pos))return;seen[w.de]=1;o.push(w)});
 const K=knownSet(),u=o.filter(w=>!K.has(w.de.toLowerCase())).sort((a,b)=>a.rank-b.rank),all=u.length,list=u.slice(0,max||14);
 if(!all)return`<p class="en" style="font-size:14px;margin:4px 0 0">You already know every word from the top-1000 list in this text. 🎉</p>`;
 return`<div class="gl">${list.map(w=>`<span class="tg">${wcol(w)} = ${esc(w.en)}</span>`).join("")}</div>${all>list.length?`<p class="en" style="font-size:13px;margin:6px 0 0">+${all-list.length} more. Learn these first, they come up the most.</p>`:""}`};

// ---- wrap German words in spans so they can be tapped ----
const WRE=/[A-Za-zÄÖÜäöüß]+(?:[’'-][A-Za-zÄÖÜäöüß]+)*/g;
function wrap(root){const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentElement;if(!p||p.closest(".wt,button,textarea,a,select,.en,.spk,script,style,[data-nowt]"))return NodeFilter.FILTER_REJECT;return /[A-Za-zÄÖÜäöüß]/.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}}),ns=[];while(tw.nextNode())ns.push(tw.currentNode);
 ns.forEach(n=>{const t=n.nodeValue,f=document.createDocumentFragment();let last=0,m;WRE.lastIndex=0;while((m=WRE.exec(t))){if(m.index>last)f.appendChild(document.createTextNode(t.slice(last,m.index)));const s=document.createElement("span");s.className="wt";s.dataset.wt=m[0];s.textContent=m[0];f.appendChild(s);last=m.index+m[0].length}if(last<t.length)f.appendChild(document.createTextNode(t.slice(last)));n.parentNode.replaceChild(f,n)})}
const looksDe=el=>{const tk=toks(el.textContent);if(tk.length<2)return false;let h=0;tk.forEach(x=>{if(find(x)||/[äöüß]/.test(x))h++});return h/tk.length>=.45};
let busy=0;function apply(){document.body.classList.toggle("wm",ST.wm!==false);if(ST.wm===false)return;
 document.querySelectorAll("#app .sent:not([data-wd]),#app .de:not([data-wd]),#app .wtx:not([data-wd]),.sh-box .wtx:not([data-wd])").forEach(el=>{el.dataset.wd=1;if(el.classList.contains("sent")&&!looksDe(el))return;wrap(el)})}
const mo=new MutationObserver(()=>{if(busy)return;busy=setTimeout(()=>{busy=0;apply()},40)});mo.observe(document.body,{childList:true,subtree:true});
apply();
document.addEventListener("click",e=>{const w=e.target.closest(".wt");if(w&&!e.target.closest("button")){e.preventDefault();e.stopPropagation();tap(w);return}
 if(e.target.closest("[data-wmoff]")){ST.wm=false;save();closeSheet();document.querySelectorAll(".wt").forEach(x=>x.replaceWith(document.createTextNode(x.textContent)));document.body.classList.remove("wm");pop("Tap-a-word is off. Turn it on in a story or the wallet.");return}
 if(e.target.closest("[data-wmon]")){ST.wm=true;save();if(typeof render=="function")render();apply()}
 if(e.target.closest("[data-wmset]")){ST.wm=e.target.closest("[data-wmset]").dataset.wmset=="1";save();if(typeof readView=="function"&&typeof rs!="undefined"&&rs>=0)readView();else if(typeof render=="function")render();apply()}},true);
window.wtApply=apply;
})();
