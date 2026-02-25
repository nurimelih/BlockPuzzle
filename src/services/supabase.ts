import {
  LevelDefinition,
  PieceMatrix,
  Board,
  AppSettings,
} from '../types/types.ts';

export type Player = {
  id: string;
  device_id: string;
  nickname: string;
  created_at: string;
};

export type LeaderboardEntry = {
  player_id: string;
  nickname: string;
  total_score: number;
  levels_completed: number;
};

const SUPABASE_URL = 'https://zngtmhzwpsqfqkfawobr.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZ3RtaHp3cHNxZnFrZmF3b2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MzI3MjYsImV4cCI6MjA4NTIwODcyNn0.753amyfGAlxoA4H7OyQ6w-FwfG5feAgZOPqIOHtEAxM';

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

export async function fetchBackgroundUrls(): Promise<string[]> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/app_config?key=eq.background_urls&select=value`,
      {headers},
    );

    if (!response.ok) {
      console.log('Failed to fetch background URLs:', response.status);
      return [];
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return [];
    }

    // value JSON array olarak saklanıyor: ["url1", "url2", ...]
    const urls = JSON.parse(data[0].value);
    return Array.isArray(urls) ? urls : [];
  } catch (error) {
    console.log('Failed to fetch background URLs:', error);
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
    const [challengeRes, boardsRes, piecesRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/daily_challenges?date=eq.${date}&select=*`, {headers}),
      fetch(`${SUPABASE_URL}/rest/v1/boards?select=*`, {headers}),
      fetch(`${SUPABASE_URL}/rest/v1/pieces?select=*`, {headers}),
    ]);

    if (!challengeRes.ok || !boardsRes.ok || !piecesRes.ok) {
      console.log('Failed to fetch daily challenge');
      return null;
    }

    const [challenges, boards, pieces] = await Promise.all([
      challengeRes.json(),
      boardsRes.json(),
      piecesRes.json(),
    ]);

    if (!challenges || challenges.length === 0) return null;

    const challenge = challenges[0];
    const boardMap = new Map<number, Board>(
      boards.map((b: {id: number; matrix: Board}) => [b.id, b.matrix]),
    );
    const pieceMap = new Map<number, PieceMatrix>(
      pieces.map((p: {id: number; matrix: PieceMatrix}) => [p.id, p.matrix]),
    );

    const board = boardMap.get(challenge.board_id);
    if (!board) return null;

    return {
      board,
      pieces: challenge.piece_ids.map((id: number) => pieceMap.get(id)!).filter(Boolean),
    };
  } catch (error) {
    console.log('Failed to fetch daily challenge:', error);
    return null;
  }
}

export async function createPlayer(deviceId: string, nickname: string): Promise<Player | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/players`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify({ device_id: deviceId, nickname }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data[0] ?? null;
  } catch {
    return null;
  }
}

export async function submitScore(
  playerId: string,
  levelNumber: number,
  score: number,
  moves: number,
  time: number,
): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/scores`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({ player_id: playerId, level_number: levelNumber, score, moves, time }),
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
