import { LevelDefinition } from './types.ts';

export type RootStackParamList = {
  HomeScreen: undefined;
  GameScreen: { levelNumber: number; dailyChallenge?: LevelDefinition; mode?: 'daily' };
  LevelSelect: undefined;
  Settings: undefined;
};
