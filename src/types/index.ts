export interface Question {
  id: number;
  a: number;
  b: number;
  sum: number;
  answer: number | null;
}

export interface Answer {
  id: string;
  value: number;
}

export interface Feedback {
  type: 'success' | 'error';
  message: string;
  questionId: number;
}

export interface GameState {
  questions: Question[];
  answers: Answer[];
  feedback: Feedback | null;
  score: number;
} 