<template>
  <BaseChart :options="chartOptions" />
</template>

<script setup>
import { computed, defineProps } from 'vue';
import BaseChart from './BaseChart.vue';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';

echarts.use([LineChart, TooltipComponent, GridComponent, LegendComponent]);

const props = defineProps({
  filteredData: { type: Array, required: true }
});

const chartOptions = computed(() => {
  const years = [2017, 2019, 2022];

  const calculatePercentage = (option) => {
    return years.map(year => {
      const yearData = props.filteredData.filter(d => d.dataYear === year);
      
      // 【修改点】: 计算新的分母，即 'Yes' 和 'No' 的总数
      const validTotal = yearData.filter(d => d.soughtMentalHealthHelp === 'Yes' || d.soughtMentalHealthHelp === 'No').length;

      if (validTotal === 0) return 0;
      
      const count = yearData.filter(d => d.soughtMentalHealthHelp === option).length;
      
      // 使用新的分母计算百分比
      return parseFloat(((count / validTotal) * 100).toFixed(1));
    });
  };

  const dataYes = calculatePercentage('Yes');
  const dataNo = calculatePercentage('No');

  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Yes', 'No'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: years },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    series: [
      { name: 'Yes', type: 'line', smooth: true, data: dataYes },
      { name: 'No', type: 'line', smooth: true, data: dataNo }
    ]
  };
});
</script>