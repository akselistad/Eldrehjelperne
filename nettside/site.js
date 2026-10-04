import { serviceNames, validateRequest, completeDemo } from './request-model.mjs';

const header = document.querySelector('.site-header');
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
if (header && menu && nav) {
  menu.hidden = false;
  header.classList.add('nav-enhanced');
  function closeMenu(returnFocus = false) {
    header.classList.remove('menu-open'); menu.setAttribute('aria-expanded','false');
    if (returnFocus) menu.focus();
  }
  menu.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open'); menu.setAttribute('aria-expanded',String(open));
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && header.classList.contains('menu-open')) closeMenu(true); });
  document.addEventListener('click', event => { if (!header.contains(event.target)) closeMenu(); });
  matchMedia('(min-width:781px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.remove('reveal-enter'); observer.unobserve(entry.target); }
    });
  }, {threshold:0.08});
  document.querySelectorAll('[data-reveal]').forEach(element => {
    // Never hide content that is already in view, or an element taller than the viewport.
    if (element.getBoundingClientRect().top > innerHeight && element.offsetHeight < innerHeight) {
      element.classList.add('reveal-ready','reveal-enter'); observer.observe(element);
    }
  });
  reducedMotion.addEventListener('change', event => {
    if (event.matches) { document.querySelectorAll('.reveal-enter').forEach(el => el.classList.remove('reveal-enter')); observer.disconnect(); }
  });
  document.addEventListener('focusin', event => event.target.closest('.reveal-enter')?.classList.remove('reveal-enter'));
}

const app = document.querySelector('#request-app');
if (app) {
  const form = document.querySelector('#request-form');
  const fields = [...form.querySelectorAll('[data-step]')];
  const markers = [...app.querySelectorAll('[data-step-marker]')];
  const next = document.querySelector('#next-button');
  const back = document.querySelector('#back-button');
  const summary = document.querySelector('#request-summary');
  const errorsBox = document.querySelector('#form-errors');
  const status = document.querySelector('#request-status');
  const method = document.querySelector('#method');
  const contact = document.querySelector('#contact');
  const success = document.querySelector('#request-success');
  let step = 0;
  let submitting = false;
  app.hidden = false;

  function data() {
    return Object.fromEntries(new FormData(form));
  }
  function clearErrors() {
    errorsBox.hidden = true; errorsBox.replaceChildren();
    form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    form.querySelectorAll('.field-error').forEach(el => { el.hidden = true; el.textContent = ''; });
  }
  function renderSummary() {
    const values = data(); summary.replaceChildren();
    const rows = [['Tjeneste',serviceNames[values.service]],['Navn',values.name.trim()], [values.method==='epost'?'E-post':'Telefon',values.contact.trim()],['Ditt ønske',values.note.trim() || 'Ingen ekstra beskrivelse']];
    for (const [label,value] of rows) {
      const row = document.createElement('div'); row.className = 'summary-row';
      const dt = document.createElement('dt'); dt.textContent = label;
      const dd = document.createElement('dd'); dd.textContent = value;
      row.append(dt,dd); summary.append(row);
    }
  }
  function showStep(newStep, focus = true) {
    clearErrors(); step = newStep; status.textContent = '';
    fields.forEach((field,index) => { field.hidden = index !== step; });
    markers.forEach((marker,index) => { if(index === step) marker.setAttribute('aria-current','step'); else marker.removeAttribute('aria-current'); });
    back.hidden = step === 0;
    next.replaceChildren(document.createTextNode(step === 2 ? 'Fullfør demo' : 'Neste →'));
    if (step === 2) renderSummary();
    if (focus) document.querySelector(`#step-title-${step}`).focus();
  }
  function showErrors(errors) {
    clearErrors(); errorsBox.hidden = false;
    const title = document.createElement('strong'); title.textContent = 'Se over opplysningene'; errorsBox.append(title);
    for (const [key,message] of Object.entries(errors)) {
      const p = document.createElement('p'); p.textContent = message; errorsBox.append(p);
      const fieldError = document.querySelector(`#${key}-error`);
      if(fieldError) { fieldError.textContent = message; fieldError.hidden = false; }
      if(key==='service') form.querySelectorAll('[name=service]').forEach(el => {el.setAttribute('aria-invalid','true');el.setAttribute('aria-describedby','service-error');});
      else form.elements[key]?.setAttribute('aria-invalid','true');
    }
    const key = Object.keys(errors)[0];
    (key === 'service' ? form.querySelector('[name=service]') : form.elements[key])?.focus();
  }
  function updateMethod() {
    const email = method.value === 'epost';
    document.querySelector('#contact-label').textContent = email ? 'E-postadresse' : 'Telefonnummer';
    contact.type = email ? 'email' : 'tel'; contact.autocomplete = email ? 'email' : 'tel';
    // Separate values allow switching between methods without silently losing either one.
  }
  const contactValues = {telefon:'',epost:''};
  let previousMethod = method.value;
  method.addEventListener('change', () => {
    contactValues[previousMethod] = contact.value;
    previousMethod = method.value; contact.value = contactValues[previousMethod]; updateMethod(); clearErrors();
  });
  back.addEventListener('click', () => { if(!submitting) showStep(Math.max(0,step-1)); });
  app.querySelectorAll('[data-edit]').forEach(button => button.addEventListener('click', () => { if(!submitting) showStep(Number(button.dataset.edit)); }));
  form.addEventListener('submit', async event => {
    event.preventDefault(); if(submitting) return;
    const errors = validateRequest(data(),step);
    if(Object.keys(errors).length) { showErrors(errors); return; }
    if(step < 2) { showStep(step+1); return; }
    submitting = true; clearErrors(); next.disabled = true; back.disabled = true;
    app.querySelectorAll('[data-edit]').forEach(button => {button.disabled=true;});
    status.textContent = 'Fullfører demoen … Ingen opplysninger sendes.'; next.textContent = 'Et øyeblikk …'; form.setAttribute('aria-busy','true');
    try {
      await completeDemo({online:navigator.onLine});
      form.hidden = true; app.querySelector('.stepper').hidden = true; success.hidden = false;
      success.querySelector('h2').focus();
    } catch {
      errorsBox.hidden = false; errorsBox.textContent = 'Demoen kunne ikke fullføres mens du er frakoblet. Koble til igjen og prøv på nytt. Opplysningene dine er fortsatt her.';
      status.textContent = ''; next.focus();
    } finally {
      submitting = false; next.disabled = false; back.disabled = false; next.textContent = 'Fullfør demo'; form.removeAttribute('aria-busy');
      app.querySelectorAll('[data-edit]').forEach(button => {button.disabled=false;});
    }
  });
  document.querySelector('#restart-button').addEventListener('click', () => {
    form.reset(); contactValues.telefon=''; contactValues.epost=''; previousMethod=method.value; updateMethod(); success.hidden = true; form.hidden = false; app.querySelector('.stepper').hidden = false; showStep(0);
  });
  const preselected = new URLSearchParams(location.search).get('tjeneste');
  if(Object.hasOwn(serviceNames,preselected)) { form.querySelector(`input[value="${preselected}"]`).checked = true; }
  showStep(0,false);
}
