// =====================================================================================================================
// Astrolingo UX TIDY-UP (ux.js, v1). Pure addition, loaded last. Delete the file + its <script> tag to undo everything.
//
// WHY: the Practice screen (Sentences / Words / Build) showed 4 dropdowns + length + direction before the one thing
// people actually want to do: press Start. Rule used (Apple-style "progressive disclosure"): show the primary action and a
// one-line summary of the current choice; keep the rarely-changed options one tap away.
//
// WHAT IT DOES
//  1. Practice screens (tabs s, w, b): the filters (Word frequency, Level, Theme, Number per session, Direction) move into a
//     collapsed <details class="ux-f"> whose title is a live summary, e.g. "A2 · Any theme · 10 cards · English → German".
//     The selects keep their ids (fr, fl, ft, fn) and the Direction button keeps data-a="dir", so app.js reads them
//     exactly as before, even while the panel is closed.
//  2. Nothing else is touched. Navigation changes are NOT made here yet (see UX_PLAN.md).
//
// HOW IT HOOKS IN: wraps form() (app.js) and calls tidy() after each render. tidy() is idempotent (it checks for .ux-f).
// TO ADD ANOTHER COLLAPSIBLE: copy tidy(), change the selector for the first/last node and the summary() text.
// KNOWN LIMIT: the summary reads the <select> labels, so if you rename an option the summary follows automatically.
// =====================================================================================================================
(function(){
"use strict";
const st=document.createElement("style");
st.textContent=`.ux-f{margin:10px 0 14px;border:1px solid var(--bd);border-radius:12px;background:var(--card)}
.ux-f>summary{list-style:none;cursor:pointer;padding:12px 14px;display:flex;justify-content:space-between;gap:10px;align-items:center;font-size:15px;min-height:44px}
.ux-f>summary::-webkit-details-marker{display:none}.ux-f>summary b{font-weight:600}.ux-f>summary span{opacity:.6;font-size:13px;white-space:nowrap}
.ux-f[open]>summary{border-bottom:1px solid var(--bd)}.ux-f .ux-in{padding:2px 14px 14px}`;
document.head.appendChild(st);
const txt=id=>{const s=document.getElementById(id);return s&&s.options&&s.selectedIndex>=0?s.options[s.selectedIndex].text:""};
function summary(box){
 const dir=box.querySelector('[data-a="dir"]'),parts=[txt("fl"),txt("ft"),txt("fr")].filter(Boolean).filter(t=>!/^Any/.test(t)),n=txt("fn");
 return (parts.length?parts.join(" · "):"All levels · all themes")+(n?" · "+n+" cards":"")+(dir?" · "+dir.textContent.replace(/\s*\(.*\)/,""):"")}
function tidy(){
 const box=document.querySelector("#app > .box");if(!box||!box.querySelector("#fn")||box.querySelector(".ux-f"))return;
 const kids=[...box.children],first=kids.find(n=>n.tagName==="LABEL"),dirBtn=box.querySelector('[data-a="dir"]');
 const last=dirBtn||box.querySelector("#fn");   // Build has no Direction button: group ends at the "Number per session" select
 if(!first||!last)return;
 const a=kids.indexOf(first),b=kids.indexOf(last),group=kids.slice(a,b+1);
 const d=document.createElement("details");d.className="ux-f";
 d.innerHTML=`<summary><b>Options</b><span></span></summary><div class="ux-in"></div>`;
 first.parentNode.insertBefore(d,first);const inner=d.querySelector(".ux-in");group.forEach(n=>inner.appendChild(n));
 const upd=()=>{d.querySelector("summary span").textContent=summary(box)};upd();
 d.addEventListener("change",()=>setTimeout(upd,0));d.addEventListener("click",()=>setTimeout(upd,60));   // direction is a button, not a select
}
try{const _f=form;form=function(){const r=_f.apply(this,arguments);try{tidy()}catch(e){}return r}}catch(e){}
})();
