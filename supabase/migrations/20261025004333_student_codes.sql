-- Stable, automatically allocated identifiers for existing and future students.
alter table public.memberships add column student_number bigint generated always as identity;
alter table public.memberships add column student_code text generated always as (
 case when role='student' then 'LU-' || lpad(student_number::text,greatest(6,length(student_number::text)),'0') end
) stored;
create unique index memberships_student_code_key on public.memberships(student_code) where student_code is not null;

-- Called only by a verified server action. Invoker privileges; no RLS bypass function.
create or replace function public.assign_course_students(p_actor uuid,p_org uuid,p_course uuid,p_students uuid[])
returns integer language plpgsql security invoker set search_path='' as $$
declare assigned integer;
begin
 if not (exists(select 1 from public.memberships where profile_id=p_actor and organization_id=p_org and role in ('academy_admin','instructor') and access_status='active') or exists(select 1 from public.profiles where id=p_actor and platform_role in ('owner','support'))) then raise exception 'Staff access required.';end if;
 if not exists(select 1 from public.courses where id=p_course and organization_id=p_org) then raise exception 'Course unavailable in this academy.';end if;
 if coalesce(cardinality(p_students),0)=0 or cardinality(p_students)>500 then raise exception 'Choose between 1 and 500 students.';end if;
 if exists(select 1 from unnest(p_students) s(id) where not exists(select 1 from public.memberships m where m.profile_id=s.id and m.organization_id=p_org and m.role='student')) then raise exception 'A student is unavailable in this academy.';end if;
 insert into public.enrollments(organization_id,course_id,student_id,status)
 select p_org,p_course,s.id,'enrolled' from (select distinct unnest(p_students) id) s
 on conflict(course_id,student_id) do update set status=case when enrollments.status='cancelled' then 'enrolled' else enrollments.status end;
 get diagnostics assigned=row_count;
 return assigned;
end;$$;
revoke all on function public.assign_course_students(uuid,uuid,uuid,uuid[]) from public,anon,authenticated;
grant execute on function public.assign_course_students(uuid,uuid,uuid,uuid[]) to service_role;
