<template>
  <div class="card h-100">
    <div class="card-body d-flex flex-column align-items-center">
      <h3 class="card-title mb-4">{{ question.a }} + {{ question.b }} =</h3>
      <div
        class="answer-slot p-3 border rounded-3 mb-3"
        :class="{ 'bg-light': !question.answer }"
        @dragover.prevent
        @drop="handleDrop"
      >
        <template v-if="question.answer !== null">
          <div
            class="answer-tile"
            draggable="true"
            @dragstart="handleDragStart"
            @dragend="handleDragEnd"
          >
            {{ question.answer }}
          </div>
        </template>
        <template v-else>
          <span class="text-muted">?</span>
        </template>
      </div>
      <div
        v-if="feedback && feedback.questionId === question.id"
        class="feedback-message"
        :class="feedback.type === 'success' ? 'text-success' : 'text-danger'"
      >
        {{ feedback.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Question, Feedback } from '../types';
import { useGameStore } from '../stores/game';

const props = defineProps<{
  question: Question;
}>();

const store = useGameStore();

const feedback = computed(() => store.feedback);

function handleDrop(event: DragEvent) {
  const answerId = event.dataTransfer?.getData('text/plain');
  if (answerId) {
    store.placeAnswer(props.question.id, answerId);
    setTimeout(() => store.clearFeedback(), 1000);
  }
}

function handleDragStart(event: DragEvent) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', `answer-${props.question.answer}`);
    event.dataTransfer.effectAllowed = 'move';
  }
}

function handleDragEnd() {
  store.removeAnswer(props.question.id);
}
</script>

<style scoped>
.answer-slot {
  min-height: 60px;
  min-width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.answer-tile {
  background-color: #4CAF50;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: move;
  user-select: none;
  transition: transform 0.2s ease;
}

.answer-tile:hover {
  transform: scale(1.05);
}

.feedback-message {
  font-weight: bold;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 