// Astrolingo service worker: lets the site be installed and open offline after the first visit.
// STRATEGY = NETWORK FIRST. Online, you always get the newest files (so updates are never stuck behind a cache);
// offline, the last copy that worked is served. Only same-site GET requests are touched; the AI backend (/api/)
// and other sites (Supabase, translation) are never cached.
// To force everyone to drop old caches after a big change, bump V.
const V="astrolingo-v1";
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method!=="GET"||u.origin!==location.origin||u.pathname.includes("/api/"))return;
 e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res}).catch(()=>caches.match(r).then(m=>m||caches.match("index.html"))))
});
