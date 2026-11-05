// =====================================================================================================================
// Astrolingo SOUND DESIGN (sound.js, v1). Pure addition, loaded after features.js/app scripts. Delete this file and its
// <script> tag and the site goes back to the old beeps.
//
// WHY: the old sfx were single sine/triangle beeps (tone()), identical for every action, and harsh when repeated.
// WHAT THIS DOES
//  1. A tiny synth: bell-like voices (a note + two inharmonic partials, like a real bell), a soft low-pass for "bad"
//     sounds, short filtered-noise "air" for taps/whooshes, a compressor so nothing ever clips, and a short generated
//     reverb so sounds feel like they happen in a space instead of inside the speaker.
//  2. Every action has its own sound (see PALETTE below). The old names keep working (sfx.tap/good/easy/bad/level/done/
//     ach), so no other file needs editing. New names: soft, close, nav, coin, gift, zap, micOn, micOff, spawn, match,
//     miss, tick, praise, flip.
//  3. INTERACTIVE: consecutive right answers climb a pentatonic scale (a little melody builds while you are on a roll);
//     a wrong answer resets it. Notes are always from the same scale, so overlapping sounds never clash.
//  4. Automatic cues without touching other files: modal/sheet opening and closing, bottom-bar navigation, and the
//     microphone buttons (listeners at the bottom of this file).
//
// HOW TO EDIT: every sound is one small function in PALETTE using note(freq, startDelaySeconds, duration, options).
// Options: v volume (keep <= .12), a attack, h partials [[ratio, amp], ...], type, lp low-pass Hz, glide end-ratio,
// pan -1..1. Respect ST.snd===false (the Sound effects setting); every entry point checks it.
// Nothing here uses files or network: all audio is synthesised in the browser (Web Audio).
// =====================================================================================================================
(function(){
"use strict";
let M=null,combo=0,comboT=0;
// C major pentatonic across two octaves: any mix of these notes sounds consonant.
const SC=[523.25,587.33,659.25,783.99,880,1046.5,1174.66,1318.51];
const ok=()=>ST.snd!==false;
const AC_=()=>{try{return typeof audioCtx=="function"?audioCtx():null}catch(e){return null}};

function impulse(A,sec,decay){const n=Math.max(1,A.sampleRate*sec|0),b=A.createBuffer(2,n,A.sampleRate);
 for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,decay)}return b}
// Master chain: voices -> in -> (dry + short reverb) -> compressor -> speakers. Built once per AudioContext.
function chain(A){
 if(M&&M.ctx===A)return M;
 const inp=A.createGain(),dry=A.createGain(),wet=A.createGain(),cv=A.createConvolver(),cp=A.createDynamicsCompressor();
 inp.gain.value=.9;dry.gain.value=1;wet.gain.value=.2;cv.buffer=impulse(A,.45,2.6);
 cp.threshold.value=-20;cp.knee.value=24;cp.ratio.value=3.5;cp.attack.value=.004;cp.release.value=.18;
 inp.connect(dry);inp.connect(cv);cv.connect(wet);dry.connect(cp);wet.connect(cp);cp.connect(A.destination);
 M={ctx:A,inp};return M}

// One bell-ish note. See the option list in the file header.
function note(f,at,d,o){o=o||{};if(!ok())return;const A=AC_();if(!A)return;
 try{const m=chain(A),t=A.currentTime+(at||0),g=A.createGain();
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(o.v||.08,t+(o.a||.006));g.gain.exponentialRampToValueAtTime(.0001,t+d);
  let out=g;
  if(o.lp){const l=A.createBiquadFilter();l.type="lowpass";l.frequency.value=o.lp;g.connect(l);out=l}
  if(o.pan&&A.createStereoPanner){const p=A.createStereoPanner();p.pan.value=o.pan;out.connect(p);out=p}
  out.connect(m.inp);
  (o.h||[[1,1]]).forEach(([r,amp])=>{const os=A.createOscillator(),gg=A.createGain();os.type=o.type||"sine";
   os.frequency.setValueAtTime(f*r,t);if(o.glide)os.frequency.exponentialRampToValueAtTime(Math.max(30,f*r*o.glide),t+d);
   gg.gain.value=amp;os.connect(gg);gg.connect(g);os.start(t);os.stop(t+d+.05)})}catch(e){}}
const BELL=[[1,1],[2.76,.16],[5.4,.06]];            // inharmonic partials = a soft bell instead of a plain beep
// Short burst of filtered noise ("air"): taps, swishes, lightning crackle.
function air(at,d,o){o=o||{};if(!ok())return;const A=AC_();if(!A)return;
 try{const m=chain(A),t=A.currentTime+(at||0),n=Math.max(1,A.sampleRate*d|0),b=A.createBuffer(1,n,A.sampleRate),ch=b.getChannelData(0);
  for(let i=0;i<n;i++)ch[i]=(Math.random()*2-1)*Math.pow(1-i/n,o.shape||2);
  const s=A.createBufferSource(),f=A.createBiquadFilter(),g=A.createGain();s.buffer=b;f.type=o.type||"bandpass";f.Q.value=o.q||1.2;
  f.frequency.setValueAtTime(o.f||2500,t);if(o.sweep)f.frequency.exponentialRampToValueAtTime(o.sweep,t+d);
  g.gain.value=o.v||.04;s.connect(f);f.connect(g);g.connect(m.inp);s.start(t)}catch(e){}}

