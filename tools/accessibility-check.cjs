const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const b=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{})});
 const p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 const report=[];
 for(const name of ['index','om-oss','kontakt','prosjekt','personvern']){
  await p.goto(`http://127.0.0.1:4173/${name}.html`);await p.evaluate(()=>document.fonts.ready);
  const checks=await p.evaluate(()=>{
   const visible=el=>el.getBoundingClientRect().width>0&&el.getBoundingClientRect().height>0;
   const controls=[...document.querySelectorAll('input,select,textarea')].filter(visible);
   const unlabelled=controls.filter(el=>!el.labels?.length&&!el.getAttribute('aria-label')).map(el=>el.id);
   const reduced=!!document.querySelector('.reveal-enter');
   const colors={};for(const key of ['turquoise','navy','electric','charcoal','white'])colors[key]=getComputedStyle(document.documentElement).getPropertyValue('--'+key).trim();
   return {unlabelled,reduced,colors};
  });
  assert.deepEqual(checks.unlabelled,[]);assert.equal(checks.reduced,false);
  // Emulate the reflow width corresponding to a 1440px viewport at 400% zoom.
  await p.setViewportSize({width:360,height:800});
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${name} reflow`);
  // Double text while retaining the mobile viewport to stress content-driven sizing.
  await p.evaluate(()=>{for(const el of document.querySelectorAll('h1,h2,h3,p,a,button,label,legend,span,summary,li,dt,dd,input,select,textarea')){if(!el.children.length){const px=parseFloat(getComputedStyle(el).fontSize);el.style.fontSize=px*2+'px'}}});
  const overflow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  assert.equal(overflow,false,`${name} enlarged text overflow`);
  report.push({page:name,checks,reflowPassed:true,doubleTextOverflow:overflow});
  await p.setViewportSize({width:1440,height:900});
 }
 await p.goto('http://127.0.0.1:4173/');await p.keyboard.press('Tab');assert.equal(await p.locator('.skip-link').evaluate(el=>el===document.activeElement),true);
 await p.keyboard.press('Enter');assert.equal(await p.evaluate(()=>location.hash),'#innhold');
 await p.locator('details').first().locator('summary').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('details').first().getAttribute('open'),'');
 fs.writeFileSync('qa/accessibility.json',JSON.stringify({checks:report,keyboard:['skip link','FAQ disclosure'],limitations:['No screen-reader user test or full WCAG audit','Reflow emulates viewport width rather than browser UI zoom']},null,2));
 console.log(JSON.stringify(report.map(x=>({page:x.page,reflow:x.reflowPassed,doubleTextOverflow:x.doubleTextOverflow})),null,2));await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
