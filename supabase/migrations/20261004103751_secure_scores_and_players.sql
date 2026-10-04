-- 1) Skor gönderimi: oyuncu kimliği device_id ile doğrulanır, her zaman en yüksek skor tutulur
create or replace function public.submit_score(
  p_player_id uuid,
  p_device_id text,
  p_level_number int,
  p_score int,
  p_moves int,
  p_time int
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.players
    where id = p_player_id and device_id = p_device_id
  ) then
    raise exception 'invalid player';
  end if;

  if p_score not between 0 and 1000
     or p_level_number not between 0 and 10000
     or p_moves < 1 or p_time < 0 then
    raise exception 'invalid score';
  end if;

  insert into public.scores (player_id, level_number, score, moves, time)
  values (p_player_id, p_level_number, p_score, p_moves, p_time)
  on conflict (player_id, level_number) do update
    set score = excluded.score,
        moves = excluded.moves,
        time = excluded.time,
        created_at = now()
    where excluded.score > public.scores.score;
end;
$$;

-- 2) Oyuncu kaydı: aynı cihaz tekrar kaydolursa yeni satır açılmaz, nickname güncellenir
create or replace function public.register_player(p_device_id text, p_nickname text)
returns table (id uuid, nickname text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nickname text := btrim(p_nickname);
begin
  if char_length(v_nickname) not between 2 and 16
     or char_length(p_device_id) not between 8 and 128 then
    raise exception 'invalid player data';
  end if;

  return query
  insert into public.players as p (device_id, nickname)
  values (p_device_id, v_nickname)
  on conflict (device_id) do update set nickname = excluded.nickname
  returning p.id, p.nickname;
end;
$$;

revoke all on function public.submit_score(uuid, text, int, int, int, int) from public;
revoke all on function public.register_player(text, text) from public;
grant execute on function public.submit_score(uuid, text, int, int, int, int) to anon, authenticated;
grant execute on function public.register_player(text, text) to anon, authenticated;

-- 3) Tablolara doğrudan yazmayı kapat (artık sadece fonksiyonlar yazar)
drop policy if exists scores_insert on public.scores;
drop policy if exists scores_update on public.scores;
drop policy if exists players_insert on public.players;
revoke insert, update, delete, truncate on public.scores from anon, authenticated;
revoke insert, update, delete, truncate on public.players from anon, authenticated;

-- 4) device_id herkese açık okunmasın; leaderboard view'ı sadece id + nickname kullanıyor
revoke select on public.players from anon, authenticated;
grant select (id, nickname, created_at) on public.players to anon, authenticated;

-- 5) Foreign key index'leri
create index if not exists daily_challenges_board_id_idx on public.daily_challenges (board_id);
create index if not exists levels_board_id_idx on public.levels (board_id);
