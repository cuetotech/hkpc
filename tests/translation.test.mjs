import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker, { TranslationCache } from '../src/worker.js';

const KOREAN='예배 시간';
const ORIGIN='https://vahopechurch.org';
const sleep=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));

function fixture({ database, delay=0, failStore=false, badOutput=false, deny=false }={}){
 const disk=database||new Map(); // Reuse this across fixtures to simulate independent visitors/deployments.
 const edge=new Map(),objects=new Map(),calls=[],limits=[],jobs=[];
 globalThis.caches={default:{
  async match(request){return edge.get(request.url)?.clone()??null;},
  async put(request,response){edge.set(request.url,response.clone());}
 }};
 const env={
  AI:{async run(model,options){
   calls.push({model,options});
   if(delay)await sleep(delay);
   const input=JSON.parse(options.messages[1].content.split('Segments: ').at(-1));
   return badOutput?{response:{translations:[]}}:{response:{translations:input.map(t=>'Translated: '+t)}};
  }},
  TRANSLATION_LIMITER:{async limit({key}){limits.push(key);return {success:!deny};}},
  ASSETS:{async fetch(){return new Response('an image',{headers:{'Content-Type':'image/png'}});}}
 };
 env.TRANSLATION_CACHE={
  getByName(name){
   if(!objects.has(name)){
    if(!disk.has(name))disk.set(name,new Map());
    const records=disk.get(name);
    const state={storage:{
     async get(keys){
      if(Array.isArray(keys))return new Map(keys.filter(k=>records.has(k)).map(k=>[k,records.get(k)]));
      return records.get(keys);
     },
     async put(values){
      if(failStore)throw new Error('Persistent storage failure');
      for(const [key,value] of Object.entries(values))records.set(key,value);
     }
    }};
    const object=new TranslationCache(state,env);
    objects.set(name,{async fetch(url,options){return object.fetch(new Request(url,options));},object});
   }
   return objects.get(name);
  }
 };
 const ctx={waitUntil(job){jobs.push(job);}};
 const request=(texts=[KOREAN],language='en',headers={})=>new Request(ORIGIN+'/api/translate',{method:'POST',headers:{'Content-Type':'application/json','Origin':ORIGIN,...headers},body:JSON.stringify({language,texts})});
 return {disk,edge,objects,calls,limits,jobs,env,ctx,request,async flush(){await Promise.all(jobs);}};
}

test('first use generates translation and durably stores it',async()=>{
 const f=fixture();
 const response=await worker.fetch(f.request(),f.env,f.ctx);
 assert.equal(response.status,200);
 assert.equal(response.headers.get('X-Translation-Cache'),'MISS-GENERATED');
 assert.deepEqual((await response.json()).translations,['Translated: '+KOREAN]);
 assert.equal(f.calls.length,1);
 assert.match(f.calls[0].options.messages[1].content,/Bible references/);
 assert.equal(f.disk.get('hkpc-en').size,1);
 await f.flush();
 assert.equal(f.edge.size,1);
});

test('a new region without edge entries uses persistent storage, never AI',async()=>{
 const first=fixture();
 await worker.fetch(first.request(),first.env,first.ctx);
 const next=fixture({database:first.disk});
 const answer=await worker.fetch(next.request(),next.env,next.ctx);
 assert.equal(answer.status,200);
 assert.equal(answer.headers.get('X-Translation-Cache'),'HIT-PERSISTENT');
 assert.equal(next.calls.length,0);
 assert.deepEqual((await answer.json()).translations,['Translated: '+KOREAN]);
 await next.flush();
 const third=await worker.fetch(next.request(),next.env,next.ctx);
 assert.equal(third.headers.get('X-Translation-Cache'),'HIT-EDGE');
 assert.equal(next.calls.length,0);
});

test('ten simultaneous cache misses share a single paid inference',async()=>{
 const f=fixture({delay:30});
 const responses=await Promise.all(Array.from({length:10},()=>worker.fetch(f.request(),f.env,f.ctx)));
 assert.ok(responses.every(r=>r.status===200));
 assert.equal(f.calls.length,1);
 assert.equal(f.limits.length,1);
 assert.equal(f.disk.get('hkpc-en').size,1);
});

