<template>
  <div class="math-game">
    <h1 class="text-center mb-4">Math Addition Game</h1>
    <div class="game-container">
      <div class="game-layout">
        <div class="drawing-section">
          <DrawingPad />
        </div>
        <div class="game-section">
          <div class="questions-grid">
            <div v-for="(problem, index) in problems" :key="index" class="problem-card">
              <div class="problem-display" @dragover.prevent @drop="dropAnswer($event, index)">
                <span class="number">{{ problem.num1 }}</span>
                <span class="operator">+</span>
                <span class="number">{{ problem.num2 }}</span>
                <span class="operator">=</span>
                <div
                  class="answer-slot"
                  :class="{
                    'has-answer': problem.userAnswer !== null,
                    correct: problem.isCorrect,
                    incorrect: problem.userAnswer !== null && !problem.isCorrect,
                    shake: problem.isShaking,
                  }"
                >
                  <span v-if="problem.userAnswer !== null">{{ problem.userAnswer }}</span>
                  <ConfettiExplosion v-if="problem.showConfetti" />
                </div>
              </div>
            </div>
          </div>

          <div class="answers-container">
            <div
              v-for="answerCard in availableAnswers"
              :key="answerCard.id"
              class="answer-card"
              draggable="true"
              @dragstart="dragStart($event, answerCard.id)"
              :class="{ used: answerCard.used }"
            >
              {{ answerCard.value }}
            </div>
          </div>

          <div class="score-display" v-if="showScore">
            <div class="score-text" :class="{ perfect: score === problems.length }">
              Score: {{ score }}/{{ problems.length }}
            </div>
          </div>

          <button @click="generateNewProblems" class="next-button" v-if="showScore">
            Next Set of Problems
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import ConfettiExplosion from 'vue-confetti-explosion'
import DrawingPad from './DrawingPad.vue'

interface Problem {
  num1: number
  num2: number
  userAnswer: number | null
  isCorrect?: boolean
  isShaking: boolean
  droppedAnswerCardId: number | null // To track which answer card was dropped here
  showConfetti: boolean // To trigger confetti animation
}

interface AnswerCard {
  id: number
  value: number
  used: boolean
}

const problems = ref<Problem[]>([])
const availableAnswers = ref<AnswerCard[]>([])
const showScore = ref(false)
const score = ref(0)

// Sound effects
const correctSound = new Audio('/sounds/correct.mp3')
const incorrectSound = new Audio('/sounds/incorrect.mp3')
const successSound = new Audio('/sounds/success.mp3')

const generateNewProblems = () => {
  // Generate 10 random problems
  problems.value = Array.from({ length: 10 }, () => ({
    num1: Math.floor(Math.random() * 10),
    num2: Math.floor(Math.random() * 10),
    userAnswer: null,
    isCorrect: false,
    isShaking: false,
    droppedAnswerCardId: null,
    showConfetti: false, // Initialize showConfetti
  }))

  // Generate all possible answers
  const allAnswers = problems.value.map((p) => p.num1 + p.num2)

  // Add some wrong answers (ensuring some duplicates of correct answers)
  const wrongAnswers = Array.from({ length: 6 }, () => Math.floor(Math.random() * 20))

  // Combine all answers and create answer cards with unique IDs
  const combinedAnswers = [...allAnswers, ...wrongAnswers]
  availableAnswers.value = combinedAnswers
    .map((value, index) => ({
      id: index, // Simple unique ID for each card
      value: value,
      used: false,
    }))
    .sort(() => Math.random() - 0.5) // Shuffle the answer cards

  showScore.value = false
  score.value = 0
}

const allQuestionsAnswered = computed(() => {
  return problems.value.every((p) => p.userAnswer !== null)
})

const isAnswerUsed = (answer: number) => {
  return problems.value.some((p) => p.userAnswer === answer)
}

const dragStart = (event: DragEvent, answerCardId: number) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', answerCardId.toString())
  }
}

const playShakeAnimation = (index: number) => {
  problems.value[index].isShaking = true
  setTimeout(() => {
    problems.value[index].isShaking = false
  }, 500)
}

