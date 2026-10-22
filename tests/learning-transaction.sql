-- Integration checks run in one transaction. Every fixture is rolled back.
begin;
do $$
declare
  student uuid:=gen_random_uuid(); academy uuid:=gen_random_uuid();
  course uuid:=gen_random_uuid(); module uuid:=gen_random_uuid();
  lesson uuid:=gen_random_uuid(); quiz uuid:=gen_random_uuid(); question uuid:=gen_random_uuid();
  result jsonb; blocked boolean:=false; visible integer;
begin
  insert into auth.users(id,email) values(student,'integration-'||student::text||'@example.invalid');
  insert into public.organizations(id,name,slug) values(academy,'Transactional verification','verification-'||academy::text);
  insert into public.memberships(organization_id,profile_id,role,access_status) values(academy,student,'student','active');
  insert into public.courses(id,organization_id,title,slug,status) values(course,academy,'Verification course','verification','published');
  insert into public.modules(id,course_id,title) values(module,course,'Verification module');
  insert into public.lessons(id,module_id,title,content_type,body) values(lesson,module,'Verification lesson','text','Content');
  insert into public.enrollments(organization_id,course_id,student_id) values(academy,course,student);
  insert into public.quizzes(id,course_id,title,max_attempts) values(quiz,course,'Verification quiz',1);
  insert into public.quiz_questions(id,quiz_id,prompt,options,correct_answer) values(question,quiz,'Choose B','["A","B"]','"B"');
  result:=public.record_learning(student,course,lesson,null,'{}');
  if (result->>'progress')::int<>50 then raise exception 'Completion percentage failed'; end if;
  result:=public.record_learning(student,course,null,quiz,jsonb_build_object(question::text,'B'));
  if (result->>'score')::numeric<>100 or (result->>'progress')::int<>100 or not(result->>'passed')::boolean then raise exception 'Server grading failed'; end if;
  begin
    perform public.record_learning(student,course,null,quiz,jsonb_build_object(question::text,'B'));
  exception when raise_exception then blocked:=true; end;
  if not blocked then raise exception 'Attempt limit was bypassed'; end if;
  if has_function_privilege('authenticated','public.record_learning(uuid,uuid,uuid,uuid,jsonb)','execute') then raise exception 'Student can invoke privileged grading directly'; end if;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',student,'role','authenticated')::text,true);
  set local role authenticated;
  select count(*) into visible from public.quiz_questions where id=question;
  if visible<>0 then raise exception 'Correct answer is exposed through RLS'; end if;
  select count(*) into visible from public.courses where id=course;
  if visible<>1 then raise exception 'Published enrollment is not visible'; end if;
  reset role;
  update public.courses set status='draft' where id=course;
  set local role authenticated;
  select count(*) into visible from public.courses where id=course;
  if visible<>0 then raise exception 'Draft course is exposed'; end if;
  reset role;
  update public.courses set status='published' where id=course;
  update public.memberships set access_status='suspended' where organization_id=academy and profile_id=student;
  blocked:=false;
  begin
    perform public.record_learning(student,course,lesson,null,'{}');
  exception when raise_exception then blocked:=true; end;
  if not blocked then raise exception 'Suspended membership can submit progress'; end if;
end;
$$;
select 'PASS: persisted completion, server grading, attempt limit, RLS answers, draft isolation, suspended access' as verification;
rollback;
