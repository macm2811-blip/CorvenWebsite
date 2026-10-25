import {test} from "node:test";
import assert from "node:assert/strict";
import {STUDENT_PLANS,validStudentPlan} from "../src/lib/lms/student-plans.ts";
test("standard weekly plans and custom plans are accepted",()=>{for(const plan of [...STUDENT_PLANS,"Conversation · 3 sessions / week"])assert.equal(validStudentPlan(plan),true);});
test("empty or oversized custom plans are rejected",()=>{for(const plan of ["","   ","x".repeat(121)])assert.equal(validStudentPlan(plan),false);});
