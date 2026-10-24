-- Additive changes: preserve current enrollments, content, attempts and payment records.
alter table public.memberships add column if not exists group_name text not null default '';
alter table public.memberships add column if not exists plan_name text not null default '';
alter table public.quizzes add column if not exists module_id uuid references public.modules(id);
alter table public.live_sessions add column if not exists lesson_id uuid references public.lessons(id);
alter table public.quiz_questions drop constraint quiz_questions_question_type_check;
alter table public.quiz_questions add constraint quiz_questions_question_type_check check(question_type in ('single_choice','multiple_choice','true_false','short_answer','essay'));
alter table public.quiz_attempts add column if not exists review_state text not null default 'graded' check(review_state in ('graded','pending_review'));
alter table public.quiz_attempts add column if not exists automatic_points integer not null default 0;
alter table public.quiz_attempts add column if not exists question_snapshot jsonb not null default '[]';
alter table public.quiz_attempts add column if not exists essay_marks jsonb not null default '{}';
alter table public.quiz_attempts add column if not exists feedback text not null default '';
alter table public.quiz_attempts add column if not exists reviewed_by uuid references public.profiles(id);
alter table public.payments add column if not exists coverage_start date;
alter table public.payments add column if not exists coverage_end date;
create table public.payment_reports (
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),student_id uuid not null references public.profiles(id),
 amount numeric(12,2) not null check(amount>0),requested_due_date date not null,receipt_path text not null,
 status text not null default 'pending' check(status in ('pending','approved','rejected')),created_at timestamptz not null default now(),
 reviewed_by uuid references public.profiles(id),reviewed_at timestamptz,review_note text not null default '',payment_id uuid unique references public.payments(id)
);
create index payment_reports_org_status on public.payment_reports(organization_id,status,created_at);
create index payment_reports_student on public.payment_reports(student_id);
create table public.assignment_submissions (
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),lesson_id uuid not null references public.lessons(id),student_id uuid not null references public.profiles(id),
 body text not null check(length(body) between 1 and 12000),attachment_path text,submitted_at timestamptz not null default now(),
 status text not null default 'submitted' check(status in ('submitted','reviewed')),grade numeric check(grade between 0 and 100),feedback text not null default '',reviewed_by uuid references public.profiles(id),
 unique(lesson_id,student_id)
);
create index assignment_submissions_org on public.assignment_submissions(organization_id,status);
create index assignment_submissions_student on public.assignment_submissions(student_id);
create table public.referrals (
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),referrer_id uuid not null references public.profiles(id),
 name text not null,phone text not null default '',email text not null,created_at timestamptz not null default now(),matched_student_id uuid references public.profiles(id),
 unique(organization_id,email)
);
create index referrals_referrer on public.referrals(referrer_id);
create table public.learning_certificates (
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),student_id uuid not null references public.profiles(id),course_id uuid not null references public.courses(id),
 student_name text not null,course_title text not null,score numeric,issued_at timestamptz not null default now(),unique(student_id,course_id)
);
create index learning_certificates_org on public.learning_certificates(organization_id);
create index learning_certificates_course on public.learning_certificates(course_id);
create table public.academy_settings (
 organization_id uuid primary key references public.organizations(id),onedrive_folder_url text not null default '',referral_email_subject text not null default 'Welcome to Level Up Academy',
 referral_email_body text not null default 'A friend recommended Level Up Academy. Contact our academy to learn about our English courses.'
);
create table public.platform_email_outbox (
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations(id),referral_id uuid unique references public.referrals(id),recipient text not null,
 subject text not null,body text not null,status text not null default 'queued' check(status in ('queued','sent','failed')),created_at timestamptz not null default now(),sent_at timestamptz,error text
);
create index platform_email_outbox_pending on public.platform_email_outbox(status,created_at);

