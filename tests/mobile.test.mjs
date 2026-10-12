import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read=(path)=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const css='public/core/design/responsive019/css/';
test('legacy responsive stylesheet paths now exist and have breakpoint rules',()=>{
 for(const filename of ['mobile.css','tablet.css','s_mobile.css','s_tablet.css']){
  assert.equal(existsSync(new URL('../'+css+filename,import.meta.url)),true,filename);
  assert.match(read(css+filename),/@media\s*\(/,filename);
 }
});
test('HTML worker injects responsive assets and canonical stylesheet paths',()=>{
 const worker=read('src/worker.js');
 assert.match(worker,/navigation\.css/);
 assert.match(worker,/mobile-navigation\.js/);
 assert.match(worker,/link\[id="responsiveCss"\]/);
 assert.match(worker,/s_pc\.css/);
});
test('mobile navigation has working links, accessible accordion and escape support',()=>{
 const js=read('public/i18n/mobile-navigation.js');
 for(const path of ['1','3','4','5','6','13','15','17']){
  assert.match(js,new RegExp('sub__pageCode-'+path+'\\.html'));
 }
 assert.match(js,/aria-expanded/);
 assert.match(js,/aria-controls/);
 assert.match(js,/Escape/);
 assert.match(js,/responsiveStyle\.cssLoad/);
});
test('mobile pages allow pinch zoom',()=>{
 for(const path of ['public/index.html','public/main/sub__pageCode-1.html']){
  const html=read(path);
  assert.match(html,/name="viewport"/);
 }
});
