<template>
  <BaseChart :options="chartOptions" />
</template>

<script setup>
import { computed, defineProps } from 'vue';
import BaseChart from '@/components/BaseChart.vue';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { TooltipComponent, GridComponent } from 'echarts/components';

echarts.use([LineChart, TooltipComponent, GridComponent]);

const props = defineProps({
  filteredData: { type: Array, required: true }
});

const workHourRangeToValue = (range) => {
    switch (range) {
        case '<11': return 5.5; case '11-20': return 15.5; case '21-30': return 25.5;
        case '31-40': return 35.5; case '41-50': return 45.5; case '51-60': return 55.5;
        case '61-70': return 65.5; case '71-80': return 75.5; case '>80': return 85;
        default: return 0;
    }
};

const chartOptions = computed(() => {
  const years = [2017, 2019, 2022];
  const avgHours = years.map(year => {
    const yearData = props.filteredData.filter(d => d.dataYear === year);
    if (yearData.length === 0) return 0;
    const totalHours = yearData.reduce((sum, item) => sum + workHourRangeToValue(item.avgWeeklyWorkHours), 0);
    return parseFloat((totalHours / yearData.length).toFixed(2));
  });

  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: years },
    yAxis: { type: 'value', name: 'Hours', min: 40, max: 60 },
    series: [{
      name: 'Avg Weekly Work Hours',
      type: 'line',
      smooth: true,
      data: avgHours,
      areaStyle: {}
    }]
  };
});
</script>