test('duplicate text in a batch generates and stores just once',async()=>{
 const f=fixture();
 const r=await worker.fetch(f.request([KOREAN,KOREAN]),f.env,f.ctx);
 assert.equal(r.status,200);
 assert.deepEqual((await r.json()).translations,['Translated: '+KOREAN,'Translated: '+KOREAN]);
 assert.equal(f.calls.length,1);
 assert.equal(f.disk.get('hkpc-en').size,1);
});

test('changed source text and another language use distinct durable entries',async()=>{
 const f=fixture();
 await worker.fetch(f.request(),f.env,f.ctx);
 await worker.fetch(f.request(['예배 안내']),f.env,f.ctx);
 await worker.fetch(f.request([KOREAN],'es'),f.env,f.ctx);
 assert.equal(f.calls.length,3);
 assert.equal(f.disk.get('hkpc-en').size,2);
 assert.equal(f.disk.get('hkpc-es').size,1);
});

test('invalid model output does not write a persistent cache entry',async()=>{
 const f=fixture({badOutput:true});
 const answer=await worker.fetch(f.request(),f.env,f.ctx);
 assert.equal(answer.status,503);
 assert.equal(f.disk.has('hkpc-en')&&f.disk.get('hkpc-en').size,0);
 assert.equal(f.calls.length,1);
});

test('storage failure must not be reported as successful translation',async()=>{
 const f=fixture({failStore:true});
 const answer=await worker.fetch(f.request(),f.env,f.ctx);
 assert.equal(answer.status,503);
 assert.equal(f.disk.get('hkpc-en').size,0);
 assert.equal(f.edge.size,0);
});

test('missing durable storage fails closed without spending AI tokens',async()=>{
 const f=fixture();
 delete f.env.TRANSLATION_CACHE;
 const response=await worker.fetch(f.request(),f.env,f.ctx);
 assert.equal(response.status,503);
 assert.equal((await response.json()).error,'translation_cache_unavailable');
 assert.equal(f.calls.length,0);
});

test('rate limiting blocks a new inference but never cached results',async()=>{
 const f=fixture();
 await worker.fetch(f.request(),f.env,f.ctx);
 const second=fixture({database:f.disk,deny:true});
 const existing=await worker.fetch(second.request(),second.env,second.ctx);
 assert.equal(existing.status,200);
 assert.equal(second.limits.length,0);
 const unseen=await worker.fetch(second.request(['주일 예배']),second.env,second.ctx);
 assert.equal(unseen.status,429);
 assert.equal(second.calls.length,0);
});

test('rejects bad input, wrong origins and unsupported language',async()=>{
 const f=fixture();
 assert.equal((await worker.fetch(f.request([KOREAN],'fr'),f.env,f.ctx)).status,400);
 assert.equal((await worker.fetch(f.request(['plain English']),f.env,f.ctx)).status,400);
 assert.equal((await worker.fetch(f.request(Array(9).fill(KOREAN)),f.env,f.ctx)).status,400);
 assert.equal((await worker.fetch(f.request([KOREAN],'en',{Origin:'https://wrong.test'}),f.env,f.ctx)).status,403);
 assert.equal(f.calls.length,0);
});

test('non-HTML assets bypass translation code',async()=>{
 const f=fixture();
 const result=await worker.fetch(new Request(ORIGIN+'/logo.png'),f.env,f.ctx);
 assert.equal(await result.text(),'an image');
});

test('SQLite Durable Object is explicitly configured and preview storage isolated',()=>{
 const config=JSON.parse(readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8'));
 assert.deepEqual(config.durable_objects.bindings,[{name:'TRANSLATION_CACHE',class_name:'TranslationCache'}]);
 assert.deepEqual(config.previews.durable_objects.bindings,config.durable_objects.bindings);
 assert.ok(config.migrations.some(m=>m.new_sqlite_classes?.includes('TranslationCache')));
 assert.notEqual(config.previews.ratelimits[0].namespace_id,config.ratelimits[0].namespace_id);
});
