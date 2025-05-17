<template>
  <div class="answer-bank p-4 bg-light rounded-3">
    <h4 class="text-center mb-4">Drag your answer here</h4>
    <div class="d-flex flex-wrap gap-3 justify-content-center">
      <div
        v-for="answer in answers"
        :key="answer.id"
        class="answer-tile"
        draggable="true"
        @dragstart="handleDragStart($event, answer)"
      >
        {{ answer.value }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Answer } from '../types';
import { useGameStore } from '../stores/game';

const store = useGameStore();
const answers = computed(() => store.answers);

function handleDragStart(event: DragEvent, answer: Answer) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', answer.id);
    event.dataTransfer.effectAllowed = 'move';
  }
}
</script>

<style scoped>
.answer-bank {
  min-height: 150px;
}

.answer-tile {
  background-color: #2196F3;
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
</style> 