-- Username-based access for the production learning portal.
-- Email remains the Supabase Auth identity and is resolved only on the server.

alter table public.profiles
  add column if not exists username text;

update public.profiles
set username = lower(trim(username))
where username is not null;

alter table public.profiles
  drop constraint if exists profiles_username_format;

alter table public.profiles
  add constraint profiles_username_format
  check (
    username is null
    or (
      username = lower(username)
      and username ~ '^[a-z0-9][a-z0-9._-]{2,31}$'
    )
  );

create unique index if not exists profiles_username_unique_idx
  on public.profiles (lower(username))
  where username is not null;

comment on column public.profiles.username is
  'Unique sign-in name. Lowercase letters, numbers, dots, underscores and hyphens; 3-32 characters.';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  normalized_username text;
begin
  normalized_username := nullif(
    lower(trim(coalesce(new.raw_user_meta_data ->> 'username', ''))),
    ''
  );

  if normalized_username is not null
    and normalized_username !~ '^[a-z0-9][a-z0-9._-]{2,31}$'
  then
    normalized_username := null;
  end if;

  insert into public.profiles (id, full_name, email, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    normalized_username
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        username = coalesce(excluded.username, profiles.username);

  return new;
end;
$$;
