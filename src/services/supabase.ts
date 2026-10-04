import {
  LevelDefinition,
  PieceMatrix,
  Board,
  AppSettings,
  LocalizedText,
  Postcard,
} from '../types/types.ts';
import DeviceInfo from 'react-native-device-info';

// device_id istemciye geri dönmez; DB'de herkese kapalı bir kolon
export type Player = {
  id: string;
  nickname: string;
};

export type LeaderboardEntry = {
  player_id: string;
  nickname: string;
  total_score: number;
  levels_completed: number;
};

const SUPABASE_URL = 'https://blockpuzzle.nmelih.workers.dev';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZ3RtaHp3cHNxZnFrZmF3b2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MzI3MjYsImV4cCI6MjA4NTIwODcyNn0.753amyfGAlxoA4H7OyQ6w-FwfG5feAgZOPqIOHtEAxM';

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

type RemotePostcard = string | { url: string; title?: LocalizedText; caption?: LocalizedText };

const isRemotePostcard = (item: unknown): item is RemotePostcard =>
  typeof item === 'string' ||
  (typeof item === 'object' && item !== null && typeof (item as { url?: unknown }).url === 'string');

/**
 * `background_urls` config'i iki formatı da kabul eder:
 * eski düz URL listesi ["url", ...] ya da [{ url, title, caption }, ...].
 */
export async function fetchPostcards(): Promise<Postcard[]> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/app_config?key=eq.background_urls&select=value`,
      {headers},
    );

    if (!response.ok) {
      console.log('Failed to fetch postcards:', response.status);
      return [];
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return [];
    }

    const items: unknown = JSON.parse(data[0].value);
    if (!Array.isArray(items)) return [];

    return items.filter(isRemotePostcard).map(item =>
      typeof item === 'string'
        ? {source: {uri: item}}
        : {source: {uri: item.url}, title: item.title, caption: item.caption},
    );
  } catch (error) {
    console.log('Failed to fetch postcards:', error);
    return [];
  }
}

export async  function fetchAdSettings(): Promise<AppSettings> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/app_config?key=eq.ad_settings&select=value`,
      {headers, signal: controller.signal},
    );
    clearTimeout(timeout);

    if (!response.ok) {
      console.log('Failed to fetch ad settings:', response.status);
      return {};
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return {};
    }

    return JSON.parse(data[0].value);
  } catch (error) {
    console.log('Failed to fetch ad settings:', error);
    return {};
  }
}


export async function fetchDailyChallenge(date: string): Promise<LevelDefinition | null> {
  try {
    // Board'u embed ederek yalnızca o günün board'u gelir; boards tablosu her daily ile büyüyor
    const [challengeRes, piecesRes] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/daily_challenges?date=eq.${date}&select=piece_ids,board:boards(matrix)`,
        {headers},
      ),
      fetch(`${SUPABASE_URL}/rest/v1/pieces?select=id,matrix`, {headers}),
    ]);

    if (!challengeRes.ok || !piecesRes.ok) {
      console.log('Failed to fetch daily challenge');
      return null;
    }

    const [challenges, pieces]: [
      {piece_ids: number[]; board: {matrix: Board} | null}[],
      {id: number; matrix: PieceMatrix}[],
    ] = await Promise.all([challengeRes.json(), piecesRes.json()]);

    const challenge = challenges[0];
    if (!challenge?.board) return null;

    const pieceMap = new Map<number, PieceMatrix>(pieces.map(p => [p.id, p.matrix]));
    const resolvedPieces = challenge.piece_ids
      .map(id => pieceMap.get(id))
      .filter((m): m is PieceMatrix => m !== undefined);

    // Eksik parça varsa bulmaca çözülemez; hiç göstermemek daha iyi
    if (resolvedPieces.length !== challenge.piece_ids.length) return null;

    return {board: challenge.board.matrix, pieces: resolvedPieces};
  } catch (error) {
    console.log('Failed to fetch daily challenge:', error);
    return null;
  }
}

// Tablolara doğrudan yazma kapalı; oyuncu ve skor yalnızca RPC ile yazılır.
// Aynı cihaz tekrar kaydolursa yeni oyuncu açılmaz, nickname güncellenir.
export async function createPlayer(deviceId: string, nickname: string): Promise<Player | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/register_player`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_device_id: deviceId, p_nickname: nickname }),
    });
    if (!response.ok) return null;
    const data: Player[] = await response.json();
    return data[0] ?? null;
  } catch {
    return null;
  }
}

// Sunucu, device_id'nin oyuncuya ait olduğunu doğrular ve yalnızca daha yüksek skoru yazar
export async function submitScore(
  playerId: string,
  levelNumber: number,
  score: number,
  moves: number,
  time: number,
): Promise<void> {
  try {
    const deviceId = await DeviceInfo.getUniqueId();
    await fetch(`${SUPABASE_URL}/rest/v1/rpc/submit_score`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        p_player_id: playerId,
        p_device_id: deviceId,
        p_level_number: levelNumber,
        p_score: score,
        p_moves: moves,
        p_time: time,
      }),
    });
  } catch {
    // Fire and forget — hata olursa sessizce geç
  }
}

export async function fetchLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/leaderboard_total?order=total_score.desc&limit=${limit}`,
      { headers },
    );
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

export async function fetchAllLevels(): Promise<LevelDefinition[]> {
  try {
    // Tüm tabloları paralel çek
    const [levelsRes, boardsRes, piecesRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/levels?select=*&order=level_number`, {headers}),
      fetch(`${SUPABASE_URL}/rest/v1/boards?select=*`, {headers}),
      fetch(`${SUPABASE_URL}/rest/v1/pieces?select=*`, {headers}),
    ]);

    if (!levelsRes.ok || !boardsRes.ok || !piecesRes.ok) {
      console.log('Failed to fetch levels data');
      return [];
    }

    const [levels, boards, pieces] = await Promise.all([
      levelsRes.json(),
      boardsRes.json(),
      piecesRes.json(),
    ]);

    // Map'ler oluştur
    const boardMap = new Map<number, Board>(
      boards.map((b: {id: number; matrix: Board}) => [b.id, b.matrix]),
    );
    const pieceMap = new Map<number, PieceMatrix>(
      pieces.map((p: {id: number; matrix: PieceMatrix}) => [p.id, p.matrix]),
    );

    // Level'ları LevelDefinition formatına çevir
    return levels.map((level: {board_id: number; piece_ids: number[]}) => ({
      board: boardMap.get(level.board_id)!,
      pieces: level.piece_ids.map(id => pieceMap.get(id)!),
    }));
  } catch (error) {
    console.log('Failed to fetch levels:', error);
    return [];
  }
}
