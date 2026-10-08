(() => {
'use strict';
const control=document.getElementById('hkpc-language-widget');
if(!control)return;
const select=document.getElementById('hkpc-language-select'),status=document.getElementById('hkpc-language-status');
const codes=new Set(['ko','en','es']),hangul=/[\uAC00-\uD7A3]/;
const excluded='script,style,noscript,textarea,select,option,svg,code,pre,[translate="no"],[contenteditable="true"]';
const messages={ko:'한국어 원문',en:'AI translation · Korean original prevails',es:'Traducción automática · prevalece el original coreano'};
const originalLang=document.documentElement.lang||'ko';
const originalTitle=document.title;
const entries=[],nodeEntries=new WeakMap(),attributeEntries=new WeakMap(),cache=new Map();
let language='ko',revision=0,working=false,rerun=false,scheduled=null;
const observer=new MutationObserver(changes=>{
 if(language==='ko'||!changes.some(c=>c.addedNodes.length))return;
 if(scheduled!==null)clearTimeout(scheduled);
 scheduled=setTimeout(()=>{scheduled=null;scan();void process();},160);
});
function connected(entry){return entry.element?.isConnected??entry.node?.isConnected??true;}
function restore(){
 observer.disconnect();
 for(const entry of entries)if(entry.applied!=='ko'&&connected(entry)){entry.write(entry.original);entry.applied='ko';}
 document.title=originalTitle;
 observe();
}
function observe(){observer.observe(document.body,{subtree:true,childList:true});}
function add(node,attr,source,write){
 const entry={node:attr?null:node,element:attr?node:null,original:source,write,applied:'ko',results:new Map()};
 entries.push(entry);return entry;
}
function scan(){
 const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 let node;
 while((node=walk.nextNode())){
  if(nodeEntries.has(node)||!hangul.test(node.nodeValue||'')||node.parentElement?.closest(excluded))continue;
  const current=node;
  nodeEntries.set(current,add(current,null,current.nodeValue,value=>{current.nodeValue=value;}));
 }
 for(const el of document.body.querySelectorAll('[alt],[title],[placeholder],[aria-label]')){
  if(el.closest(excluded))continue;
  let known=attributeEntries.get(el);
  if(!known){known=new Set();attributeEntries.set(el,known);}
  for(const attr of ['alt','title','placeholder','aria-label']){
   if(known.has(attr))continue;
   const source=el.getAttribute(attr);
   if(!source||!hangul.test(source))continue;
   known.add(attr);
   add(el,attr,source,value=>el.setAttribute(attr,value));
  }
 }
}
function segments(text){
 const pieces=[];let rest=text.trim();
 while(rest.length>800){
  let i=rest.lastIndexOf(' ',800);
  if(i<300)i=rest.lastIndexOf('\n',800);
  if(i<300)i=800;
  pieces.push({text:rest.slice(0,i).trim(),result:null});
  rest=rest.slice(i).trimStart();
 }
 if(rest)pieces.push({text:rest,result:null});
 return pieces;
}
async function translate(batch,lang){
 const response=await fetch('/api/translate',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({language:lang,texts:batch.map(p=>p.text)})});
 if(!response.ok)throw Error('Translation service unavailable: '+response.status);
 const body=await response.json();
 if(body.language!==lang||!Array.isArray(body.translations)||body.translations.length!==batch.length||body.translations.some(t=>typeof t!=='string'||!t.trim()))throw Error('Unexpected response');
 batch.forEach((p,i)=>{p.result=body.translations[i];cache.set(lang+'\u0000'+p.text,p.result);});
}
async function process(){
 if(language==='ko')return;
 if(working){rerun=true;return;}
 working=true;
 const stamp=revision,lang=language;
 status.textContent=lang==='es'?'Traduciendo...':'Translating...';
 scan();
 const states=entries.filter(e=>connected(e)&&e.applied!==lang).map(entry=>{
  const saved=entry.results.get(lang);
  const parts=saved!==undefined?[]:segments(entry.original);
  return {entry,parts,saved};
 });
 const pending=[];
 for(const state of states)for(const part of state.parts){
  if(!hangul.test(part.text)){part.result=part.text;continue;}
  const key=lang+'\u0000'+part.text;
  if(cache.has(key))part.result=cache.get(key);else pending.push(part);
 }
 const groups=[];let group=[],length=0;
 for(const part of pending){
  if(group.length===8||length+part.text.length>3000){groups.push(group);group=[];length=0;}
  group.push(part);length+=part.text.length;
 }
 if(group.length)groups.push(group);
 let failed=false;
 let position=0;
 await Promise.all([0,1].map(async()=>{
  while(position<groups.length&&stamp===revision){
   const batch=groups[position++];
   try{await translate(batch,lang);}catch(error){console.warn('Translation:',error);failed=true;break;}
  }
 }));
 if(stamp===revision){
  observer.disconnect();
  for(const state of states){
   if(!connected(state.entry))continue;
   if(state.parts.some(p=>p.result===null)){failed=true;continue;}
   const value=state.saved!==undefined?state.saved:state.parts.map(p=>p.result).join(' ');
   const lead=state.entry.original.match(/^\s*/)?.[0]||'';
   const tail=state.entry.original.match(/\s*$/)?.[0]||'';
   state.entry.results.set(lang,value);
   state.entry.write(lead+value+tail);
   state.entry.applied=lang;
  }
  document.documentElement.lang=lang;
  status.textContent=failed?(lang==='es'?'Algunos textos no se pudieron traducir':'Some text could not be translated'):messages[lang];
  observe();
 }
 working=false;
 if(rerun||stamp!==revision){rerun=false;if(language!=='ko')void process();}
}
function switchLanguage(value,persist=true){
 language=codes.has(value)?value:'ko';revision++;rerun=true;
 select.value=language;
 if(persist)try{localStorage.setItem('hkpc-language-v1',language);}catch{}
 if(scheduled!==null){clearTimeout(scheduled);scheduled=null;}
 restore();
 document.documentElement.lang=language==='ko'?originalLang:language;
 if(language==='ko'){status.textContent=messages.ko;rerun=false;return;}
 void process();
}
if(hangul.test(originalTitle))add(null,null,originalTitle,v=>{document.title=v;});
observe();
select.addEventListener('change',()=>switchLanguage(select.value));
let preferred='ko';try{preferred=localStorage.getItem('hkpc-language-v1')||'ko';}catch{}
switchLanguage(preferred,false);
})();
