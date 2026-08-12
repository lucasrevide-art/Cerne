-- Cerne — migração incremental (tags + "A Única Coisa")
-- Rode em: Supabase → SQL Editor → New query → Run.
-- Aditiva: NÃO apaga nenhuma tabela nem dado existente, segura pra rodar
-- a qualquer momento, mesmo com tarefas/áreas/projetos já salvos.

alter table tasks add column if not exists is_focus boolean not null default false;

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  color text not null default '',
  unique (user_id, name)
);

create index if not exists tags_user_id_idx on tags(user_id);

alter table tags enable row level security;

drop policy if exists "tags: own rows" on tags;
create policy "tags: own rows" on tags
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Realtime pra tags (as outras tabelas já foram adicionadas no schema inicial)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tags'
  ) then
    alter publication supabase_realtime add table tags;
  end if;
end $$;
