<!-- src/components/SatisfactionTrendChart.vue -->
<template>
  <el-card shadow="hover">
    <div ref="chartDom" style="height: 400px; width: 100%;"></div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, defineProps } from 'vue';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { SurveyResponse } from '@/models';
// 引入颜色映射
import { colorMapping, FALLBACK_COLOR } from '@/util/colors';

echarts.use([LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

const props = defineProps<{ surveyData: SurveyResponse[] }>();
const chartDom = ref<HTMLDivElement | null>(null);
let myChart: echarts.ECharts | null = null;

const satisfactionDimensions = [{ key: 'satisfactionStudyPeriod', name: '求学' }, { key: 'satisfactionFunding', name: '经费' }, { key: 'satisfactionWorkHours', name: '工时' }, { key: 'satisfactionFreedom', name: '自由度' }, { key: 'satisfactionPay', name: '薪资' }];
const surveyYears: number[] = [2017, 2019, 2022];

const chartOptions = computed(() => {
  const seriesData = satisfactionDimensions.map(dimension => {
    const dataPoints = surveyYears.map(year => {
      const yearData = props.surveyData.filter(d => d.dataYear === year);
      if (yearData.length === 0) return null;
      const sum = yearData.reduce((acc, current) => acc + (current as any)[dimension.key], 0);
      return parseFloat((sum / yearData.length).toFixed(3));
    });
    // 关键改动：为每个系列分配固定颜色
    return { 
      name: dimension.name, 
      type: 'line', 
      smooth: true, 
      data: dataPoints, 
      emphasis: { focus: 'series' },
      color: colorMapping[dimension.name] || FALLBACK_COLOR // 使用映射颜色
    };
  });

  return {
    title: { text: '各项满意度平均值趋势', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: satisfactionDimensions.map(d => d.name), top: 50, type: 'scroll' },
    grid: { top: 100, left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: surveyYears.map(String) },
    yAxis: { type: 'value', scale: true },
    series: seriesData,
  };
});

onMounted(() => {
  if (chartDom.value) {
    myChart = echarts.init(chartDom.value);
    myChart.setOption(chartOptions.value);
    window.addEventListener('resize', () => myChart?.resize());
  }
});

watch(chartOptions, (newOptions) => {
  if (myChart) {
    myChart.setOption(newOptions, true);
  }
});

const resizeChart = () => { myChart?.resize(); };
defineExpose({ resizeChart });
</script>