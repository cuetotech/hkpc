import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));

function globMatches(pattern, path) {
  const escaped = pattern.split('*')
    .map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  return new RegExp('^' + escaped + '$').test(path);
}

function runsWorkerFirst(path) {
  const patterns = config.assets.run_worker_first;
  assert.ok(Array.isArray(patterns), 'Do not route every image, font, and stylesheet through the Worker');
  return patterns.some(pattern => !pattern.startsWith('!') && globMatches(pattern, path))
    && !patterns.some(pattern => pattern.startsWith('!') && globMatches(pattern.slice(1), path));
}

test('homepage and all canonical main-page URLs invoke the translation Worker', () => {
  const pages = [
    '/',
    '/main/main.html',
    '/main/main',
    '/main/sub__pageCode-1.html',
    '/main/sub__pageCode-1',
    '/main/sub__pageCode-6',
    '/main/sub__pageCode-13',
    '/main/sub__q-f8b3569104',
    '/main/sub__Mode-view__boardID-www13__num-609',
  ];
  for (const page of pages) {
    assert.equal(runsWorkerFirst(page), true, page + ' must receive the language selector');
  }
});

test('deep .html paths and the translation API continue through the Worker', () => {
  for (const page of ['/core/module/personal_info/main/personal.html', '/api/translate']) {
    assert.equal(runsWorkerFirst(page), true, page);
  }
});

test('CSS, JS, fonts, and images stay asset-first', () => {
  for (const path of [
    '/core/design/responsive019/css/main.css',
    '/core/design/responsive019/script/menu.js',
    '/user/saveDir/design/responsive019/responsive019_logo_0.png',
    '/i18n/language.js',
    '/i18n/language.css',
  ]) {
    assert.equal(runsWorkerFirst(path), false, path);
  }
});

test('production and preview bindings remain separate', () => {
  assert.equal(config.name, 'hkpc');
  assert.equal(config.assets.binding, 'ASSETS');
  assert.equal(config.previews.ai.binding, config.ai.binding);
  assert.notEqual(config.previews.ratelimits[0].namespace_id, config.ratelimits[0].namespace_id);
});
