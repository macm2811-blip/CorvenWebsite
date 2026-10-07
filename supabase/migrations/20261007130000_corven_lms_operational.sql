-- Operational hardening for the Level Up pilot.

alter table public.profiles add column if not exists email text;
alter table public.memberships add column if not exists level text not null default 'A1';
alter table public.organizations add column if not exists default_monthly_fee numeric(12,2) not null default 35000;
alter table public.organizations add column if not exists currency text not null default 'CRC';

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email;
  return new;
end;
$$;

create or replace function public.can_access_course(target_course uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1
    from public.courses c
    where c.id = target_course
      and (
        public.is_platform_owner()
        or public.is_org_staff(c.organization_id)
        or (
          public.is_org_member(c.organization_id)
          and exists (
          select 1
          from public.enrollments e
          where e.course_id = c.id
            and e.student_id = auth.uid()
            and e.status in ('enrolled', 'in_progress', 'completed')
          )
        )
      )
  );
$$;

create or replace function public.can_view_profile(target_profile uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select target_profile = auth.uid()
    or public.is_platform_owner()
    or exists (
      select 1
      from public.memberships viewer
      join public.memberships subject
        on subject.organization_id = viewer.organization_id
      where viewer.profile_id = auth.uid()
        and viewer.role in ('academy_admin', 'instructor')
        and viewer.access_status = 'active'
        and subject.profile_id = target_profile
    );
$$;

create or replace function public.activate_current_membership()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.memberships
  set access_status = 'active', last_access_at = now()
  where profile_id = auth.uid()
    and access_status = 'invited';
end;
$$;

grant execute on function public.activate_current_membership() to authenticated;

drop policy if exists "users view own profile" on public.profiles;
create policy "users view permitted profiles" on public.profiles
for select using (public.can_view_profile(id));

drop policy if exists "members view courses" on public.courses;
create policy "authorized users view courses" on public.courses
for select using (public.can_access_course(id));

drop policy if exists "members view modules" on public.modules;
create policy "authorized users view modules" on public.modules
for select using (public.can_access_course(course_id));

drop policy if exists "members view lessons" on public.lessons;
create policy "authorized users view lessons" on public.lessons
for select using (
  exists (
    select 1 from public.modules m
    where m.id = module_id and public.can_access_course(m.course_id)
  )
);

drop policy if exists "members view quizzes" on public.quizzes;
create policy "authorized users view quizzes" on public.quizzes
for select using (public.can_access_course(course_id));

drop policy if exists "members view quiz questions" on public.quiz_questions;
create policy "authorized users view quiz questions" on public.quiz_questions
for select using (
  exists (
    select 1 from public.quizzes q
    where q.id = quiz_id and public.can_access_course(q.course_id)
  )
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_org_created_idx
  on public.audit_events(organization_id, created_at desc);

alter table public.audit_events enable row level security;

create policy "staff view audit events" on public.audit_events
for select using (
  public.is_platform_owner()
  or (organization_id is not null and public.is_org_staff(organization_id))
);

create policy "authenticated users create audit events" on public.audit_events
for insert with check (
  actor_id = auth.uid()
  and (
    public.is_platform_owner()
    or (organization_id is not null and public.is_org_member(organization_id))
  )
);

create policy "staff update organization settings" on public.organizations
for update using (public.is_org_staff(id))
with check (public.is_org_staff(id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'organization-assets',
  'organization-assets',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do nothing;

update public.organizations
set default_monthly_fee = 35000, currency = 'CRC'
where slug = 'level-up';

with level_up as (
  select id from public.organizations where slug = 'level-up'
)
insert into public.courses (
  organization_id, title, slug, description, level, status, passing_score
)
select
  level_up.id,
  'English Foundations A1',
  'english-foundations-a1',
  'Curso híbrido inicial para construir vocabulario, comprensión y conversación cotidiana.',
  'A1',
  'draft',
  80
from level_up
on conflict (organization_id, slug) do nothing;

with course as (
  select id from public.courses where slug = 'english-foundations-a1'
)
insert into public.modules (course_id, title, position)
select course.id, 'Introductions and daily routines', 1
from course
where not exists (
  select 1 from public.modules m
  where m.course_id = course.id and m.position = 1
);

with target_module as (
  select m.id
  from public.modules m
  join public.courses c on c.id = m.course_id
  where c.slug = 'english-foundations-a1' and m.position = 1
)
insert into public.lessons (
  module_id, title, description, content_type, youtube_url,
  duration_minutes, position, is_preview
)
select
  target_module.id,
  'Welcome to Level Up',
  'Introducción al curso y a la modalidad híbrida.',
  'youtube',
  'https://www.youtube.com/watch?v=ysz5S6PUM-U',
  8,
  1,
  true
from target_module
where not exists (
  select 1 from public.lessons l
  where l.module_id = target_module.id and l.position = 1
);
