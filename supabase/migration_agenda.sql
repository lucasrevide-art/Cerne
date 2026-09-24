-- Cerne — migração incremental (Agenda: blocos de tempo)
-- Rode em: Supabase → SQL Editor → New query → Run.
-- Aditiva: NÃO apaga nenhuma tabela nem dado existente, segura pra rodar
-- mais de uma vez (não duplica nada se rodar de novo por engano).
--
-- Adiciona duas colunas em `tasks` pra marcar um horário de início e uma
-- duração — a mesma tarefa passa a poder aparecer tanto na lista comum
-- quanto, quando tiver esses dois campos preenchidos, como um bloco
-- posicionado na grade de horas da nova view "Agenda".

alter table tasks add column if not exists start_time text;
alter table tasks add column if not exists duration_minutes integer;
