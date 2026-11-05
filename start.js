// First-visit tour + "?" help button. Pure addition.
(function(){
// v11: the tour text now matches the real bottom bar (Learn / Practice / Progress / More). It used to describe tabs that no longer exist.
const ST_=[
["Welcome to Astrolingo 👋","Free German learning that teaches the most useful words and sentences first (the 80/20 idea: a small part of the language covers most of daily life). This 1-minute tour shows what everything is for."],
["🧭 Learn","Your course. Short lessons of 10 cards, most useful first. Finish a lesson to unlock the next one, and pass a level test to move from A1 to A2, B1 and B2."],
["🎯 Practice","Free practice with flashcards. Tap to see the answer, then rate it: Again, Hard, Good or Easy. The app uses your rating to decide when you see that card again, so a little practice every day works."],
["📊 Progress","Your level, streak, time spent, coins, awards, ranks and settings, all in one place."],
["⋯ More","Speaking practice, the Word Match Blitz game, stories, the dictionary, settings and this help. Rarely used things live here so the main screens stay calm."],
["Where should I start?","Tap Learn and press Continue. Know some German already? Choose “I know some German. Test me” on the Learn screen. A few minutes every day beats a long session once a week. You can reopen this tour any time from More → How Astrolingo works."]];
let i=0;
function show(){let o=document.getElementById("tour");if(!o){o=document.createElement("div");o.id="tour";o.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px";document.body.appendChild(o)}
 const x=ST_[i];o.innerHTML=`<div style="background:var(--card,#1c1c1e);color:var(--fg,#fff);border:1px solid var(--bd,#333);border-radius:16px;padding:20px;max-width:420px;width:100%"><p style="opacity:.6;font-size:13px;margin:0 0 6px">${i+1} / ${ST_.length}</p><h2 style="margin:0 0 10px">${x[0]}</h2><p style="line-height:1.5">${x[1]}</p><div style="display:flex;gap:8px;margin-top:14px"><button type="button" class="btn" data-tr="skip">Close</button>${i?'<button type="button" class="btn" data-tr="back">Back</button>':""}<button type="button" class="btn p" data-tr="next">${i<ST_.length-1?"Next":"Got it"}</button></div></div>`}
function close(){const o=document.getElementById("tour");if(o)o.remove();ST.tour=true;try{save()}catch(e){}}
document.addEventListener("click",e=>{const t=e.target.closest("[data-tr]");if(!t)return;const a=t.dataset.tr;if(a=="skip")close();else if(a=="back"){i--;show()}else if(i<ST_.length-1){i++;show()}else close()});
// v11: the "?" icon is a first-visit helper only. Once tapped it disappears for good (ST.helpSeen) so it stops cluttering
// the header. The tour stays reachable from More > How Astrolingo works.
window.openTour=function(){i=0;show()};
const ac=document.getElementById("acct");
if(ac&&!ST.helpSeen){const b=document.createElement("button");b.id="helpb";b.type="button";b.className=ac.className;b.textContent="?";b.setAttribute("aria-label","How to use this site");
 b.onclick=()=>{ST.helpSeen=1;try{save()}catch(e){}b.classList.add("gone");setTimeout(()=>b.remove(),260);window.openTour()};ac.parentNode.insertBefore(b,ac)}
// The old tour no longer opens by itself: course.js shows a welcome + placement screen to new users instead.
// The "?" button above still opens the tour on demand.
})();
