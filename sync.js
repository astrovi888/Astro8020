
// ====== EDIT THESE ======
const SB_URL="https://pqvxlzpzpghlzcwpzdeo.supabase.co";      // e.g. https://abcdxyz.supabase.co
const SB_KEY="sb_publishable_1fU-Jyeeu6np1J7vgUrrOg__6A7XVwa";  // Project Settings > API > anon public key
const SUPPORT_URL="";                                 // later: your Patreon / Ko-fi / Buy Me a Coffee link
const HANDLE="@axtroviii", IG_URL="https://instagram.com/axtroviii";   // Instagram + WhatsApp handle (no phone number shown)
const CRYPTO_ADDR="", CRYPTO_NET="";   // TODO: paste your wallet address (and network, e.g. "USDT TRC20")
const COFFEE_URL="", PATREON_URL="";   // TODO later
const AD_CLIENT="", AD_SLOT="";        // TODO: Google AdSense ids (ca-pub-..., slot id). Ads stay hidden until set.
const ABOUT_HTML=`<h2>About Astro 80/20</h2>
<p>Astro 80/20 teaches German through real, useful sentences built from the most frequent words, so the first 20% of vocabulary gives you most of everyday German.</p>
<p>Practice with spaced repetition, build sentences, drill der/die/das, and track your progress from A1 to B2.</p>
<p><b>Creator.</b> Created by <b>Firas Smii (Astro)</b> to help those who can’t afford expensive education. Instagram &amp; WhatsApp: <a href="${IG_URL}" target="_blank" rel="noopener">${HANDLE}</a></p>
<p><b>Sources and credits.</b> The 1,000 most common German words, their frequency order, English meanings and CEFR levels come from <a href="https://www.lenguia.com/tools/most-common-words/german" target="_blank" rel="noopener">Lenguia</a>. Sentences, grammar notes and starter stories were written for this site. Translation is provided by MyMemory. Pronunciation uses your device’s text-to-speech voice.</p>`;
// ========================
const sb=(window.supabase&&/^https:\/\//.test(SB_URL))?window.supabase.createClient(SB_URL,SB_KEY):null;
let PEND=null,USER=null,tm2=0,synced=false;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function merge(a,b){
 a=a||{};b=b||{};const r=Object.assign({},dflt,a),newer=(a.last||"")>=(b.last||"")?a:b;
 r.xp=Math.max(a.xp||0,b.xp||0);r.best=Math.max(a.best||0,b.best||0);r.streak=newer.streak||0;r.last=newer.last||"";r.today=newer.today||r.today;
 r.cards=Object.assign({},b.cards);
 for(const k in (a.cards||{})){const x=a.cards[k],y=r.cards[k];r.cards[k]=!y||x.reps>y.reps||(x.reps==y.reps&&x.due>y.due)?x:y}
 r.hist=Object.assign({},b.hist);for(const k in (a.hist||{}))r.hist[k]=Math.max(a.hist[k],r.hist[k]||0);
 r.hw=Object.assign({},b.hw);for(const k in (a.hw||{}))r.hw[k]=Math.max(a.hw[k],r.hw[k]||0);
 r.art=Object.assign({},b.art);for(const k in (a.art||{})){const y=r.art[k]||{ok:0,bad:0};r.art[k]={ok:Math.max(a.art[k].ok,y.ok),bad:Math.max(a.art[k].bad,y.bad)}}
 r.f=a.f||b.f||dflt.f;{const keep=k=>k[0]!="w"||(a.wv===2&&a.cards&&a.cards[k])||(b.wv===2&&b.cards&&b.cards[k]);for(const k in r.cards)if(!keep(k))delete r.cards[k];r.wv=2}r.ach=Object.assign({},b.ach,a.ach);r.read=Object.assign({},b.read,a.read);r.dq=Object.assign({},b.dq,a.dq);["nses","built","perfect","mbest","ce","cs","fb","fu"].forEach(k=>r[k]=Math.max(a[k]||0,b[k]||0));["snd","auto","slow","lb","nick","ads","nag","casual"].forEach(k=>{r[k]=a[k]!==undefined?a[k]:b[k]});r.dir=a.dir||b.dir;r.goal=a.goal||b.goal||10;return r;
}
function setNote(t){$("st").textContent=t}
async function push(){
 if(!sb||!USER||!synced)return;
 try{const{error}=await sb.from("progress").upsert({user_id:USER.id,data:ST,updated_at:new Date().toISOString()});if(error)throw error;setNote("Synced to your account")}
 catch(e){setNote("Offline: saved on this device, will sync later")}
}
function pushSoon(){if(!sb||!USER||!synced)return;clearTimeout(tm2);tm2=setTimeout(push,2000)}
async function pull(){
 try{const{data,error}=await sb.from("progress").select("data").eq("user_id",USER.id).maybeSingle();if(error)throw error;
  ST=merge(ST,data&&data.data);ST.uid=USER.id;synced=true;save();await push();topbar();if(!q.length&&tab!="a")render()}
 catch(e){setNote("Sync failed. Your progress is still saved on this device.")}
}
function acctBtn(){const b=$("acct");b.classList.toggle("hide",!sb);b.textContent=USER?"Account":"Log in"}
async function setUser(u){
 if(u&&USER&&USER.id==u.id)return;
 if(!u){USER=null;synced=false;acctBtn();return}
 USER=u;synced=false;acctBtn();
 if(ST.uid&&ST.uid!=u.id)ST=Object.assign({},dflt);   // another account used this browser before
 setNote("Syncing…");await pull();
}
function msg(t,bad){const m=$("mm");if(m){m.textContent=t;m.style.color=bad?"#dc2626":"var(--mut)"}}
function closeModal(){$("md").classList.add("hide")}
function modal(m){
 $("md").classList.remove("hide");
 const f=(id,l,t,ac,x)=>`<label for="${id}">${l}</label><input id="${id}" type="${t}" autocomplete="${ac}" required ${x||""}>`;
 const sub=(t)=>`<div style="height:14px"></div><button class="btn p">${t}</button>`;
 const C={
  login:`<h2>Log in</h2><form data-f="login">${f("ae","Email","email","email")}${f("ap","Password","password","current-password")}${sub("Log in")}</form><p class="lk"><a href="#" data-m="otp">Email me a code instead</a> · <a href="#" data-m="reset">Forgot password?</a></p><p class="lk"><a href="#" data-m="signup">Create account</a></p>`,
  otp:`<h2>Log in with a code</h2><form data-f="otp">${f("ae","Email","email","email")}${sub("Send code")}</form><p class="lk"><a href="#" data-m="login">Back to log in</a></p>`,
  code:`<h2>Enter your code</h2><p class="en" style="font-size:14px">We sent a code to <b>${PEND?esc(PEND.email):""}</b>. Check your inbox (and spam).</p><form data-f="code">${f("cd","Code","text","one-time-code",'inputmode="numeric" maxlength="10"')}${sub("Confirm")}</form><p class="lk"><a href="#" data-x="resend">Send a new code</a></p>`,
  signup:`<h2>Create account</h2><form data-f="signup">${f("un","Username (3–20 letters or numbers)","text","username",'maxlength="20"')}${f("ae","Email (Gmail works)","email","email")}${f("ap","Password (min 6 characters)","password","new-password",'minlength="6"')}${f("ap2","Confirm password","password","new-password",'minlength="6"')}${sub("Send me a code")}</form><p class="lk">Your progress will sync across devices. <a href="#" data-m="login">I already have an account</a></p>`,
  reset:`<h2>Reset password</h2><form data-f="reset">${f("ae","Email","email","email")}${sub("Send reset link")}</form><p class="lk"><a href="#" data-m="login">Back to log in</a></p>`,
  newpass:`<h2>Choose a new password</h2><form data-f="newpass">${f("ap","New password","password","new-password",'minlength="6"')}${sub("Save password")}</form>`,
  acct:`<h2>Account</h2><p class="en"><b>${USER&&USER.user_metadata&&USER.user_metadata.username?esc(USER.user_metadata.username):""}</b> ${USER?esc(USER.email):""}</p><p class="en" style="font-size:14px">Your progress syncs automatically.</p><div class="row"><button type="button" class="btn" data-x="sync">Sync now</button><button type="button" class="btn" data-x="out">Log out</button></div>`,
  about:ABOUT_HTML,
  privacy:`<h2>Privacy</h2>
<p><b>On your device.</b> Your progress, settings and achievements are saved in your browser (local storage). Nothing else is stored unless you create an account.</p>
<p><b>Accounts.</b> If you sign up, your email address and progress are stored with our database provider, Supabase, so they can sync across your devices. Passwords are handled by Supabase and are never visible to us. We use this data only to run the site.</p>
<p><b>Leaderboards.</b> They are opt-in. If you join, your nickname, XP, streak, sentences learned and Word Match score are visible to everyone. Pick a nickname that doesn’t identify you. You can leave at any time in Progress → Ranks, which removes your public entry.</p>
<p><b>Translator.</b> Text you type into Translate is sent to MyMemory (translated.net) to get a translation. Please don’t enter personal or confidential information.</p>
<p><b>Pronunciation.</b> Audio uses your browser’s text-to-speech. Some browsers use online voices from the browser vendor; that is handled by your browser, not by this site.</p>
<p><b>Ads.</b> Ads are off by default. Only if you switch them on in Settings, an ad network (Google AdSense) loads and may set its own cookies. <b>What we don’t do.</b> No analytics or tracking scripts, and we never sell data. Our hosting providers (GitHub Pages and the script CDN) may log standard technical data such as IP addresses under their own policies.</p>
<p><b>Your choices.</b> To have your account and data deleted, message ${HANDLE} on Instagram or WhatsApp. Clearing your browser data removes the local copy. Astro 80/20 is not intended for children under 13.</p>
<p class="lk">Last updated: October 2026.</p>`,
  support:`<h2>Support the project</h2><p>Astro 80/20 is free. If it helps you, you can support the creator in small ways (even tiny amounts are appreciated):</p>
${CRYPTO_ADDR?`<div class="note"><b>Crypto${CRYPTO_NET?" ("+esc(CRYPTO_NET)+")":""}</b><div style="word-break:break-all;font:13px monospace;margin:6px 0">${esc(CRYPTO_ADDR)}</div><button type="button" class="btn" data-x="copyaddr">Copy address</button></div>`:`<div class="note"><b>Crypto</b><div class="en" style="font-size:14px">Wallet address coming soon.</div></div>`}
<div class="note"><b>Buy me a coffee / Patreon</b><div class="en" style="font-size:14px">${COFFEE_URL||PATREON_URL?`${COFFEE_URL?`<a href="${COFFEE_URL}" target="_blank" rel="noopener">Coffee</a> `:""}${PATREON_URL?`<a href="${PATREON_URL}" target="_blank" rel="noopener">Patreon</a>`:""}`:"Coming later."}</div></div>
<div class="note"><b>Optional ads</b><div class="en" style="font-size:14px">Prefer not to donate? Turn on clean, non-intrusive ads in Progress → Settings. Off by default.</div></div>
<p class="lk">Questions or ideas? <a href="${IG_URL}" target="_blank" rel="noopener">${HANDLE}</a></p>`
 };
 $("mb").dataset.f=m;$("mb").innerHTML=`<button type="button" class="x" data-x="close" aria-label="Close">×</button>${C[m]}<p id="mm" class="en" role="status" style="font-size:14px;margin:10px 0 0"></p>`;
 const i1=$("ae")||$("ap");if(i1)i1.focus();
}
async function authSubmit(mode){
 const em=$("ae")?$("ae").value.trim():"",pw=$("ap")?$("ap").value:"",back=location.origin+location.pathname;
 msg("Working…");
 try{
  let r;
  if(mode=="login")r=await sb.auth.signInWithPassword({email:em,password:pw});
  else if(mode=="signup"){const un=$("un").value.trim();
   if(!/^[\p{L}\p{N}_.-]{3,20}$/u.test(un))return msg("Username: 3–20 letters, numbers, . _ or -",true);
   if(pw!==$("ap2").value)return msg("Passwords don’t match.",true);
   r=await sb.auth.signUp({email:em,password:pw,options:{data:{username:un},emailRedirectTo:back}});
   if(!r.error&&!r.data.session){PEND={email:em,type:"signup"};return modal("code")}}
  else if(mode=="otp"){r=await sb.auth.signInWithOtp({email:em,options:{shouldCreateUser:false}});if(!r.error){PEND={email:em,type:"email"};return modal("code")}}
  else if(mode=="code"){r=await sb.auth.verifyOtp({email:PEND.email,token:$("cd").value.trim(),type:PEND.type})}
  else if(mode=="reset"){r=await sb.auth.resetPasswordForEmail(em,{redirectTo:back});if(!r.error)return msg("Reset link sent. Check your email.")}
  else{r=await sb.auth.updateUser({password:pw});if(!r.error){msg("Password updated.");return setTimeout(closeModal,900)}}
  if(r.error)return msg(r.error.message,true);
  closeModal();
 }catch(e){msg("Network problem. Please try again.",true)}
}
$("mb").onsubmit=e=>{e.preventDefault();const m=e.target.dataset.f;if(["login","signup","otp","code","reset","newpass"].includes(m))authSubmit(m)};
document.addEventListener("click",e=>{
 const a=e.target.closest("[data-m]");if(a){e.preventDefault();modal(a.dataset.m);return}
 const x=e.target.closest("[data-x]");
 if(x){const v=x.dataset.x;if(v=="close")closeModal();
  else if(v=="copyaddr"){try{navigator.clipboard.writeText(CRYPTO_ADDR);pop("Address copied")}catch(e){}}
  else if(v=="resend"){(async()=>{try{PEND.type=="signup"?await sb.auth.resend({type:"signup",email:PEND.email}):await sb.auth.signInWithOtp({email:PEND.email,options:{shouldCreateUser:false}});msg("New code sent.")}catch(e){msg("Couldn’t resend. Try again shortly.",true)}})()}
  else if(v=="sync"){msg("Syncing…");pull().then(()=>msg("Up to date."))}
  else if(v=="out")(async()=>{await push();await sb.auth.signOut();ST=Object.assign({},dflt);save();closeModal();setNote("Logged out. Progress stays in your account.");render();topbar()})()}
 else if(e.target.id=="md")closeModal();
});
document.addEventListener("keydown",e=>{if(e.key=="Escape")closeModal()});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState=="hidden")push()});
$("acct").onclick=()=>modal(USER?"acct":"login");
$("sup").onclick=e=>{e.preventDefault();SUPPORT_URL?window.open(SUPPORT_URL,"_blank","noopener"):modal("support")};
acctBtn();
if(sb)sb.auth.onAuthStateChange((ev,s)=>{setTimeout(()=>{if(ev=="PASSWORD_RECOVERY")modal("newpass");setUser(s&&s.user||null)},0)});
