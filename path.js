// A1 Path: original lessons + quizzes (80% to unlock the next lesson). Pure addition; no existing code changed except the tab hook.
(function(){
const LS=[
{t:"Being: sein",i:`<p><b>sein</b> (to be) is irregular, so learn it by heart:</p><p>ich <b>bin</b> · du <b>bist</b> · er/sie/es <b>ist</b><br>wir <b>sind</b> · ihr <b>seid</b> · sie/Sie <b>sind</b></p><p>Ich bin müde. · Du bist hier. · Wir sind Freunde.</p>`,
q:[["Ich ___ Student.",["bin","bist","ist"],0],["Du ___ müde.",["bin","bist","ist"],1],["Sie (she) ___ aus Tunesien.",["sind","ist","seid"],1],["Wir ___ Freunde.",["seid","ist","sind"],2],["Ihr ___ zu spät.",["seid","sind","bist"],0]]},
{t:"Articles: der, die, das",i:`<p>Every German noun has a gender: <b>der</b> (masculine), <b>die</b> (feminine), <b>das</b> (neuter). In the plural it is always <b>die</b>.</p><p>der Mann · die Frau · das Kind · die Kinder</p><p>"a/an" is <b>ein</b> (der/das words) or <b>eine</b> (die words): ein Tisch, eine Lampe, ein Kind.</p><p>Always learn a noun together with its article.</p>`,
q:[["___ Frau (the woman)",["der","die","das"],1],["___ Kind (the child)",["der","die","das"],2],["Das ist ___ Tisch. (a table)",["ein","eine","einen"],0],["Das ist ___ Lampe. (a lamp)",["ein","eine","das"],1],["Plural of der Tisch: ___ Tische",["der","die","das"],1]]},
{t:"Regular verbs in the present",i:`<p>Take the verb stem and add an ending. Example <b>wohnen</b> (to live): </p><p>ich wohn<b>e</b> · du wohn<b>st</b> · er/sie/es wohn<b>t</b><br>wir wohn<b>en</b> · ihr wohn<b>t</b> · sie/Sie wohn<b>en</b></p><p>If the stem ends in -t or -d, add an extra e: er arbeit<b>e</b>t.</p>`,
q:[["Ich ___ in Berlin. (wohnen)",["wohne","wohnst","wohnt"],0],["Du ___ Deutsch. (lernen)",["lerne","lernst","lernt"],1],["Er ___ Kaffee. (trinken)",["trinke","trinkst","trinkt"],2],["Wir ___ Musik. (hören)",["hören","hört","höre"],0],["Ihr ___ gut. (arbeiten)",["arbeiten","arbeitet","arbeitest"],1]]},
{t:"Word order and questions",i:`<p>In a statement the verb is always in <b>position 2</b>: Ich gehe heute nach Hause. / Heute <b>gehe</b> ich nach Hause.</p><p>Yes/no question: verb first. <b>Wohnst</b> du in Hamburg?</p><p>Question words (W-questions) come first, then the verb: <b>Wo</b> wohnst du? <b>Wie</b> heißt du? <b>Was</b> machst du?</p>`,
q:[["Which sentence is correct?",["Heute ich gehe nach Hause.","Heute gehe ich nach Hause.","Ich heute gehe nach Hause."],1],["Ask: Do you live in Hamburg?",["Wohnst du in Hamburg?","Wohnen in Hamburg du?","In Hamburg wohnst?"],0],["___ heißt du? (what)",["Wo","Wie","Wer"],1],["___ wohnst du? (where)",["Wo","Wann","Was"],0],["Which sentence is correct?",["Morgen wir fahren nach Köln.","Morgen fahren wir nach Köln.","Wir morgen fahren nach Köln."],1]]},
{t:"Saying no: nicht and kein",i:`<p><b>kein</b> negates a noun with ein/eine or no article: Ich habe <b>kein</b> Auto. Das ist <b>keine</b> Lampe. (kein for der/das words, keine for die words and plurals)</p><p><b>nicht</b> negates everything else (verbs, adjectives): Ich bin <b>nicht</b> müde. Er kommt <b>nicht</b>.</p>`,
q:[["Ich habe ___ Auto. (no car)",["nicht","kein","keine"],1],["Ich bin ___ müde.",["nicht","kein","keine"],0],["Das ist ___ Lampe. (not a lamp)",["kein","keine","nicht"],1],["Wir haben ___ Zeit. (no time)",["kein","keine","nicht"],1],["Er kommt ___. (He isn’t coming.)",["kein","nicht","keine"],1]]}
];
const A=()=>document.getElementById("app"),pc=n=>ST["pl"+n]||0,ok=n=>pc(n)>=80,op=n=>n==1||ok(n-1),all=()=>LS.every((_,k)=>ok(k+1));
let cur=null;
function view(){let h=`<h2>🎓 A1 Path</h2><p class="en">Pass each quiz (80%) to unlock the next lesson. Finish all five to take the A1 exam.</p>`;
 LS.forEach((l,k)=>{const n=k+1;h+=`<button type="button" class="btn" data-pl="${n}" ${op(n)?"":"disabled"} style="text-align:left;margin:6px 0">${op(n)?"":"🔒 "}Lesson ${n}: ${l.t}${pc(n)?" · "+pc(n)+"%":""}${ok(n)?" ✅":""}</button>`});
 h+=`<button type="button" class="btn" data-pl="x" ${all()?"":"disabled"} style="text-align:left;margin:6px 0">${all()?"":"🔒 "}A1 exam · 10 questions${ST.plt?" · "+ST.plt+"%":""}${ST.plt>=80?" 🏆":""}</button><p class="en" style="font-size:13px">Original lessons following the CEFR A1 grammar goals. More lessons and levels are coming.</p>`;A().innerHTML=h}
function q(){const c=cur,x=c.qs[c.i];A().innerHTML=`<p class="en">Question ${c.i+1} of ${c.qs.length}</p><h3>${esc(x[0])}</h3>`+x[1].map((o,k)=>`<button type="button" class="btn" data-po="${k}" style="margin:6px 0">${esc(o)}</button>`).join("")}
function end(){const c=cur,p=Math.round(c.ok/c.qs.length*100),pass=p>=80;
 if(c.id=="x")ST.plt=Math.max(ST.plt||0,p);else ST["pl"+c.id]=Math.max(pc(c.id),p);
 addXP(pass?20:5);save();
 A().innerHTML=`<h2>${pass?"✅ Passed!":"Not quite yet"}</h2><p>You scored <b>${p}%</b> (${c.ok}/${c.qs.length}). You need 80% to pass.</p>${pass?"":`<button type="button" class="btn" data-pb="retry">Try again</button> `}<button type="button" class="btn" data-pb="back">Back to Path</button>`}
document.addEventListener("click",e=>{if(tab!="l")return;const t=e.target.closest("[data-pl],[data-po],[data-pb]");if(!t)return;
 if(t.dataset.pl){const id=t.dataset.pl;if(id=="x"){const all=[].concat(...LS.map(l=>l.q)).sort(()=>Math.random()-.5).slice(0,10);cur={id,qs:all,i:0,ok:0};q()}
  else{const l=LS[id-1];cur={id,qs:l.q,i:0,ok:0};A().innerHTML=`<h2>Lesson ${id}: ${l.t}</h2>${l.i}<button type="button" class="btn" data-pb="start">Start quiz</button> <button type="button" class="btn" data-pb="back">Back</button>`}}
 else if(t.dataset.po!==undefined&&cur){const x=cur.qs[cur.i],k=+t.dataset.po,g=k==x[2];if(g){cur.ok++;sfx.good&&sfx.good()}
  A().innerHTML=`<h3>${esc(x[0])}</h3><p>${g?"✅ Correct!":"❌ Not quite. Answer: <b>"+esc(x[1][x[2]])+"</b>"}</p><button type="button" class="btn p" data-pb="next">${cur.i+1<cur.qs.length?"Next":"See result"}</button>`}
 else if(t.dataset.pb=="start"||t.dataset.pb=="retry"){cur.i=0;cur.ok=0;q()}
 else if(t.dataset.pb=="next"){cur.i++;cur.i<cur.qs.length?q():end()}
 else if(t.dataset.pb=="back"){cur=null;view()}});
const _r=render;render=function(){if(tab=="l"){topbar();cur=null;view();document.querySelectorAll("#bbar button").forEach(b=>b.classList.toggle("on",b.dataset.g=="l"));return}_r()};
const bb=document.getElementById("bbar");if(bb)bb.insertAdjacentHTML("beforeend",'<button data-g="l"><i>🎓</i>Path</button>');
})();
