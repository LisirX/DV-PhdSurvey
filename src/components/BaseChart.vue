<template>
    <div ref="chartDom" style="width: 100%; height: 100%;"></div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount, watch, defineProps } from 'vue';
  import * as echarts from 'echarts/core';
  import { CanvasRenderer } from 'echarts/renderers';
  
  // 只注册渲染器，具体的图表和组件由使用它的子组件来注册
  echarts.use([CanvasRenderer]);
  
  const props = defineProps({
    options: {
      type: Object,
      required: true
    }
  });
  
  const emit = defineEmits(['chart-click']);
  
  const chartDom = ref(null);
  let chartInstance = null;
  
  onMounted(() => {
    if (chartDom.value) {
      chartInstance = echarts.init(chartDom.value);
      chartInstance.setOption(props.options);
  
      // 转发点击事件
      chartInstance.on('click', (params) => {
        emit('chart-click', params);
      });
  
      window.addEventListener('resize', resizeChart);
    }
  });
  
  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart);
    if (chartInstance && !chartInstance.isDisposed()) {
      chartInstance.dispose();
    }
  });
  
  watch(() => props.options, (newOptions) => {
    if (chartInstance && !chartInstance.isDisposed()) {
      chartInstance.setOption(newOptions, false);
    }
  }, { deep: true });
  
  function resizeChart() {
    chartInstance?.resize();
  }
  </script>