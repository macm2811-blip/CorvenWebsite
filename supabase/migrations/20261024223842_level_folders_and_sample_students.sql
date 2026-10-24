create table public.course_levels (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null check (code in ('A1','A2','B1','B2','C1')),
  created_at timestamptz not null default now(),
  primary key (organization_id,code)
);
alter table public.course_levels enable row level security;
revoke all on public.course_levels from anon,authenticated;
grant select on public.course_levels to authenticated;
grant all on public.course_levels to service_role;
create policy levels_read on public.course_levels for select to authenticated using (public.is_org_member(organization_id));
insert into public.course_levels(organization_id,code)
select distinct organization_id,level from public.courses where level in ('A1','A2','B1','B2','C1') on conflict do nothing;
alter table public.memberships add column is_sample boolean not null default false;
