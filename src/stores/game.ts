import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Question, Answer, Feedback, GameState } from '../types';

export const useGameStore = defineStore('game', () => {
  const questions = ref<Question[]>([]);
  const answers = ref<Answer[]>([]);
  const feedback = ref<Feedback | null>(null);
  const score = ref(0);

  // Helper function to generate random questions
  function generateQuestions(count: number): Question[] {
    const newQuestions: Question[] = [];
    while (newQuestions.length < count) {
      const a = Math.floor(Math.random() * 11) + 1; // 1-11
      const b = Math.floor(Math.random() * 10) + 1; // 1-10
      if (a + b <= 20 && !newQuestions.some(q => q.a === a && q.b === b)) {
        newQuestions.push({
          id: newQuestions.length,
          a,
          b,
          sum: a + b,
          answer: null
        });
      }
    }
    return newQuestions;
  }

  // Helper function to generate unique distractors
  function getUniqueDistractors(correctAnswers: number[], count: number): number[] {
    const distractors = new Set<number>();
    while (distractors.size < count) {
      const val = Math.floor(Math.random() * 20) + 1;
      if (!correctAnswers.includes(val)) {
        distractors.add(val);
      }
    }
    return Array.from(distractors);
  }

  // Initialize or reset the game
  function initializeGame() {
    const newQuestions = generateQuestions(4);
    questions.value = newQuestions;
    
    const correctAnswers = newQuestions.map(q => q.sum);
    const distractors = getUniqueDistractors(correctAnswers, 4);
    const allAnswers = [...correctAnswers, ...distractors]
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: `answer-${value}-${index}`,
        value
      }));
    
    answers.value = allAnswers;
    feedback.value = null;
    score.value = 0;
  }

  // Handle answer placement
  function placeAnswer(questionId: number, answerId: string) {
    const question = questions.value.find(q => q.id === questionId);
    const answer = answers.value.find(a => a.id === answerId);
    
    if (!question || !answer) return;
    
    question.answer = answer.value;
    answers.value = answers.value.filter(a => a.id !== answerId);
    
    // Check if answer is correct
    if (question.sum === answer.value) {
      score.value += 1;
      feedback.value = {
        type: 'success',
        message: 'Great job!',
        questionId
      };
    } else {
      feedback.value = {
        type: 'error',
        message: 'Try again!',
        questionId
      };
    }
  }

  // Remove answer from question
  function removeAnswer(questionId: number) {
    const question = questions.value.find(q => q.id === questionId);
    if (!question || question.answer === null) return;
    
    answers.value.push({
      id: `answer-${question.answer}-${answers.value.length}`,
      value: question.answer
    });
    question.answer = null;
  }

  // Clear feedback after delay
  function clearFeedback() {
    feedback.value = null;
  }

  return {
    questions,
    answers,
    feedback,
    score,
    initializeGame,
    placeAnswer,
    removeAnswer,
    clearFeedback
  };
}); 