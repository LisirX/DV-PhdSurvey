<template>
  <BaseChart :options="chartOptions" />
</template>

<script setup>
import { computed, defineProps } from 'vue';
import BaseChart from './BaseChart.vue';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';

echarts.use([BarChart, TooltipComponent, GridComponent, LegendComponent]);

const props = defineProps({
  filteredData: { type: Array, required: true }
});

const chartOptions = computed(() => {
  const years = [2017, 2019, 2022];
  // 【修改点 1】: 我们只关心 'Yes' 和 'No'
  const helpOptions = ['Yes', 'No']; 
  
  const series = helpOptions.map(option => ({
    name: option,
    type: 'bar',
    stack: 'total',
    label: { show: true, formatter: '{c}%' },
    emphasis: { focus: 'series' },
    data: years.map(year => {
      const yearData = props.filteredData.filter(d => d.dataYear === year);
      
      // 【修改点 2】: 计算新的分母，即 'Yes' 和 'No' 的总数
      const validTotal = yearData.filter(d => d.soughtMentalHealthHelp === 'Yes' || d.soughtMentalHealthHelp === 'No').length;
      
      // 如果没有有效数据，则返回 0
      if (validTotal === 0) return 0;
      
      const count = yearData.filter(d => d.soughtMentalHealthHelp === option).length;
      
      // 使用新的分母计算百分比
      return parseFloat(((count / validTotal) * 100).toFixed(1));
    })
  }));
  
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    // 【修改点 3】: 图例也只显示 'Yes' 和 'No'
    legend: { data: helpOptions }, 
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: years },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    series: series
  };
});
</script>