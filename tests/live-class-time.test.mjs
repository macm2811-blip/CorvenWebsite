import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sessionStartIso,localDateTimeInput} from '../src/lib/lms/live-class-time.ts';
test('class time keeps the same instant when reopened and saved in the device time zone',()=>{
 const previous=process.env.TZ;
 try{
  for(const zone of ['America/Costa_Rica','UTC','America/New_York']){
   process.env.TZ=zone;
   const instant='2026-11-15T16:30:00.000Z';
   assert.equal(sessionStartIso(localDateTimeInput(instant)),instant,zone);
  }
  process.env.TZ='America/Costa_Rica';
  assert.equal(sessionStartIso('2026-11-15T10:30'),'2026-11-15T16:30:00.000Z');
 }finally{if(previous===undefined)delete process.env.TZ;else process.env.TZ=previous;}
});
test('missing or invalid class dates are rejected',()=>{
 for(const value of ['', 'invalid'])assert.throws(()=>sessionStartIso(value));
 assert.throws(()=>localDateTimeInput('invalid'));
});
