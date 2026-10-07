-- CORVEN Learning Platform foundation
-- Multi-tenant schema for Level Up and future academies.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  learning_model text not null default 'hybrid' check (learning_model in ('self_paced', 'instructor_led', 'hybrid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  platform_role text not null default 'user' check (platform_role in ('user', 'owner', 'support')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_branding (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  logo_url text,
  primary_color text not null default '#6D28D9',
  secondary_color text not null default '#111827',
  accent_color text not null default '#F97316',
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('academy_admin', 'instructor', 'student')),
  access_status text not null default 'active' check (access_status in ('invited', 'active', 'suspended', 'archived')),
  payment_status text not null default 'pending' check (payment_status in ('paid', 'pending', 'overdue', 'waived')),
  billing_due_date date,
  monthly_fee numeric(12,2) not null default 0,
  last_access_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, profile_id)
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  slug text not null,
  description text not null default '',
  level text,
  cover_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  passing_score integer not null default 80 check (passing_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  description text not null default '',
  content_type text not null default 'text' check (content_type in ('text', 'youtube', 'document', 'audio', 'quiz', 'live_session')),
  body text,
  youtube_url text,
  resource_url text,
  duration_minutes integer not null default 0,
  position integer not null default 0,
  is_preview boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'enrolled' check (status in ('enrolled', 'in_progress', 'completed', 'cancelled')),
  progress integer not null default 0 check (progress between 0 and 100),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (course_id, student_id)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  seconds_viewed integer not null default 0,
  unique (enrollment_id, lesson_id)
);

create table public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  instructor_id uuid references public.profiles(id) on delete set null,
  title text not null,
  starts_at timestamptz not null,
  duration_minutes integer not null default 60,
  meeting_url text,
  recording_youtube_url text,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  passing_score integer not null default 80 check (passing_score between 0 and 100),
  max_attempts integer not null default 3,
  created_at timestamptz not null default now()
);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  prompt text not null,
  question_type text not null default 'single_choice' check (question_type in ('single_choice', 'multiple_choice', 'true_false', 'short_answer')),
  options jsonb not null default '[]'::jsonb,
  correct_answer jsonb,
  position integer not null default 0
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  score numeric(5,2),
  answers jsonb not null default '{}'::jsonb,
  passed boolean,
  started_at timestamptz not null default now(),
  submitted_at timestamptz
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null,
  currency text not null default 'CRC',
  due_date date not null,
  paid_at timestamptz,
  status text not null default 'pending' check (status in ('paid', 'pending', 'overdue', 'cancelled', 'waived')),
  reference text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null default '',
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  title text not null,
  description text not null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'answered', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index memberships_profile_idx on public.memberships(profile_id);
create index courses_organization_idx on public.courses(organization_id);
create index enrollments_student_idx on public.enrollments(student_id);
create index payments_org_due_idx on public.payments(organization_id, due_date);
create index notifications_profile_read_idx on public.notifications(profile_id, read_at);
create index tickets_org_status_idx on public.support_tickets(organization_id, status);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_platform_owner()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and platform_role in ('owner', 'support')
  );
$$;

create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where organization_id = target_org
      and profile_id = auth.uid()
      and access_status in ('active', 'invited')
  );
$$;

