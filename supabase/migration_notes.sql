-- Cerne — migração incremental (notas viram registros independentes)
-- Rode em: Supabase → SQL Editor → New query → Run.
-- Aditiva: NÃO apaga nenhuma tabela nem dado existente, segura pra rodar
-- mais de uma vez (não duplica nada se rodar de novo por engano).
--
-- Antes: cada área tinha um único campo de texto (areas.notes) compartilhado.
-- Depois: cada nota é seu próprio registro na tabela `notes`, como no app
-- Notas do macOS — várias notas por área, cada uma aberta/editada isolada.

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  area_id uuid not null references areas(id) on delete cascade,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_area_id_idx on notes(area_id);

alter table notes enable row level security;

drop policy if exists "notes: own rows" on notes;
create policy "notes: own rows" on notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Realtime pra notes (as outras tabelas já foram adicionadas no schema inicial)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notes'
  ) then
    alter publication supabase_realtime add table notes;
  end if;
end $$;

-- Migração dos dados: o texto único antigo de cada área (areas.notes) vira a
-- primeira nota dela. Só roda pra áreas que ainda não têm nenhuma nota —
-- então rodar esse script de novo não duplica nada.
insert into notes (user_id, area_id, body)
select a.user_id, a.id, a.notes
from areas a
where a.notes is not null
  and trim(a.notes) <> ''
  and not exists (select 1 from notes n where n.area_id = a.id);

-- A coluna antiga (areas.notes) fica pra trás sem uso — o app não lê mais
-- dela depois dessa migração. Só remova depois de conferir que as notas
-- migraram direitinho:
-- alter table areas drop column notes;
