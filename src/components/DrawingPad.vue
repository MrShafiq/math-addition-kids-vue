<template>
  <div class="drawing-pad">
    <div class="canvas-section">
      <canvas
        ref="canvas1"
        @mousedown="startDrawing($event, 1)"
        @mousemove="draw($event, 1)"
        @mouseup="stopDrawing(1)"
        @mouseleave="stopDrawing(1)"
        @touchstart="handleTouchStart($event, 1)"
        @touchmove="handleTouchMove($event, 1)"
        @touchend="stopDrawing(1)"
      ></canvas>
      <div class="controls">
        <button @click="clearCanvas(1)" class="btn btn-sm btn-outline-primary">Clear</button>
        <input type="color" v-model="strokeColor1" class="color-picker" title="Choose color" />
        <input
          type="range"
          v-model="strokeWidth1"
          min="1"
          max="20"
          class="stroke-width"
          title="Brush size"
        />
      </div>
    </div>
    <div class="canvas-section">
      <canvas
        ref="canvas2"
        @mousedown="startDrawing($event, 2)"
        @mousemove="draw($event, 2)"
        @mouseup="stopDrawing(2)"
        @mouseleave="stopDrawing(2)"
        @touchstart="handleTouchStart($event, 2)"
        @touchmove="handleTouchMove($event, 2)"
        @touchend="stopDrawing(2)"
      ></canvas>
      <div class="controls">
        <button @click="clearCanvas(2)" class="btn btn-sm btn-outline-primary">Clear</button>
        <input type="color" v-model="strokeColor2" class="color-picker" title="Choose color" />
        <input
          type="range"
          v-model="strokeWidth2"
          min="1"
          max="20"
          class="stroke-width"
          title="Brush size"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const canvas1 = ref<HTMLCanvasElement | null>(null)
const canvas2 = ref<HTMLCanvasElement | null>(null)
const isDrawing1 = ref(false)
const isDrawing2 = ref(false)
const strokeColor1 = ref('#000000')
const strokeColor2 = ref('#000000')
const strokeWidth1 = ref(5)
const strokeWidth2 = ref(5)

let ctx1: CanvasRenderingContext2D | null = null
let ctx2: CanvasRenderingContext2D | null = null

onMounted(() => {
  if (canvas1.value && canvas2.value) {
    ctx1 = canvas1.value.getContext('2d')
    ctx2 = canvas2.value.getContext('2d')
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
  }
})

const resizeCanvas = () => {
  if (canvas1.value && canvas2.value) {
    canvas1.value.width = canvas1.value.offsetWidth
    canvas1.value.height = canvas1.value.offsetHeight
    canvas2.value.width = canvas2.value.offsetWidth
    canvas2.value.height = canvas2.value.offsetHeight

    ctx1 = canvas1.value.getContext('2d')
    ctx2 = canvas2.value.getContext('2d')

    if (ctx1) {
      ctx1.lineCap = 'round'
      ctx1.lineJoin = 'round'
    }
    if (ctx2) {
      ctx2.lineCap = 'round'
      ctx2.lineJoin = 'round'
    }
  }
}

const startDrawing = (event: MouseEvent, canvasNumber: number) => {
  if (canvasNumber === 1) {
    isDrawing1.value = true
    draw(event, 1)
  } else {
    isDrawing2.value = true
    draw(event, 2)
  }
}

const draw = (event: MouseEvent, canvasNumber: number) => {
  const isDrawing = canvasNumber === 1 ? isDrawing1.value : isDrawing2.value
  const ctx = canvasNumber === 1 ? ctx1 : ctx2
  const canvas = canvasNumber === 1 ? canvas1.value : canvas2.value
  const strokeColor = canvasNumber === 1 ? strokeColor1.value : strokeColor2.value
  const strokeWidth = canvasNumber === 1 ? strokeWidth1.value : strokeWidth2.value

  if (!isDrawing || !ctx || !canvas) return

  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  ctx.lineWidth = strokeWidth
  ctx.strokeStyle = strokeColor

  ctx.lineTo(x, y)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x, y)
}

const stopDrawing = (canvasNumber: number) => {
  if (canvasNumber === 1) {
    isDrawing1.value = false
    if (ctx1) {
      ctx1.beginPath()
    }
  } else {
    isDrawing2.value = false
    if (ctx2) {
      ctx2.beginPath()
    }
  }
}

const clearCanvas = (canvasNumber: number) => {
  const ctx = canvasNumber === 1 ? ctx1 : ctx2
  const canvas = canvasNumber === 1 ? canvas1.value : canvas2.value
  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}

const handleTouchStart = (event: TouchEvent, canvasNumber: number) => {
  event.preventDefault()
  const touch = event.touches[0]
  const mouseEvent = new MouseEvent('mousedown', {
    clientX: touch.clientX,
    clientY: touch.clientY,
  })
  startDrawing(mouseEvent, canvasNumber)
}

const handleTouchMove = (event: TouchEvent, canvasNumber: number) => {
  event.preventDefault()
  const touch = event.touches[0]
  const mouseEvent = new MouseEvent('mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY,
  })
  draw(mouseEvent, canvasNumber)
}

watch(strokeColor1, (newColor) => {
  if (ctx1) {
    ctx1.strokeStyle = newColor
  }
})

watch(strokeColor2, (newColor) => {
  if (ctx2) {
    ctx2.strokeStyle = newColor
  }
})

watch(strokeWidth1, (newWidth) => {
  if (ctx1) {
    ctx1.lineWidth = newWidth
  }
})

watch(strokeWidth2, (newWidth) => {
  if (ctx2) {
    ctx2.lineWidth = newWidth
  }
})
</script>

<style scoped>
.drawing-pad {
  background: white;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  box-sizing: border-box;
}

.canvas-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

canvas {
  width: 100%;
  height: 250px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.controls {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.color-picker {
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  -webkit-appearance: none;
  background: none;
}

.color-picker::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-picker::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

.stroke-width {
  flex: 1;
  max-width: 100px;
  -webkit-appearance: none;
  height: 4px;
  background: #ddd;
  border-radius: 2px;
  outline: none;
}

.stroke-width::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #007bff;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s ease;
}

.stroke-width::-webkit-slider-thumb:hover {
  background: #0056b3;
}

.btn {
  padding: 6px 12px;
  font-size: 0.9rem;
  white-space: nowrap;
}

@media (max-width: 480px) {
  .drawing-pad {
    padding: 8px;
    gap: 15px;
  }

  canvas {
    height: 200px;
  }

  .controls {
    gap: 8px;
  }

  .color-picker {
    width: 35px;
    height: 35px;
  }

  .stroke-width {
    max-width: 80px;
  }

  .btn {
    padding: 4px 8px;
    font-size: 0.8rem;
  }
}
</style>
