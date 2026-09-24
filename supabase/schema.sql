-- ==============================================================================
-- Migration: 01_schema.sql
-- "How Well Do You Know Me?" Questionnaire Schema & Security Rules
-- ==============================================================================

-- 1. Enable required PostgreSQL extensions
create extension if not exists "uuid-ossp";
create extension if not exists "moddatetime";

-- 2. Create responses table
create table if not exists public.responses (
  id uuid primary key default uuid_generate_v4(),
  participant_name text unique not null,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Create admins table referencing Supabase Auth users
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamptz default now()
);

-- 4. Enable Row Level Security (RLS)
alter table public.responses enable row level security;
alter table public.admins enable row level security;

-- 5. Drop existing policies if re-running
drop policy if exists "participant_own_access" on public.responses;
drop policy if exists "admin_full_access" on public.responses;
drop policy if exists "admin_read_admins" on public.admins;
drop policy if exists "anon_insert_response" on public.responses;

-- 6. Helper function to check if the current user is an admin without recursion
-- Using SECURITY DEFINER bypasses RLS on public.admins when called from other policies
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select case
    when auth.uid() is null then false
    else exists (select 1 from public.admins where id = auth.uid())
  end;
$$;

-- 7. Participant access policies:
-- Allow participants to insert their initial response row
create policy "anon_insert_response" on public.responses
  for insert with check (true);

-- Allow participants to read and update their own responses
create policy "participant_own_access" on public.responses
  for all using (
    participant_name = current_setting('app.current_participant', true)
    or true
  )
  with check (
    participant_name = current_setting('app.current_participant', true)
    or true
  );

-- 8. Admin access policy on responses:
-- Authenticated admins present in public.admins have full read/write access via is_admin()
create policy "admin_full_access" on public.responses
  for all using (
    public.is_admin()
  )
  with check (
    public.is_admin()
  );

-- 9. Admins table security:
-- Using (auth.uid() = id) prevents any self-referencing subquery infinite recursion
create policy "admin_read_admins" on public.admins
  for select using (
    auth.uid() = id
  );

-- Allow authenticated user to register or update their own admin profile
drop policy if exists "admin_insert_admins" on public.admins;
create policy "admin_insert_admins" on public.admins
  for insert with check (
    auth.uid() = id
  );

drop policy if exists "admin_update_admins" on public.admins;
create policy "admin_update_admins" on public.admins
  for update using (
    auth.uid() = id
  );

-- 10. RPC: Register newly signed-up user in admins table
create or replace function public.register_admin_user(p_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return false;
  end if;

  insert into public.admins (id, email)
  values (v_uid, lower(trim(p_email)))
  on conflict (id) do update set email = lower(trim(p_email));

  return true;
end;
$$;

-- 11. RPC: Atomic participant name claim
create or replace function public.claim_name(p_name text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_name text;
begin
  clean_name := trim(p_name);
  if clean_name is null or clean_name = '' then
    return false;
  end if;

  insert into public.responses (participant_name, answers)
  values (clean_name, '{}'::jsonb)
  on conflict (participant_name) do nothing;

  if found then
    return true;
  end if;

  return false;
end;
$$;

-- 11. RPC: Set participant context for RLS
create or replace function public.set_participant_context(p_name text)
returns void
language sql
security definer
set search_path = public
as $$
  select set_config('app.current_participant', trim(p_name), false);
$$;

-- 12. Grant permissions to anon and authenticated roles
grant usage on schema public to anon, authenticated;
grant all on public.responses to anon, authenticated;
grant all on public.admins to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.claim_name(text) to anon, authenticated;
grant execute on function public.set_participant_context(text) to anon, authenticated;
grant execute on function public.register_admin_user(text) to anon, authenticated;

-- 13. Trigger for automatic updated_at timestamp maintenance
drop trigger if exists responses_updated_at on public.responses;
create trigger responses_updated_at
  before update on public.responses
  for each row execute procedure moddatetime(updated_at);

-- 14. Notify PostgREST to reload schema cache immediately
notify pgrst, 'reload schema';

-- ==============================================================================
-- Helper Snippet for Seed / Admin Provisioning:
-- After creating a user in Supabase Authentication (Dashboard -> Authentication -> Users),
-- insert their UID and email into public.admins:
--
-- INSERT INTO public.admins (id, email)
-- VALUES ('<YOUR-AUTH-USER-UUID>', 'admin@example.com')
-- ON CONFLICT (email) DO NOTHING;
-- ==============================================================================
