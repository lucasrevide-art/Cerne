-- Cerne — schema do Supabase
-- Rode isto em: Supabase → SQL Editor → New query → Run.
-- Seguro rodar mais de uma vez (apaga e recria as tabelas do zero) —
-- só faça isso se ainda não tiver dados importantes salvos lá.
-- Cria as 5 tabelas (espelhando src/types/index.ts), com Row Level
-- Security pra cada usuário só ver/editar os próprios dados, e liga
-- Realtime nelas pra sincronização automática entre dispositivos.

create extension if not exists pgcrypto;

drop table if exists recurrences cascade;
drop table if exists subtasks cascade;
drop table if exists tasks cascade;
drop table if exists projects cascade;
drop table if exists areas cascade;

-- ÁREAS ----------------------------------------------------------------
create table areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  color text not null default '',
  icon text not null default '',
  notes text not null default '',
  sort_order double precision not null default (extract(epoch from now()) * 1000)
);

-- PROJETOS ---------------------------------------------------------------
-- area_id é "on delete cascade" de propósito: apagar uma área também apaga
-- os projetos dela (mesmo comportamento do repositório local antigo). As
-- tarefas desses projetos não são apagadas — o FK tasks.project_id abaixo
-- é "on delete set null", então elas ficam soltas (voltam pro Inbox).
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  notes text not null default '',
  status text not null default 'active',
  area_id uuid references areas(id) on delete cascade,
  deadline date,
  sort_order double precision not null default (extract(epoch from now()) * 1000)
);

-- TAREFAS ------------------------------------------------------------------
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null,
  notes text not null default '',
  when_type text,
  when_date date,
  deadline date,
  status text not null default 'open',
  priority integer not null default 0,
  type text not null default 'default',
  amount numeric,
  category text,
  project_id uuid references projects(id) on delete set null,
  area_id uuid references areas(id) on delete set null,
  tag_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  sort_order double precision not null default (extract(epoch from now()) * 1000)
);

-- SUBTAREFAS ------------------------------------------------------------
create table subtasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  task_id uuid not null references tasks(id) on delete cascade,
  title text not null,
  status text not null default 'open',
  sort_order double precision not null default (extract(epoch from now()) * 1000)
);

-- RECORRÊNCIAS ------------------------------------------------------------
-- "interval" é palavra reservada do SQL (tipo de dado embutido), por isso
-- interval_count em vez de interval como nome de coluna.
create table recurrences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  task_id uuid not null unique references tasks(id) on delete cascade,
  type text not null,
  interval_count integer not null default 1,
  weekdays integer[] not null default '{}',
  next_date date not null
);

-- Índices (espelham os campos indexados no Dexie local) -------------------
create index tasks_user_id_idx on tasks(user_id);
create index tasks_project_id_idx on tasks(project_id);
create index tasks_area_id_idx on tasks(area_id);
create index subtasks_task_id_idx on subtasks(task_id);
create index projects_area_id_idx on projects(area_id);

-- Row Level Security: cada usuário só enxerga/edita os próprios dados -----
alter table areas enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table subtasks enable row level security;
alter table recurrences enable row level security;

create policy "areas: own rows" on areas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "projects: own rows" on projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks: own rows" on tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "subtasks: own rows" on subtasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "recurrences: own rows" on recurrences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Realtime: transmite INSERT/UPDATE/DELETE pra sincronizar entre abas/dispositivos
alter publication supabase_realtime add table areas, projects, tasks, subtasks, recurrences;
