begin;
do $$
declare org uuid;student uuid;staff uuid;c uuid:=gen_random_uuid();m uuid:=gen_random_uuid();l uuid:=gen_random_uuid();qid uuid;q1 uuid:=gen_random_uuid();q2 uuid:=gen_random_uuid();q3 uuid:=gen_random_uuid();a uuid;r uuid:=gen_random_uuid();result jsonb;payment uuid;blocked boolean:=false;
begin
 select id into org from public.organizations where slug='level-up';
 select profile_id into student from public.memberships where organization_id=org and role='student' and access_status='active' limit 1;
 select profile_id into staff from public.memberships where organization_id=org and role='academy_admin' and access_status='active' limit 1;
 if student is null or staff is null then raise exception 'Active test actors required.';end if;
 insert into public.courses(id,organization_id,created_by,title,slug,level,status) values(c,org,staff,'Transactional regression unit',c::text,'A1','published');
 insert into public.modules(id,course_id,title,position) values(m,c,'Test pages',1);
 insert into public.lessons(id,module_id,title,content_type,position) values(l,m,'Test page','text',1);
 insert into public.enrollments(organization_id,student_id,course_id) values(org,student,c);
 qid:=public.save_course_assessment(staff,org,c,null,jsonb_build_object('title','Mixed assessment','description','Regression test','assessment_type','quiz','passing_score',80,'max_attempts',2,'position',2,'module_id',m,'content_config','{}'::jsonb),
 jsonb_build_array(jsonb_build_object('id',q1,'prompt','Choose the correct answer','questionType','single_choice','options',jsonb_build_array('A','B'),'correctAnswer','A'),jsonb_build_object('id',q2,'prompt','Complete the phrase','questionType','short_answer','options','[]'::jsonb,'correctAnswer','Hello'),jsonb_build_object('id',q3,'prompt','Write your explanation','questionType','essay','options','[]'::jsonb,'correctAnswer','')));
 result:=public.record_learning(student,c,l,null,'{}');
 if (result->>'progress')::integer<>50 then raise exception 'Page progress failed';end if;
 result:=public.record_learning(student,c,null,qid,jsonb_build_object(q1::text,'A',q2::text,' hello ',q3::text,'My response'));
 if not(result->>'pendingReview')::boolean or result->>'score' is not null or (result->>'passed')::boolean then raise exception 'Open answer must await instructor review';end if;
 select id into a from public.quiz_attempts where quiz_id=qid and student_id=student;
 if exists(select 1 from public.quiz_attempts where id=a and question_snapshot::text like '%correctAnswer%') then raise exception 'Answer key exposed in snapshot';end if;
 begin perform public.review_learning_attempt(student,a,jsonb_build_object(q3::text,1),'Unauthorized');exception when others then blocked:=true;end;
 if not blocked then raise exception 'Student was allowed to grade';end if;
 perform public.review_learning_attempt(staff,a,jsonb_build_object(q3::text,1),'Good work');
 if not exists(select 1 from public.quiz_attempts where id=a and score=100 and passed and review_state='graded') then raise exception 'Final assessment grade incorrect';end if;
 if not exists(select 1 from public.enrollments where course_id=c and student_id=student and progress=100) then raise exception 'Completion not recomputed after review';end if;
 insert into public.payment_reports(id,organization_id,student_id,amount,requested_due_date,receipt_path) values(r,org,student,100,'2026-10-15','transaction-test/receipt.png');
 blocked:=false;begin perform public.review_payment_report(student,r,true,'2026-10-15','2026-11-14','Unauthorized');exception when others then blocked:=true;end;
 if not blocked then raise exception 'Student was allowed to approve payment';end if;
 payment:=public.review_payment_report(staff,r,true,'2026-10-15','2026-11-14','Verified test');
 if not exists(select 1 from public.payments where id=payment and status='paid' and coverage_end='2026-11-14') then raise exception 'Payment coverage not stored';end if;
 blocked:=false;begin perform public.review_payment_report(staff,r,true,'2026-10-15','2026-11-14','Duplicate');exception when others then blocked:=true;end;
 if not blocked then raise exception 'Payment approval is not idempotent';end if;
 if has_function_privilege('authenticated','public.review_payment_report(uuid,uuid,boolean,date,date,text)','EXECUTE') or has_function_privilege('anon','public.record_learning(uuid,uuid,uuid,uuid,jsonb)','EXECUTE') then raise exception 'Sensitive RPC exposed';end if;
 if exists(select 1 from storage.buckets where id='learning-private' and public) then raise exception 'Private uploads are publicly exposed';end if;
 raise notice 'PASS: mixed quiz, manual review, progress, tenant actor checks, payment approval and private storage.';
end;$$;
rollback;