const PALETTE={
 // --- taps and navigation ---
 tap(){air(0,.018,{f:3200,q:2,v:.03,shape:3});note(1500,0,.03,{v:.012,a:.002})},                    // barely-there click
 flip(){air(0,.07,{f:1800,sweep:3600,q:.9,v:.035});note(740,.02,.09,{v:.03,h:BELL})},               // card turns over
 nav(){air(0,.14,{f:900,sweep:2600,q:.7,v:.03,shape:1.5})},                                            // soft swish between sections
 soft(){note(523.25,0,.2,{v:.04,h:BELL,lp:3000});note(784,.06,.2,{v:.03,h:BELL,lp:3000})},           // modal / sheet opens
 close(){note(784,0,.16,{v:.03,h:BELL,lp:3000});note(523.25,.05,.2,{v:.025,h:BELL,lp:3000})},        // modal / sheet closes
 // --- answers (INTERACTIVE: climbs the scale while you are on a roll) ---
 good(){const k=Math.min(combo,SC.length-1);note(SC[k],0,.34,{v:.085,h:BELL});if(combo>=3)note(SC[Math.min(k+2,SC.length-1)],.1,.3,{v:.04,h:BELL,pan:.25});combo++;comboT=Date.now()},
 easy(){const k=Math.min(combo,SC.length-3);[0,1,2].forEach(j=>note(SC[k+j],j*.07,.34,{v:.075,h:BELL}));note(SC[k+2]*2,.24,.4,{v:.03,h:BELL,pan:-.3});combo++;comboT=Date.now()},
 bad(){combo=0;note(233,0,.26,{v:.09,glide:.72,lp:1100,type:"triangle"});note(175,.07,.3,{v:.06,glide:.8,lp:900,type:"triangle"})},   // soft, low, never harsh
 praise(){[0,2,4].forEach((j,n)=>note(SC[j],n*.06,.3,{v:.06,h:BELL}))},
 // --- progress and rewards ---
 level(){[0,2,3,5].forEach((j,n)=>note(SC[j],n*.09,.5,{v:.08,h:BELL}));note(SC[7],.4,.9,{v:.05,h:BELL,pan:.2});air(.38,.5,{f:5000,type:"highpass",q:.5,v:.012,shape:1.2})},
 done(){[0,2,3].forEach((j,n)=>note(SC[j],n*.1,.7,{v:.07,h:BELL}));note(SC[5],.34,.9,{v:.045,h:BELL})},
 ach(){note(SC[3],0,.4,{v:.08,h:BELL});note(SC[6],.11,.6,{v:.06,h:BELL,pan:.2});note(SC[7],.2,.7,{v:.03,h:BELL,pan:-.2})},
 coin(){note(1975,0,.14,{v:.05,h:BELL});note(2637,.07,.28,{v:.045,h:BELL})},
 gift(){[0,1,2,3,4,5].forEach((j,n)=>note(SC[j],n*.06,.38,{v:.05,h:BELL,pan:(n%2?.3:-.3)}))},
 zap(){air(0,.2,{f:6000,type:"highpass",q:.6,v:.045,shape:1.4});note(900,0,.2,{v:.045,type:"sawtooth",glide:.12,lp:3500});note(90,0,.28,{v:.09,glide:.5})},   // streak lightning
 // --- microphone ---
 micOn(){note(660,0,.09,{v:.05,h:BELL});note(990,.07,.14,{v:.05,h:BELL})},
 micOff(){note(990,0,.09,{v:.04,h:BELL});note(660,.07,.14,{v:.04,h:BELL})},
 // --- Blitz game ---
 spawn(){note(SC[(Math.random()*5)|0]*2,0,.12,{v:.02,h:BELL,pan:Math.random()*1.2-.6})},                 // a word appears
 match(){const k=Math.min(combo,SC.length-1);note(SC[k],0,.3,{v:.07,h:BELL});note(SC[k]*1.5,.06,.3,{v:.04,h:BELL});combo++;comboT=Date.now()},
 miss(){combo=0;note(196,0,.22,{v:.08,glide:.75,lp:900,type:"triangle"})},
 tick(){air(0,.03,{f:2200,q:3,v:.05,shape:3});note(1200,0,.04,{v:.02})}
};
// Keep the old names working and add the new ones. A thrown error in a sound must never break the app.
Object.keys(PALETTE).forEach(k=>{sfx[k]=function(){try{if(combo&&Date.now()-comboT>25000)combo=0;PALETTE[k]()}catch(e){}}});
window.soundTest=()=>["tap","good","good","good","easy","bad","level","done","ach","coin","gift","zap","micOn","micOff","soft","close","nav","flip","spawn","match","miss","tick","praise"].forEach((k,n)=>setTimeout(()=>sfx[k](),n*420));

// ---- automatic cues (no edits needed in other files) ----
const watchClass=(id,test,fnOpen,fnClose)=>{const el=document.getElementById(id);if(!el)return;let was=test(el);
 new MutationObserver(()=>{const now=test(el);if(now&&!was)fnOpen();else if(!now&&was)fnClose();was=now}).observe(el,{attributes:true,attributeFilter:["class"]})};
watchClass("md",e=>!e.classList.contains("hide"),()=>sfx.soft(),()=>sfx.close());       // login / about / privacy modal
// The bottom sheet element (#sheet) is created lazily by openSheet() the first time it is needed, so wait for it.
{const iv=setInterval(()=>{if(document.getElementById("sheet")){watchClass("sheet",e=>e.classList.contains("on"),()=>sfx.soft(),()=>sfx.close());clearInterval(iv)}},700)}   // bottom sheets (More, wallet, word popup)
document.addEventListener("click",e=>{
 if(e.target.closest&&e.target.closest("#bbar button"))sfx.nav();
 else if(e.target.closest&&e.target.closest('[data-sp="mic"],[data-ra="read"],[data-ra="again"],.sp-mic'))sfx.micOn();
},true);
})();
