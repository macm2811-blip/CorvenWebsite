-- Scores and completion are written atomically by the authenticated server.
create or replace function public.can_access_course(target_course uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.courses c where c.id=target_course and (
    public.is_platform_owner() or public.is_org_staff(c.organization_id) or (
      c.status='published' and exists(select 1 from public.organizations o where o.id=c.organization_id and o.status='active')
      and exists(select 1 from public.memberships m where m.organization_id=c.organization_id and m.profile_id=auth.uid() and m.access_status='active')
      and exists(select 1 from public.enrollments e where e.course_id=c.id and e.student_id=auth.uid() and e.status in ('enrolled','in_progress','completed'))
    )
  ));
$$;
drop policy if exists "authorized users view quiz questions" on public.quiz_questions;
drop policy if exists "users manage quiz attempts" on public.quiz_attempts;
create policy "users read own quiz attempts" on public.quiz_attempts for select to authenticated
using (student_id = (select auth.uid()) or public.is_platform_owner());
drop policy if exists "users manage lesson progress" on public.lesson_progress;
create policy "users read lesson progress" on public.lesson_progress for select to authenticated
using (exists (select 1 from public.enrollments e where e.id = enrollment_id and (e.student_id = (select auth.uid()) or public.is_org_staff(e.organization_id))));

create index if not exists quiz_attempts_student_quiz_idx on public.quiz_attempts(student_id, quiz_id);

create or replace function public.record_learning(p_student uuid, p_course uuid, p_lesson uuid default null, p_quiz uuid default null, p_answers jsonb default '{}'::jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  enrollment public.enrollments%rowtype;
  assessment public.quizzes%rowtype;
  question public.quiz_questions%rowtype;
  correct_count integer := 0;
  question_count integer := 0;
  grade numeric := null;
  passed boolean := false;
  total integer;
  done integer;
  pct integer;
begin
  select e.* into enrollment from public.enrollments e
  join public.courses c on c.id=e.course_id
  join public.organizations o on o.id=c.organization_id
  join public.memberships m on m.organization_id=c.organization_id and m.profile_id=p_student
  where e.student_id=p_student and e.course_id=p_course and e.status <> 'cancelled'
    and c.status='published' and o.status='active' and m.access_status='active'
  for update of e;
  if not found then raise exception 'El curso no está disponible para tu cuenta.'; end if;
  if (p_lesson is null) = (p_quiz is null) then raise exception 'Selecciona una lección o evaluación.'; end if;
  if p_lesson is not null then
    if not exists(select 1 from public.lessons l join public.modules m on m.id=l.module_id where l.id=p_lesson and m.course_id=p_course) then raise exception 'Lección inválida.'; end if;
    insert into public.lesson_progress(enrollment_id,lesson_id,completed,completed_at)
    values(enrollment.id,p_lesson,true,now())
    on conflict(enrollment_id,lesson_id) do update set completed=true,completed_at=coalesce(public.lesson_progress.completed_at,excluded.completed_at);
  else
    select * into assessment from public.quizzes where id=p_quiz and course_id=p_course;
    if not found then raise exception 'Evaluación inválida.'; end if;
    if (select count(*) from public.quiz_attempts where student_id=p_student and quiz_id=p_quiz) >= assessment.max_attempts then raise exception 'Ya utilizaste los intentos disponibles.'; end if;
    for question in select * from public.quiz_questions where quiz_id=p_quiz loop
      question_count := question_count+1;
      if not (p_answers ? question.id::text) then raise exception 'Responde todas las preguntas.'; end if;
      if (question.question_type='short_answer' and lower(trim(p_answers->>question.id::text))=lower(trim(question.correct_answer#>>'{}')))
        or (question.question_type='multiple_choice' and p_answers->question.id::text @> question.correct_answer and question.correct_answer @> p_answers->question.id::text)
        or (question.question_type not in ('short_answer','multiple_choice') and p_answers->question.id::text = question.correct_answer) then correct_count:=correct_count+1; end if;
    end loop;
    if question_count=0 then raise exception 'Esta evaluación todavía no tiene preguntas.'; end if;
    grade:=round(correct_count*100.0/question_count,2);
    passed:=grade>=assessment.passing_score;
    insert into public.quiz_attempts(quiz_id,student_id,score,answers,passed,submitted_at)
      values(p_quiz,p_student,grade,p_answers,passed,now());
  end if;
  select count(*) into total from public.lessons l join public.modules m on m.id=l.module_id where m.course_id=p_course;
  select count(*) into done from public.lesson_progress lp join public.lessons l on l.id=lp.lesson_id join public.modules m on m.id=l.module_id where lp.enrollment_id=enrollment.id and lp.completed and m.course_id=p_course;
  total:=total+(select count(*) from public.quizzes where course_id=p_course);
  done:=done+(select count(*) from public.quizzes q where q.course_id=p_course and exists(select 1 from public.quiz_attempts a where a.quiz_id=q.id and a.student_id=p_student and a.passed));
  pct:=case when total=0 then 0 else floor(done*100.0/total)::integer end;
  update public.enrollments set progress=pct,status=case when pct=100 then 'completed' else 'in_progress' end,completed_at=case when pct=100 then coalesce(completed_at,now()) else null end where id=enrollment.id;
  return jsonb_build_object('progress',pct,'score',grade,'passed',passed);
end;
$$;
revoke all on function public.record_learning(uuid,uuid,uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.record_learning(uuid,uuid,uuid,uuid,jsonb) to service_role;
