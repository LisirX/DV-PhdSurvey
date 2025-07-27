<template>
  <div class="year-slider-wrapper">
    <div class="label">
      <span>选择年份区间：</span>
      <span class="years">{{ yearRange[0] }} - {{ yearRange[1] }}</span>
    </div>

    <el-slider
      v-model="yearRange"
      :min="MinYear"
      :max="MaxYear"
      range
      :step="1"
      @change="onSliderChange"
      show-stops
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'

const props = defineProps<{
  MinYear: number
  MaxYear: number
}>()

const emit = defineEmits<{
  (e: 'SelectNewYears', value: number[]): void
}>()

// 初始选择区间：最小到最大
const yearRange = ref<number[]>([props.MinYear, props.MaxYear])

function onSliderChange(value: number[]) {
  emit('SelectNewYears', value)
}
</script>

<style scoped>
.year-slider-wrapper {
  padding: 20px;
  max-width: 500px;
}

.label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-weight: bold;
}

.years {
  color: #409EFF;
}
</style>
