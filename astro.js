// Optional "online brain" for Astro (Vercel serverless function). 100% free options first.
// Set ONE OR MORE of these in Vercel -> Project -> Settings -> Environment Variables, then redeploy:
//   GROQ_API_KEY        (free tier at console.groq.com)
//   GEMINI_API_KEY      (free tier at aistudio.google.com/apikey)
//   OPENROUTER_API_KEY  (free models at openrouter.ai)
//   ANTHROPIC_API_KEY   (paid)
// Providers are tried in that order. ASTRO_MODEL overrides the model of the first provider that has a key.
// Free-tier model names and limits change, so check each provider's docs if a provider stops answering.
// With no key, this returns 501 and the site silently uses the built-in offline Astro / the on-device model.
const MIN=8,DAY=40,hits=new Map();   // best-effort per-IP limits (memory resets on cold start)
function limited(ip){const now=Date.now(),h=(hits.get(ip)||[]).filter(t=>now-t<864e5);const lastMin=h.filter(t=>now-t<6e4).length;if(lastMin>=MIN||h.length>=DAY){hits.set(ip,h);return true}h.push(now);hits.set(ip,h);if(hits.size>5000)hits.clear();return false}
module.exports=async function(req,res){
 res.setHeader("Cache-Control","no-store");
 if(req.method!=="POST")return res.status(405).json({error:"method"});
 const E=process.env;if(!(E.GROQ_API_KEY||E.GEMINI_API_KEY||E.OPENROUTER_API_KEY||E.ANTHROPIC_API_KEY))return res.status(501).json({error:"not_configured"});
 const ip=String(req.headers["x-forwarded-for"]||req.socket&&req.socket.remoteAddress||"x").split(",")[0].trim();
 if(limited(ip))return res.status(429).json({error:"slow_down"});
 let b=req.body;if(typeof b==="string"){try{b=JSON.parse(b)}catch(e){b={}}}b=b||{};
 let msgs=(Array.isArray(b.messages)?b.messages:[]).slice(-8).filter(m=>m&&(m.role==="user"||m.role==="assistant")&&typeof m.content==="string"&&m.content.trim()).map(m=>({role:m.role,content:m.content.slice(0,600)}));
 const out=[];for(const m of msgs){if(out.length&&out[out.length-1].role===m.role)out[out.length-1].content+="\n"+m.content;else out.push(m)}
 while(out.length&&out[0].role!=="user")out.shift();
 if(!out.length||out[out.length-1].role!=="user")return res.status(400).json({error:"bad_request"});
 const c=b.ctx||{},nm=String(c.name||"").replace(/[^\p{L}\- ]/gu,"").slice(0,24);
 const system=`You are Astro, a warm, smart German coach inside the language-learning site "Astro 80/20" (the 80/20 idea: the most common German gets you most of the way). You are a friendly person: buddy, coach and teacher. You are not a robot and never describe yourself as an AI unless sincerely asked.
${nm?`The learner is called ${nm}. Use their name occasionally, not in every message.`:"You don't know the learner's name yet."}
Learner context: ${Number(c.learned)||0} sentences learned, streak ${Number(c.streak)||0} days, ${Number(c.mistakes)||0} open mistakes. Adjust difficulty: if they have learned few sentences, use simple words and short explanations.
Rules: answer in clear English with German examples (with English translations). Keep replies short (at most about 120 words) unless asked for more. When asked how to say something, give the natural spoken version Germans actually use, plus the textbook version if it differs, and one tip on register (du/Sie, casual/formal). When the learner writes German, correct it gently: show the corrected sentence, then one short reason. Don't invent facts; if unsure, say so. Stay on topic: German language and learning. Plain text only, you may use **bold**. No lists longer than 4 items.`;
 const M=E.ASTRO_MODEL,P=[];
 if(E.GROQ_API_KEY)P.push(()=>oai("https://api.groq.com/openai/v1/chat/completions",E.GROQ_API_KEY,M||"llama-3.1-8b-instant"));
 if(E.GEMINI_API_KEY)P.push(()=>gem(E.GEMINI_API_KEY,M||"gemini-2.0-flash"));
 if(E.OPENROUTER_API_KEY)P.push(()=>oai("https://openrouter.ai/api/v1/chat/completions",E.OPENROUTER_API_KEY,M||"meta-llama/llama-3.3-70b-instruct:free"));
 if(E.ANTHROPIC_API_KEY)P.push(()=>ant(E.ANTHROPIC_API_KEY,M||"claude-haiku-5-5"));
 async function oai(url,key,model){const r=await fetch(url,{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer "+key},body:JSON.stringify({model,max_tokens:450,temperature:.5,messages:[{role:"system",content:system},...out]})});if(!r.ok)throw 0;const j=await r.json();return j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content}
 async function gem(key,model){const r=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+model+":generateContent",{method:"POST",headers:{"content-type":"application/json","x-goog-api-key":key},body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents:out.map(m=>({role:m.role==="assistant"?"model":"user",parts:[{text:m.content}]})),generationConfig:{maxOutputTokens:450,temperature:.5}})});if(!r.ok)throw 0;const j=await r.json();return(j.candidates&&j.candidates[0]&&j.candidates[0].content&&j.candidates[0].content.parts||[]).map(p=>p.text||"").join("")}
 async function ant(key,model){const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01"},body:JSON.stringify({model,max_tokens:450,system,messages:out})});if(!r.ok)throw 0;const j=await r.json();return(j.content||[]).filter(x=>x.type==="text").map(x=>x.text).join("\n")}
 for(const f of P){try{const t=String(await f()||"").trim();if(t)return res.status(200).json({reply:t.slice(0,1500)})}catch(e){}}
 return res.status(502).json({error:"upstream"});
};
