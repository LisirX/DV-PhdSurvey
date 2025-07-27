<template>
    <BaseChart :options="chartOptions" @chart-click="handleClick" />
  </template>
  
  <script setup>
  import { computed, defineProps, defineEmits } from 'vue';
  import BaseChart from '@/components/BaseChart.vue';
  import * as echarts from 'echarts/core';
  import { BarChart } from 'echarts/charts';
  import { TooltipComponent, GridComponent } from 'echarts/components';
  
  echarts.use([BarChart, TooltipComponent, GridComponent]);
  
  const props = defineProps({
    satisfactionData: { type: Array, required: true },
    selectedBin: { type: String, default: null }
  });
  
  const emit = defineEmits(['select-bin']);
  
  const chartOptions = computed(() => {
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: props.satisfactionData.map(d => d.label), axisLabel: { interval: 0, rotate: 30 } },
      yAxis: { type: 'value', name: 'Sample Count' },
      series: [{
        name: 'Sample Count',
        type: 'bar',
        barWidth: '60%',
        data: props.satisfactionData.map(d => ({
          value: d.count,
          itemStyle: { color: d.label === props.selectedBin ? '#3b82f6' : '#a5b4fc' }
        })),
        emphasis: { itemStyle: { color: '#4f46e5' } }
      }]
    };
  });
  
  function handleClick(params) {
    emit('select-bin', params.name);
  }
  </script>