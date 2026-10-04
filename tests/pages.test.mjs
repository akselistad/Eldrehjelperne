import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../nettside');
const pages=fs.readdirSync(root).filter(name=>name.endsWith('.html'));
for(const name of pages) {
  test(`${name}: local assets, destinations, and anchors exist`,()=>{
    const content=fs.readFileSync(path.join(root,name),'utf8');
    assert.equal((content.match(/<h1\b/g)||[]).length,1);
    assert.ok(content.includes('lang="nb"'));
    assert.ok(!/Lorem ipsum/i.test(content));
    for(const match of content.matchAll(/(?:href|src)="([^" ]+)"/g)) {
      const target=match[1]; if(/^(https?:|mailto:|tel:)/.test(target)) continue;
      const [url,anchor]=target.split('#');
      const file=path.join(root,url.split('?')[0]||name);
      assert.ok(fs.existsSync(file),`${name} references missing ${target}`);
      if(anchor) assert.ok(fs.readFileSync(file,'utf8').includes(`id="${anchor}"`),`missing anchor ${target}`);
    }
  });
}
test('only the locked palette is used as CSS colours',()=>{
  const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
  const allowed=new Set(['#00c4d7','#173753','#00f0ff','#1b4353','#fff']);
  for(const match of css.matchAll(/#[\da-f]{3,8}\b/gi)) assert.ok(allowed.has(match[0].toLowerCase()),`unexpected colour ${match[0]}`);
});
