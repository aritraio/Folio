-- Run in your own Supabase project's SQL editor. No service-role key is needed by Folio.
create table if not exists public.folio_workspaces (
 user_id uuid primary key references auth.users(id) on delete cascade,
 data jsonb not null,
 revision integer not null default 1,
 updated_at timestamptz not null default now()
);
alter table public.folio_workspaces enable row level security;
create policy "Own workspace" on public.folio_workspaces for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.folio_workspaces to authenticated;
-- Atomic compare-and-swap: stale clients cannot overwrite a newer snapshot.
create or replace function public.folio_save_workspace(expected_revision integer, payload jsonb)
returns integer language plpgsql security invoker set search_path = public as $$
declare next_revision integer;
begin
 if expected_revision = 0 then
   insert into public.folio_workspaces(user_id,data,revision) values(auth.uid(),payload,1) on conflict do nothing returning revision into next_revision;
 else
   update public.folio_workspaces set data=payload, revision=revision+1, updated_at=now() where user_id=auth.uid() and revision=expected_revision returning revision into next_revision;
 end if;
 if next_revision is null then raise exception 'Workspace changed. Check cloud backup and retry.'; end if;
 return next_revision;
end $$;
revoke all on function public.folio_save_workspace(integer,jsonb) from public;
grant execute on function public.folio_save_workspace(integer,jsonb) to authenticated;
-- Required for AI and auth request quotas. Private calls through authenticated JWT only.
create table if not exists public.folio_ai_usage(user_id uuid references auth.users(id) on delete cascade, day date not null default current_date, requests integer not null default 0, primary key(user_id,day));
alter table public.folio_ai_usage enable row level security;
create or replace function public.folio_take_ai_quota() returns boolean language plpgsql security definer set search_path=public as $$
declare used integer;
begin
 if auth.uid() is null then return false; end if;
 insert into public.folio_ai_usage(user_id,day,requests) values(auth.uid(),current_date,1)
 on conflict(user_id,day) do update set requests=folio_ai_usage.requests+1 where folio_ai_usage.requests<20 returning requests into used;
 return used is not null;
end $$;
revoke all on function public.folio_take_ai_quota() from public;
grant execute on function public.folio_take_ai_quota() to authenticated;