const dropAnswer = async (event: DragEvent, problemIndex: number) => {
  const answerCardId = parseInt(event.dataTransfer?.getData('text/plain') || '-1')
  const droppedAnswerCard = availableAnswers.value.find((card) => card.id === answerCardId)
  const problem = problems.value[problemIndex]

  if (!droppedAnswerCard || droppedAnswerCard.used) {
    // If the card is not found or already used (shouldn't happen with correct dragStart, but good check)
    playShakeAnimation(problemIndex)
    return
  }

  // If there was a previous answer in this slot, mark the old card as unused
  if (problem.droppedAnswerCardId !== null) {
    const previousAnswerCard = availableAnswers.value.find(
      (card) => card.id === problem.droppedAnswerCardId,
    )
    if (previousAnswerCard) {
      previousAnswerCard.used = false
    }
  }

  // Assign the new answer card to the problem slot
  problem.userAnswer = droppedAnswerCard.value
  problem.droppedAnswerCardId = droppedAnswerCard.id
  droppedAnswerCard.used = true

  const correctAnswer = problem.num1 + problem.num2
  problem.isCorrect = problem.userAnswer === correctAnswer

  // Play sound effect and handle incorrect answer reset
  if (problem.isCorrect) {
    correctSound.play()
    // Trigger confetti animation
    problem.showConfetti = false // Resetting before setting to true is important for re-triggering
    await nextTick()
    problem.showConfetti = true
  } else {
    incorrectSound.play()
    playShakeAnimation(problemIndex)

    // Reset the answer after a short delay
    setTimeout(() => {
      problem.userAnswer = null
      problem.isCorrect = false
      // Mark the specific card that was dropped here as unused
      if (problem.droppedAnswerCardId !== null) {
        const cardToReset = availableAnswers.value.find(
          (card) => card.id === problem.droppedAnswerCardId,
        )
        if (cardToReset) {
          cardToReset.used = false
        }
        problem.droppedAnswerCardId = null
      }
    }, 1000) // Reset after 1 second
  }

  // Check if all questions are answered (correctly or incorrectly)
  if (allQuestionsAnswered.value) {
    const correctCount = problems.value.filter((p) => p.isCorrect).length
    score.value = correctCount
    showScore.value = true

    if (correctCount === problems.value.length) {
      successSound.play()
    }
  }
}

// Generate first set of problems when component mounts
generateNewProblems()
</script>

<style scoped>
.math-game {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

.game-container {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.game-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .game-layout {
    grid-template-columns: 1fr;
  }

  .drawing-section {
    min-width: unset;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
  }

  .questions-grid {
    grid-template-columns: 1fr;
  }

  .math-game {
    padding: 10px;
  }

  .game-container {
    padding: 15px;
  }

  h1 {
    font-size: 1.5rem;
  }
}

.drawing-section {
  min-width: 300px;
}

.game-section {
  flex: 1;
}

.questions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.problem-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.problem-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 1.2rem;
}

.number {
  font-weight: bold;
  color: var(--primary-color);
}

.operator {
  color: var(--secondary-color);
}

.answer-slot {
  min-width: 40px;
  height: 40px;
  border: 2px dashed #ccc;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  transition: all 0.3s ease;
}

.answer-slot.has-answer {
  border-style: solid;
}

.answer-slot.correct {
  border-color: #28a745;
  background-color: #d4edda;
}

.answer-slot.incorrect {
  border-color: #dc3545;
  background-color: #f8d7da;
}

.answer-slot.shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}

.answers-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 10px;
  margin-top: 20px;
}

@media (max-width: 480px) {
  .answers-container {
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  }

  .problem-display {
    font-size: 1rem;
  }

  .answer-slot {
    min-width: 35px;
    height: 35px;
  }
}

.answer-card {
  background: #fff;
  border: 2px solid #007bff;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  cursor: grab;
  user-select: none;
  touch-action: none;
  transition: all 0.2s ease;
}

.answer-card:active {
  cursor: grabbing;
  transform: scale(0.95);
}

.answer-card.used {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #ccc;
}

.score-display {
  text-align: center;
  margin: 20px 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.score-text {
  padding: 10px 20px;
  border-radius: 5px;
  background-color: #f8f9fa;
  display: inline-block;
}

.score-text.perfect {
  background-color: #e8f5e9;
  color: #2e7d32;
  animation: celebrate 1s ease;
}

.next-button {
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s ease;
}

.next-button:hover {
  background-color: #0056b3;
}

@media (max-width: 480px) {
  .next-button {
    width: 100%;
    padding: 12px;
  }
}

@keyframes celebrate {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Style for vue-confetti-explosion */
:deep(.confetti-explosion) {
  position: absolute !important;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
