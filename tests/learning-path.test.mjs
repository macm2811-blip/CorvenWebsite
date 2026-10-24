import {test} from "node:test";
import assert from "node:assert/strict";
import {CEFR_LEVELS,journeyProgress} from "../src/lib/lms/learning-path.ts";
test("completing A1 represents one fifth of the complete A1–C1 journey",()=>{
 assert.deepEqual(journeyProgress([{id:"1",level:"A1"}],[{course:{id:"1"},percentage:100}]),[100,0,0,0,0]);
});
test("unassigned courses count toward the level and missing levels stay incomplete",()=>{
 assert.deepEqual(journeyProgress([{id:"1",level:"A1"},{id:"2",level:"A1"}],[{course:{id:"1"},percentage:100}]),[50,0,0,0,0]);
});
test("the full journey reaches 100 only after completing all five levels",()=>{
 const catalog=CEFR_LEVELS.map(level=>({id:level,level}));
 const values=journeyProgress(catalog,catalog.map(c=>({course:{id:c.id},percentage:100})));
 assert.equal(values.reduce((a,b)=>a+b,0)/5,100);
});
