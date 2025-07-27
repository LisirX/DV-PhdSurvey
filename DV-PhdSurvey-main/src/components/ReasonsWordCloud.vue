<!-- src/components/ReasonsWordCloud.vue -->
<template>
  <el-card shadow="hover" style="margin-bottom: 20px;">
    <div ref="chartDom" style="height: 400px; min-height: 350px; width: 100%;"></div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, defineProps, PropType } from 'vue'; // 引入 PropType
import * as echarts from 'echarts/core';
import { TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import 'echarts-wordcloud';
import { SurveyResponse } from '@/models';

echarts.use([TooltipComponent, CanvasRenderer]);

// --- 全局停用词 ---
const globalStopwords = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 
  'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 
  'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 
  'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 
  'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 
  'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 
  'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 
  'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 
  'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 
  'will', 'just', 'don', 'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'want',
  'without'
]);

const MIN_FREQUENCY = 2;

// --- 组件属性定义 ---
const props = defineProps<{
  surveyData: SurveyResponse[];
  title: string;
  dataKey: keyof SurveyResponse;
  // 新增：接收一个可选的、字符串数组类型的自定义停用词属性
  customStopwords?: string[];
}>();

const chartDom = ref<HTMLDivElement | null>(null);
let myChart: echarts.ECharts | null = null;

const chartOptions = computed(() => {
  if (props.surveyData.length === 0) {
    return { title: { text: props.title, subtext: '无可用数据', left: 'center', top: 'center' } };
  }

  // --- NLP 流程 ---

  // 关键改动：将全局停用词和传入的自定义停用词合并成一个总的停用词集合
  const combinedStopwords = new Set([...globalStopwords, ...(props.customStopwords || [])]);

  const allSentences = props.surveyData.flatMap(item => (item[props.dataKey] as string[]) || []);
  const allWords = allSentences.flatMap(sentence => 
    sentence
      .toLowerCase()
      .split(/[\s,.;:!?()'/]+/) // 增加了对单引号的分割
      .filter(word => {
        // 使用合并后的停用词集合进行过滤
        return word && word.length > 1 && !combinedStopwords.has(word);
      })
  );
  
  const wordFrequencies = allWords.reduce((acc, word) => { 
    acc[word] = (acc[word] || 0) + 1; 
    return acc; 
  }, {} as Record<string, number>);
  
  const dataForChart = Object.entries(wordFrequencies)
    .filter(([, value]) => value >= MIN_FREQUENCY)
    .map(([name, value]) => ({ name, value }));

  if (dataForChart.length === 0) {
      return { title: { text: props.title, subtext: `无高频词汇 (频次 > ${MIN_FREQUENCY-1})`, left: 'center', top: 'center' } };
  }
  
  return {
    title: { text: props.title, left: 'center' },
    tooltip: { show: true, formatter: '<b>{b}</b>: {c}' },
    series: [{ 
      type: 'wordCloud', 
      shape: 'circle',
      gridSize: 4,
      sizeRange: [14, 80],
      rotationRange: [-45, 45], 
      textStyle: { 
        color: () => `rgb(${[Math.round(Math.random() * 180), Math.round(Math.random() * 180), Math.round(Math.random() * 180)].join(',')})` 
      }, 
      emphasis: { 
        textStyle: { color: '#000', fontWeight: 'bold' } 
      }, 
      data: dataForChart 
    }],
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

const resizeChart = () => {
  myChart?.resize();
};

defineExpose({
  resizeChart
});
</script>