alter table public.payment_reports enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.referrals enable row level security;
alter table public.learning_certificates enable row level security;
alter table public.academy_settings enable row level security;
alter table public.platform_email_outbox enable row level security;
revoke all on public.payment_reports,public.assignment_submissions,public.referrals,public.learning_certificates,public.academy_settings from anon,authenticated;
grant select on public.payment_reports,public.assignment_submissions,public.referrals,public.learning_certificates,public.academy_settings to authenticated;
revoke all on public.platform_email_outbox from anon,authenticated;
grant all on public.payment_reports,public.assignment_submissions,public.referrals,public.learning_certificates,public.academy_settings,public.platform_email_outbox to service_role;
create policy payment_reports_read on public.payment_reports for select to authenticated using ((student_id=(select auth.uid()) and public.is_org_member(organization_id)) or public.is_org_staff(organization_id));
create policy assignment_submissions_read on public.assignment_submissions for select to authenticated using ((student_id=(select auth.uid()) and public.is_org_member(organization_id)) or public.is_org_staff(organization_id));
create policy referrals_read on public.referrals for select to authenticated using ((referrer_id=(select auth.uid()) and public.is_org_member(organization_id)) or public.is_org_staff(organization_id));
create policy certificates_read on public.learning_certificates for select to authenticated using ((student_id=(select auth.uid()) and public.is_org_member(organization_id)) or public.is_org_staff(organization_id));
create policy academy_settings_read on public.academy_settings for select to authenticated using (public.is_org_staff(organization_id));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('learning-private','learning-private',false,3145728,array['image/png','image/jpeg','image/webp','application/pdf']) on conflict(id) do nothing;
-- Private files have no client policies. Every upload/read is authorized by a server action.

create or replace function public.recompute_learning_progress(p_student uuid,p_course uuid) returns integer language plpgsql security invoker set search_path='' as $$
declare total integer;done integer;pct integer; eid uuid;
begin
 select id into eid from public.enrollments where student_id=p_student and course_id=p_course and status<>'cancelled' for update;
 if not found then raise exception 'Enrollment unavailable';end if;
 select count(*) into total from public.lessons l join public.modules m on m.id=l.module_id where m.course_id=p_course;
 select count(*) into done from public.lesson_progress lp join public.lessons l on l.id=lp.lesson_id join public.modules m on m.id=l.module_id where lp.enrollment_id=eid and lp.completed and m.course_id=p_course;
 total:=total+(select count(*) from public.quizzes where course_id=p_course);
 done:=done+(select count(*) from public.quizzes q where q.course_id=p_course and exists(select 1 from public.quiz_attempts a where a.quiz_id=q.id and a.student_id=p_student and a.passed and a.review_state='graded'));
 pct:=case when total=0 then 0 else floor(done*100.0/total)::integer end;
 update public.enrollments set progress=pct,status=case when pct=100 then 'completed' else 'in_progress' end,completed_at=case when pct=100 then coalesce(completed_at,now()) else null end where id=eid;
 return pct;
end;$$;
revoke all on function public.recompute_learning_progress(uuid,uuid) from public,anon,authenticated;
grant execute on function public.recompute_learning_progress(uuid,uuid) to service_role;

