-- Run once in Supabase: SQL Editor -> New query -> paste -> Run
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text not null
);
alter table public.profiles enable row level security;
create policy "own profile" on public.profiles for select using (auth.uid() = id);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, username, email)
  values (new.id, lower(coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1))), new.email)
  on conflict do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.email_for_username(u text) returns text
language sql security definer set search_path = public stable as $$
  select email from public.profiles where username = lower(u) limit 1 $$;
grant execute on function public.email_for_username(text) to anon, authenticated;
