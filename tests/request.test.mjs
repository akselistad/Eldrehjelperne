import test from 'node:test';
import assert from 'node:assert/strict';
import {validateRequest, completeDemo} from '../nettside/request-model.mjs';
const valid = {service:'besok',name:'Eksempel Person',method:'telefon',contact:'+47 450 17 140',note:''};
test('service must be one of the offered options', () => {
  assert.ok(validateRequest({...valid,service:'other'},0).service);
  assert.deepEqual(validateRequest({...valid,service:'usikker'},0),{});
});
test('contact fields must contain a name and a usable phone number', () => {
  assert.deepEqual(validateRequest(valid,1),{});
  assert.ok(validateRequest({...valid,name:'  '},1).name);
  assert.ok(validateRequest({...valid,contact:'123'},1).contact);
  assert.ok(validateRequest({...valid,contact:'call me maybe 45017140'},1).contact);
});
test('email validation uses the chosen contact method', () => {
  assert.deepEqual(validateRequest({...valid,method:'epost',contact:'demo@example.no'},1),{});
  assert.ok(validateRequest({...valid,method:'epost'},1).contact);
  assert.ok(validateRequest({...valid,method:'unknown'},1).contact);
});
test('review revalidates all fields and limits free text', () => {
  assert.ok(validateRequest({...valid,service:'',note:'a'.repeat(501)},2).service);
  assert.ok(validateRequest({...valid,note:'a'.repeat(501)},2).note);
});
test('demo completion never claims delivery or a booking', async () => {
  assert.deepEqual(await completeDemo({delay:0}),{mode:'demo',sent:false,booked:false});
});
test('offline demo has a recoverable failed outcome', async () => {
  await assert.rejects(completeDemo({online:false,delay:0}),/offline/);
  assert.equal((await completeDemo({online:true,delay:0})).sent,false);
});