create or replace function public.record_learning(p_student uuid,p_course uuid,p_lesson uuid default null,p_quiz uuid default null,p_answers jsonb default '{}') returns jsonb language plpgsql security invoker set search_path='' as $$
declare e public.enrollments%rowtype;q public.quizzes%rowtype;question public.quiz_questions%rowtype;points integer:=0;n integer:=0;needs_review boolean:=false;grade numeric;passed boolean:=false;snapshot jsonb:='[]';pct integer;
begin
 select en.* into e from public.enrollments en join public.courses c on c.id=en.course_id join public.organizations o on o.id=c.organization_id join public.memberships m on m.organization_id=c.organization_id and m.profile_id=p_student
 where en.student_id=p_student and en.course_id=p_course and en.status<>'cancelled' and c.status='published' and o.status='active' and m.access_status='active' for update of en;
 if not found then raise exception 'Course unavailable for your account.';end if;
 if (p_lesson is null)=(p_quiz is null) then raise exception 'Choose a page or assessment.';end if;
 if p_lesson is not null then
  if not exists(select 1 from public.lessons l join public.modules m on m.id=l.module_id where l.id=p_lesson and m.course_id=p_course) then raise exception 'Invalid page.';end if;
  if exists(select 1 from public.lessons l where l.id=p_lesson and l.content_config->>'activityType'='assignment') and not exists(select 1 from public.assignment_submissions s where s.lesson_id=p_lesson and s.student_id=p_student) then raise exception 'Submit your assignment before continuing.';end if;
  insert into public.lesson_progress(enrollment_id,lesson_id,completed,completed_at) values(e.id,p_lesson,true,now()) on conflict(enrollment_id,lesson_id) do update set completed=true,completed_at=coalesce(public.lesson_progress.completed_at,excluded.completed_at);
 else
  select * into q from public.quizzes where id=p_quiz and course_id=p_course;
  if not found then raise exception 'Invalid assessment.';end if;
  if (select count(*) from public.quiz_attempts where student_id=p_student and quiz_id=p_quiz)>=q.max_attempts then raise exception 'No attempts remaining.';end if;
  for question in select * from public.quiz_questions where quiz_id=p_quiz order by position loop
   n:=n+1;
   if not(p_answers ? question.id::text) or length(trim(p_answers->>question.id::text))=0 then raise exception 'Answer every question.';end if;
   snapshot:=snapshot||jsonb_build_array(jsonb_build_object('id',question.id,'prompt',question.prompt,'type',question.question_type,'options',question.options));
   if question.question_type='essay' then needs_review:=true;
   elsif (question.question_type='short_answer' and lower(trim(p_answers->>question.id::text))=lower(trim(question.correct_answer#>>'{}')))
    or (question.question_type='multiple_choice' and jsonb_typeof(p_answers->question.id::text)='array' and (p_answers->question.id::text) @> question.correct_answer and question.correct_answer @> (p_answers->question.id::text))
    or (question.question_type in ('single_choice','true_false') and (p_answers->question.id::text)=question.correct_answer) then points:=points+1;end if;
  end loop;
  if n=0 then raise exception 'This assessment has no questions.';end if;
  grade:=case when needs_review then null else round(points*100.0/n,2) end;passed:=coalesce(grade>=q.passing_score,false);
  insert into public.quiz_attempts(quiz_id,student_id,score,answers,passed,submitted_at,review_state,automatic_points,question_snapshot) values(p_quiz,p_student,grade,p_answers,passed,now(),case when needs_review then 'pending_review' else 'graded' end,points,snapshot);
 end if;
 pct:=public.recompute_learning_progress(p_student,p_course);
 return jsonb_build_object('progress',pct,'score',grade,'passed',passed,'pendingReview',needs_review);
end;$$;
revoke all on function public.record_learning(uuid,uuid,uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.record_learning(uuid,uuid,uuid,uuid,jsonb) to service_role;

create function public.review_learning_attempt(p_actor uuid,p_attempt uuid,p_marks jsonb,p_feedback text) returns void language plpgsql security invoker set search_path='' as $$
declare a public.quiz_attempts%rowtype;c public.courses%rowtype;q public.quizzes%rowtype;j jsonb;pts numeric;mark numeric;grade numeric;
begin
 select * into a from public.quiz_attempts where id=p_attempt for update;if not found or a.review_state<>'pending_review' then raise exception 'Attempt unavailable.';end if;
 select * into q from public.quizzes where id=a.quiz_id;select * into c from public.courses where id=q.course_id;
 if not exists(select 1 from public.memberships where organization_id=c.organization_id and profile_id=p_actor and role in ('academy_admin','instructor') and access_status='active') then raise exception 'Staff access required.';end if;
 perform 1 from public.enrollments where course_id=c.id and student_id=a.student_id for update;
 pts:=a.automatic_points;
 for j in select value from jsonb_array_elements(a.question_snapshot) where value->>'type'='essay' loop
  if not(p_marks ? (j->>'id')) then raise exception 'Grade every open response.';end if;
  mark:=(p_marks->>(j->>'id'))::numeric;if mark<0 or mark>1 then raise exception 'Marks must be between 0 and 1.';end if;pts:=pts+mark;
 end loop;
 grade:=round(pts*100/jsonb_array_length(a.question_snapshot),2);
 update public.quiz_attempts set score=grade,passed=grade>=q.passing_score,review_state='graded',essay_marks=p_marks,feedback=left(p_feedback,5000),reviewed_by=p_actor where id=p_attempt;
 perform public.recompute_learning_progress(a.student_id,c.id);
end;$$;
revoke all on function public.review_learning_attempt(uuid,uuid,jsonb,text) from public,anon,authenticated;
grant execute on function public.review_learning_attempt(uuid,uuid,jsonb,text) to service_role;

create function public.review_payment_report(p_actor uuid,p_report uuid,p_approve boolean,p_start date,p_end date,p_note text) returns uuid language plpgsql security invoker set search_path='' as $$
declare r public.payment_reports%rowtype;pid uuid;currency_code text;
begin
 select * into r from public.payment_reports where id=p_report for update;if not found or r.status<>'pending' then raise exception 'Report already reviewed or unavailable.';end if;
 if not exists(select 1 from public.memberships where profile_id=p_actor and organization_id=r.organization_id and role='academy_admin' and access_status='active') then raise exception 'Administrator access required.';end if;
 if p_approve then
  if p_start is null or p_end is null or p_end<p_start then raise exception 'Choose valid coverage dates.';end if;
  perform 1 from public.memberships where organization_id=r.organization_id and profile_id=r.student_id for update;
  select currency into currency_code from public.organizations where id=r.organization_id;
  insert into public.payments(organization_id,student_id,amount,currency,due_date,paid_at,status,reference,coverage_start,coverage_end) values(r.organization_id,r.student_id,r.amount,currency_code,p_start,now(),'paid','Payment report '||r.id,p_start,p_end) returning id into pid;
  update public.memberships set payment_status='paid',billing_due_date=greatest(billing_due_date,p_end+1) where organization_id=r.organization_id and profile_id=r.student_id;
 end if;
 update public.payment_reports set status=case when p_approve then 'approved' else 'rejected' end,reviewed_by=p_actor,reviewed_at=now(),review_note=left(p_note,2000),payment_id=pid where id=p_report;
 insert into public.notifications(profile_id,organization_id,type,title,body) values(r.student_id,r.organization_id,'payment',case when p_approve then 'Payment approved' else 'Payment needs attention' end,case when p_approve then 'Coverage confirmed through '||p_end::text else left(p_note,2000) end);
 return pid;
end;$$;
revoke all on function public.review_payment_report(uuid,uuid,boolean,date,date,text) from public,anon,authenticated;
grant execute on function public.review_payment_report(uuid,uuid,boolean,date,date,text) to service_role;

create function public.match_academy_referral() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if new.role='student' then update public.referrals r set matched_student_id=new.profile_id from public.profiles p where p.id=new.profile_id and r.organization_id=new.organization_id and lower(r.email)=lower(p.email) and r.referrer_id<>new.profile_id and r.matched_student_id is null;end if;
 return new;
end;$$;
revoke all on function public.match_academy_referral() from public,anon,authenticated;
create trigger match_academy_referral after insert on public.memberships for each row execute function public.match_academy_referral();

create function public.save_course_assessment(p_actor uuid,p_org uuid,p_course uuid,p_quiz uuid,p_values jsonb,p_questions jsonb) returns uuid language plpgsql security invoker set search_path='' as $$
declare qid uuid;item jsonb;ids uuid[]:='{}';question_id uuid;pos integer:=0;typ text;opts jsonb;ans jsonb;mid uuid;
begin
 if not exists(select 1 from public.memberships where organization_id=p_org and profile_id=p_actor and role in ('academy_admin','instructor') and access_status='active') and not exists(select 1 from public.profiles where id=p_actor and platform_role in ('owner','support')) then raise exception 'Staff access required.';end if;
 perform 1 from public.courses where id=p_course and organization_id=p_org for update;if not found then raise exception 'Course unavailable.';end if;
 if jsonb_typeof(p_questions)<>'array' or jsonb_array_length(p_questions) not between 1 and 100 then raise exception 'Add between 1 and 100 questions.';end if;
 mid:=nullif(p_values->>'module_id','')::uuid;
 if mid is not null and not exists(select 1 from public.modules where id=mid and course_id=p_course) then raise exception 'Invalid module.';end if;
 if p_quiz is not null then
  select id into qid from public.quizzes where id=p_quiz and course_id=p_course for update;if not found then raise exception 'Assessment unavailable.';end if;
  update public.quizzes set title=left(p_values->>'title',180),description=left(p_values->>'description',12000),assessment_type=p_values->>'assessment_type',passing_score=(p_values->>'passing_score')::integer,max_attempts=(p_values->>'max_attempts')::integer,position=(p_values->>'position')::integer,content_config=p_values->'content_config',module_id=mid where id=qid;
 else
  insert into public.quizzes(course_id,title,description,assessment_type,passing_score,max_attempts,position,content_config,module_id) values(p_course,left(p_values->>'title',180),left(p_values->>'description',12000),p_values->>'assessment_type',(p_values->>'passing_score')::integer,(p_values->>'max_attempts')::integer,(p_values->>'position')::integer,p_values->'content_config',mid) returning id into qid;
 end if;
 for item in select value from jsonb_array_elements(p_questions) loop
  pos:=pos+1;typ:=item->>'questionType';opts:=coalesce(item->'options','[]');ans:=item->'correctAnswer';
  if length(trim(item->>'prompt'))<3 or length(item->>'prompt')>2000 or typ not in ('single_choice','multiple_choice','short_answer','essay') then raise exception 'Invalid question.';end if;
  if typ in ('single_choice','multiple_choice') and (jsonb_typeof(opts)<>'array' or jsonb_array_length(opts) not between 2 and 20) then raise exception 'Provide 2–20 answer options.';end if;
  if typ='single_choice' and not(opts @> jsonb_build_array(ans)) then raise exception 'Select a correct answer from the options.';end if;
  if typ='multiple_choice' and (jsonb_typeof(ans)<>'array' or jsonb_array_length(ans)=0 or not(opts @> ans)) then raise exception 'Select at least one correct option.';end if;
  if typ='short_answer' and length(trim(ans#>>'{}'))=0 then raise exception 'Provide the expected answer.';end if;
  question_id:=nullif(item->>'id','')::uuid;
  if question_id=any(ids) then raise exception 'Duplicate question.';end if;
  if question_id is not null then
   if exists(select 1 from public.quiz_questions where id=question_id and quiz_id<>qid) then raise exception 'Invalid question ID.';end if;
  else question_id:=gen_random_uuid();end if;
  insert into public.quiz_questions(id,quiz_id,prompt,question_type,options,correct_answer,position) values(question_id,qid,trim(item->>'prompt'),typ,opts,coalesce(ans,'""'),pos)
   on conflict(id) do update set prompt=excluded.prompt,question_type=excluded.question_type,options=excluded.options,correct_answer=excluded.correct_answer,position=excluded.position;
  ids:=array_append(ids,question_id);
 end loop;
 delete from public.quiz_questions where quiz_id=qid and not(id=any(ids));
 return qid;
end;$$;
revoke all on function public.save_course_assessment(uuid,uuid,uuid,uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.save_course_assessment(uuid,uuid,uuid,uuid,jsonb,jsonb) to service_role;

create index quizzes_module_idx on public.quizzes(module_id);
create index live_sessions_lesson_idx on public.live_sessions(lesson_id);
create index quiz_attempts_reviewer_idx on public.quiz_attempts(reviewed_by);
create index payment_reports_reviewer_idx on public.payment_reports(reviewed_by);
create index assignment_submissions_reviewer_idx on public.assignment_submissions(reviewed_by);
create index referrals_matched_idx on public.referrals(matched_student_id);
create index platform_email_outbox_org_idx on public.platform_email_outbox(organization_id);
