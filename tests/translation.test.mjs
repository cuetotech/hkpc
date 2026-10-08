import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.js';

const korean='예배 시간';
function fixture(answer={response:{translations:['Worship time']}}){
 const saved=new Map(),jobs=[];
 globalThis.caches={default:{match:async r=>saved.get(r.url)?.clone(),put:async(r,v)=>saved.set(r.url,v.clone())}};
 const env={AI:{async run(model,config){jobs.push({model,config});return answer;}},TRANSLATION_LIMITER:{async limit(){return {success:true};}},ASSETS:{async fetch(){return new Response('image',{headers:{'Content-Type':'image/png'}});}}};
 const ctx={waitUntil(task){jobs.push(task);}};
 const request=(texts=[korean],language='en',headers={})=>new Request('https://vahopechurch.org/api/translate',{method:'POST',headers:{'Content-Type':'application/json','Origin':'https://vahopechurch.org',...headers},body:JSON.stringify({language,texts})});
 return {saved,jobs,env,ctx,request};
}
test('translates church content via Worker AI',async()=>{
 const f=fixture();const r=await worker.fetch(f.request(),f.env,f.ctx);
 assert.equal(r.status,200);assert.deepEqual((await r.json()).translations,['Worship time']);
 assert.match(f.jobs[0].config.messages[1].content,/Bible references/);
 await Promise.all(f.jobs.filter(v=>v instanceof Promise));assert.equal(f.saved.size,1);
});
test('repeated content hits cache without another model invocation',async()=>{
 const f=fixture();await worker.fetch(f.request(),f.env,f.ctx);
 await Promise.all(f.jobs.filter(v=>v instanceof Promise));
 const result=await worker.fetch(f.request(),f.env,f.ctx);
 assert.equal(result.status,200);assert.equal(f.jobs.filter(v=>v.model).length,1);
});
test('rejects unsupported locales, oversized payloads and cross-origin requests',async()=>{
 const f=fixture();
 assert.equal((await worker.fetch(f.request([korean],'fr'),f.env,f.ctx)).status,400);
 assert.equal((await worker.fetch(f.request(['plain English']),f.env,f.ctx)).status,400);
 assert.equal((await worker.fetch(f.request(Array(9).fill(korean)),f.env,f.ctx)).status,400);
 assert.equal((await worker.fetch(f.request([korean],'en',{Origin:'https://attacker.test'}),f.env,f.ctx)).status,403);
});
test('invalid model output fails closed',async()=>{
 const f=fixture({response:{translations:[]}});
 const response=await worker.fetch(f.request(),f.env,f.ctx);
 assert.equal(response.status,503);
});
test('non-HTML assets remain unchanged',async()=>{
 const f=fixture();
 const result=await worker.fetch(new Request('https://vahopechurch.org/image.png'),f.env,f.ctx);
 assert.equal(await result.text(),'image');
});