create or replace function public.is_org_staff(target_org uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select public.is_platform_owner() or exists (
    select 1 from public.memberships
    where organization_id = target_org
      and profile_id = auth.uid()
      and role in ('academy_admin', 'instructor')
      and access_status = 'active'
  );
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_branding enable row level security;
alter table public.memberships enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.live_sessions enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.support_tickets enable row level security;
alter table public.ticket_messages enable row level security;

create policy "members view organizations" on public.organizations for select using (public.is_org_member(id) or public.is_platform_owner());
create policy "owners manage organizations" on public.organizations for all using (public.is_platform_owner()) with check (public.is_platform_owner());
create policy "users view own profile" on public.profiles for select using (id = auth.uid() or public.is_platform_owner());
create policy "users update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "members view branding" on public.organization_branding for select using (public.is_org_member(organization_id) or public.is_platform_owner());
create policy "staff manage branding" on public.organization_branding for all using (public.is_org_staff(organization_id)) with check (public.is_org_staff(organization_id));
create policy "members view memberships" on public.memberships for select using (profile_id = auth.uid() or public.is_org_staff(organization_id));
create policy "staff manage memberships" on public.memberships for all using (public.is_org_staff(organization_id)) with check (public.is_org_staff(organization_id));
create policy "members view courses" on public.courses for select using (public.is_org_member(organization_id) or public.is_platform_owner());
create policy "staff manage courses" on public.courses for all using (public.is_org_staff(organization_id)) with check (public.is_org_staff(organization_id));
create policy "members view modules" on public.modules for select using (exists (select 1 from public.courses c where c.id = course_id and public.is_org_member(c.organization_id)) or public.is_platform_owner());
create policy "staff manage modules" on public.modules for all using (exists (select 1 from public.courses c where c.id = course_id and public.is_org_staff(c.organization_id))) with check (exists (select 1 from public.courses c where c.id = course_id and public.is_org_staff(c.organization_id)));
create policy "members view lessons" on public.lessons for select using (exists (select 1 from public.modules m join public.courses c on c.id = m.course_id where m.id = module_id and public.is_org_member(c.organization_id)) or public.is_platform_owner());
create policy "staff manage lessons" on public.lessons for all using (exists (select 1 from public.modules m join public.courses c on c.id = m.course_id where m.id = module_id and public.is_org_staff(c.organization_id))) with check (exists (select 1 from public.modules m join public.courses c on c.id = m.course_id where m.id = module_id and public.is_org_staff(c.organization_id)));
create policy "users view enrollments" on public.enrollments for select using (student_id = auth.uid() or public.is_org_staff(organization_id));
create policy "staff manage enrollments" on public.enrollments for all using (public.is_org_staff(organization_id)) with check (public.is_org_staff(organization_id));
create policy "users manage lesson progress" on public.lesson_progress for all using (exists (select 1 from public.enrollments e where e.id = enrollment_id and (e.student_id = auth.uid() or public.is_org_staff(e.organization_id)))) with check (exists (select 1 from public.enrollments e where e.id = enrollment_id and (e.student_id = auth.uid() or public.is_org_staff(e.organization_id))));
create policy "members view sessions" on public.live_sessions for select using (public.is_org_member(organization_id) or public.is_platform_owner());
create policy "staff manage sessions" on public.live_sessions for all using (public.is_org_staff(organization_id)) with check (public.is_org_staff(organization_id));
create policy "members view quizzes" on public.quizzes for select using (exists (select 1 from public.courses c where c.id = course_id and public.is_org_member(c.organization_id)) or public.is_platform_owner());
create policy "staff manage quizzes" on public.quizzes for all using (exists (select 1 from public.courses c where c.id = course_id and public.is_org_staff(c.organization_id))) with check (exists (select 1 from public.courses c where c.id = course_id and public.is_org_staff(c.organization_id)));
create policy "members view quiz questions" on public.quiz_questions for select using (exists (select 1 from public.quizzes q join public.courses c on c.id = q.course_id where q.id = quiz_id and public.is_org_member(c.organization_id)) or public.is_platform_owner());
create policy "staff manage quiz questions" on public.quiz_questions for all using (exists (select 1 from public.quizzes q join public.courses c on c.id = q.course_id where q.id = quiz_id and public.is_org_staff(c.organization_id))) with check (exists (select 1 from public.quizzes q join public.courses c on c.id = q.course_id where q.id = quiz_id and public.is_org_staff(c.organization_id)));
create policy "users manage quiz attempts" on public.quiz_attempts for all using (student_id = auth.uid() or public.is_platform_owner()) with check (student_id = auth.uid() or public.is_platform_owner());
create policy "users view payments" on public.payments for select using (student_id = auth.uid() or public.is_org_staff(organization_id));
create policy "staff manage payments" on public.payments for all using (public.is_org_staff(organization_id)) with check (public.is_org_staff(organization_id));
create policy "users view notifications" on public.notifications for select using (profile_id = auth.uid());
create policy "users update notifications" on public.notifications for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "members create tickets" on public.support_tickets for insert with check (created_by = auth.uid() and public.is_org_member(organization_id));
create policy "members view tickets" on public.support_tickets for select using (created_by = auth.uid() or public.is_org_staff(organization_id) or public.is_platform_owner());
create policy "owners manage tickets" on public.support_tickets for update using (public.is_platform_owner() or public.is_org_staff(organization_id)) with check (public.is_platform_owner() or public.is_org_staff(organization_id));
create policy "participants view ticket messages" on public.ticket_messages for select using (exists (select 1 from public.support_tickets t where t.id = ticket_id and (t.created_by = auth.uid() or public.is_org_staff(t.organization_id) or public.is_platform_owner())));
create policy "participants create ticket messages" on public.ticket_messages for insert with check (author_id = auth.uid() and exists (select 1 from public.support_tickets t where t.id = ticket_id and (t.created_by = auth.uid() or public.is_org_staff(t.organization_id) or public.is_platform_owner())));

create trigger organizations_updated_at before update on public.organizations for each row execute procedure public.set_updated_at();
create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger branding_updated_at before update on public.organization_branding for each row execute procedure public.set_updated_at();
create trigger memberships_updated_at before update on public.memberships for each row execute procedure public.set_updated_at();
create trigger courses_updated_at before update on public.courses for each row execute procedure public.set_updated_at();
create trigger lessons_updated_at before update on public.lessons for each row execute procedure public.set_updated_at();
create trigger payments_updated_at before update on public.payments for each row execute procedure public.set_updated_at();
create trigger tickets_updated_at before update on public.support_tickets for each row execute procedure public.set_updated_at();

insert into public.organizations (name, slug, learning_model)
values ('Level Up English Academy', 'level-up', 'hybrid')
on conflict (slug) do nothing;

insert into public.organization_branding (organization_id)
select id from public.organizations where slug = 'level-up'
on conflict (organization_id) do nothing;
