export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export enum GameState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED',
  ERROR = 'ERROR'
}

export interface QuizConfig {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}