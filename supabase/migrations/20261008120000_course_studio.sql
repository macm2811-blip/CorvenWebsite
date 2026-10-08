alter table public.lessons
  add column if not exists content_config jsonb not null default '{}'::jsonb;

alter table public.lessons
  drop constraint if exists lessons_content_type_check;

alter table public.lessons
  add constraint lessons_content_type_check
  check (content_type in ('text', 'image', 'youtube', 'document', 'audio', 'quiz', 'exam', 'live_session'));

alter table public.quizzes
  add column if not exists assessment_type text not null default 'quiz',
  add column if not exists description text not null default '',
  add column if not exists position integer not null default 0,
  add column if not exists content_config jsonb not null default '{}'::jsonb;

alter table public.quizzes
  drop constraint if exists quizzes_assessment_type_check;

alter table public.quizzes
  add constraint quizzes_assessment_type_check
  check (assessment_type in ('quiz', 'exam'));

create index if not exists lessons_module_position_idx
  on public.lessons(module_id, position);

create index if not exists quizzes_course_position_idx
  on public.quizzes(course_id, position);
