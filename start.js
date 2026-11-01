// First-visit tour + "?" help button. Pure addition.
(function(){
const ST_=[
["Welcome to Astro 80/20 👋","Free German learning that teaches the most useful words and sentences first (the 80/20 idea: a small part of the language covers most of daily life). This 1-minute tour shows what everything is for."],
["📚 Learn","Practice sentences and words as flashcards. Tap to see the answer, then rate it: Again, Hard, Good or Easy. The app uses your answer to decide when to show that card again, so hard cards come back soon and easy ones later. That is why a little practice every day works."],
["⏱️ Match","A quick matching game to warm up and make words stick."],
["📖 Read","Short stories sorted by level, with English under every sentence. Reading shows you how words work together."],
["🔎 Dictionary","Look up a German word and hear how it sounds."],
["🎓 Path","Your step-by-step course: basics for beginners, then A1 and A2 lessons, dialogues, exams, and a Mistakes list that collects everything you got wrong so you can fix it."],
["📊 Progress","Your streak, XP, coins, time spent, awards and settings. Coins buy streak freezes that protect your streak if you miss a day."],
["Where should I start?","Brand new to German? Open Path → “Start here: German basics”. Know a little? Go to Learn → Sentences and choose your level. Do a bit every day. You can reopen this tour anytime with the ? button."]];
let i=0;
function show(){let o=document.getElementById("tour");if(!o){o=document.createElement("div");o.id="tour";o.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px";document.body.appendChild(o)}
 const x=ST_[i];o.innerHTML=`<div style="background:var(--card,#1c1c1e);color:var(--fg,#fff);border:1px solid var(--bd,#333);border-radius:16px;padding:20px;max-width:420px;width:100%"><p style="opacity:.6;font-size:13px;margin:0 0 6px">${i+1} / ${ST_.length}</p><h2 style="margin:0 0 10px">${x[0]}</h2><p style="line-height:1.5">${x[1]}</p><div style="display:flex;gap:8px;margin-top:14px"><button type="button" class="btn" data-tr="skip">Close</button>${i?'<button type="button" class="btn" data-tr="back">Back</button>':""}<button type="button" class="btn p" data-tr="next">${i<ST_.length-1?"Next":"Got it"}</button></div></div>`}
function close(){const o=document.getElementById("tour");if(o)o.remove();ST.tour=true;try{save()}catch(e){}}
document.addEventListener("click",e=>{const t=e.target.closest("[data-tr]");if(!t)return;const a=t.dataset.tr;if(a=="skip")close();else if(a=="back"){i--;show()}else if(i<ST_.length-1){i++;show()}else close()});
const ac=document.getElementById("acct");
if(ac){const b=document.createElement("button");b.id="helpb";b.type="button";b.className=ac.className;b.textContent="?";b.setAttribute("aria-label","How to use this site");b.onclick=()=>{i=0;show()};ac.parentNode.insertBefore(b,ac)}
if(!ST.tour&&!ST.xp)setTimeout(()=>{i=0;show()},700);
})();
