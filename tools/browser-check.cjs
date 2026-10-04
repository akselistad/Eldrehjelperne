const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const output=path.resolve(__dirname,'../qa');fs.mkdirSync(output,{recursive:true});
const base=process.env.BASE_URL || 'http://127.0.0.1:4173';
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const failures=[];page.on('response',r=>{if(r.status()>=400)failures.push(`${r.status()} ${r.url()}`)});
  const results=[];
  for(const width of [320,390,768,1024,1440]){
    await page.setViewportSize({width,height:900});
    for(const name of ['index','om-oss','kontakt','prosjekt','personvern']){
      await page.goto(`${base}/${name}.html`);await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(async image=>{image.loading='eager';try{await image.decode()}catch{}}));});
      const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,brokenImages:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src),h1:document.querySelectorAll('h1').length}));
      assert.equal(result.overflow,false,`${name} overflow at ${width}`);assert.deepEqual(result.brokenImages,[]);assert.equal(result.h1,1);
      results.push({page:name,width,...result});
      if([390,1440].includes(width)) await page.screenshot({path:path.join(output,`${name}-${width}.png`),fullPage:true});
    }
  }
  await page.setViewportSize({width:390,height:844});await page.goto(base);
  const menu=page.getByRole('button',{name:'Meny'});assert.equal(await menu.getAttribute('aria-expanded'),'false');
  await menu.click();assert.equal(await menu.getAttribute('aria-expanded'),'true');
  await page.keyboard.press('Escape');assert.equal(await menu.getAttribute('aria-expanded'),'false');assert.equal(await menu.evaluate(el=>el===document.activeElement),true);
  await menu.click();await page.getByRole('navigation').getByRole('link',{name:'Om oss',exact:true}).click();await page.waitForURL('**/om-oss.html');
  await page.goto(`${base}/kontakt.html?tjeneste=folge`);
  assert.equal(await page.locator('input[value=folge]').isChecked(),true);
  await page.locator('#next-button').click();assert.equal(await page.locator('[data-step="1"]').isVisible(),true);
  await page.locator('#next-button').click();assert.equal(await page.locator('#name').getAttribute('aria-invalid'),'true');
  await page.locator('#name').fill('Eksempel Person');await page.locator('#contact').fill('450 17 140');
  await page.locator('#method').selectOption('epost');await page.locator('#contact').fill('demo@example.no');
  await page.locator('#method').selectOption('telefon');assert.equal(await page.locator('#contact').inputValue(),'450 17 140');
  await page.locator('#method').selectOption('epost');assert.equal(await page.locator('#contact').inputValue(),'demo@example.no');
  await page.locator('#note').fill('<img src=x onerror=alert(1)>');await page.locator('#next-button').click();
  assert.ok((await page.locator('#request-summary').innerText()).includes('<img src=x onerror=alert(1)>'));
  assert.equal(await page.locator('#request-summary img').count(),0);
  await page.getByRole('button',{name:'Endre ønske',exact:true}).click();await page.locator('input[value=besok]').check();
  await page.locator('#next-button').click();assert.equal(await page.locator('#name').inputValue(),'Eksempel Person');
  await page.locator('#next-button').click();assert.ok((await page.locator('#request-summary').innerText()).includes('Besøksvenn'));
  await context.setOffline(true);await page.locator('#next-button').click();await page.waitForTimeout(800);
  assert.equal(await page.locator('#form-errors').isVisible(),true);assert.equal(await page.locator('#request-success').isVisible(),false);
  await context.setOffline(false);await page.locator('#next-button').click();assert.equal(await page.locator('#next-button').isDisabled(),true);
  await page.waitForTimeout(800);assert.equal(await page.locator('#request-success').isVisible(),true);
  assert.ok((await page.locator('#request-success').innerText()).includes('Ingenting ble sendt'));
  await page.screenshot({path:path.join(output,'request-success.png'),fullPage:true});
  await page.locator('#restart-button').click();assert.equal(await page.locator('#name').inputValue(),'');
  assert.equal(await page.locator('input[value=besok]').isChecked(),false);
  await page.locator('#next-button').click();assert.equal(await page.locator('#service-error').isVisible(),true);
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const plain=await nojs.newPage();await plain.goto(base);assert.equal(await plain.getByRole('navigation').isVisible(),true);
  await plain.goto(`${base}/kontakt.html`);await plain.screenshot({path:path.join(output,'nojs-contact.png'),fullPage:true});assert.equal(await plain.locator('noscript p').isVisible(),true);
  assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({date:new Date().toISOString(),browser:browser.version(),viewports:results,checks:['mobile menu and Escape focus','service preselection','field validation','contact-method value preservation','safe summary rendering','edit and back value preservation','offline retry','pending state','honest demo success','reset','no-JavaScript navigation and contact fallback'],errors,failures},null,2));
  console.log(`Passed ${results.length} page/viewport checks and all request/menu/fallback checks. Browser ${browser.version()}`);
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
