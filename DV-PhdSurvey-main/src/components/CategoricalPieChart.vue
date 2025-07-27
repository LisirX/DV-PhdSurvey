<!-- src/components/CategoricalPieChart.vue -->
<template>
  <el-card shadow="hover" style="margin-bottom: 20px;">
    <div ref="chartDom" :style="chartStyle"></div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, defineProps } from 'vue';
import * as echarts from 'echarts/core';
import type { EChartsOption } from 'echarts';
import { PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { SurveyResponse } from '@/models';
import { colorMapping, FALLBACK_COLOR, categoryOrderMapping } from '@/util/colors';

// 保持与您原始代码一致的 echarts.use()
echarts.use([PieChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const props = defineProps<{
  surveyData: SurveyResponse[] | { difficulty: string, value: number }[];
  title: string;
  dataKey: keyof SurveyResponse | 'difficulty';
  categoryOrder?: string[];
}>();

const chartDom = ref<HTMLDivElement | null>(null);
let myChart: echarts.ECharts | null = null;

const chartStyle = {
  height: '350px',
  width: '100%'
};

// --- 核心简化区域 ---

/**
 * 将原始 props 数据处理成 ECharts 饼图所需的格式
 * 包括：计算数量、应用颜色、添加ID以支持动画、排序
 */
const processedChartData = computed(() => {
  if (!props.surveyData || props.surveyData.length === 0) {
    return [];
  }

  // 1. 计算每个类别的数量
  let counts: Record<string, number>;
  if (props.dataKey === 'difficulty' && typeof props.surveyData[0] === 'object' && 'difficulty' in props.surveyData[0]) {
    counts = Object.fromEntries(
      (props.surveyData as { difficulty: string; value: number }[]).map(item => [item.difficulty, item.value])
    );
  } else {
    counts = (props.surveyData as SurveyResponse[]).reduce((acc, item) => {
      const key = item[props.dataKey as keyof SurveyResponse] as string;
      if (key) {
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  }

  // 2. 转换为 ECharts 格式并应用颜色/ID
  const dataForChart = Object.entries(counts).map(([name, value]) => ({
    id: name, // 为平滑过渡动画提供稳定ID
    name,
    value,
    itemStyle: {
      color: colorMapping[name] || FALLBACK_COLOR
    }
  }));

  // 3. 按预定义顺序排序
  const order = props.categoryOrder || categoryOrderMapping[props.dataKey as string];
  if (order) {
    dataForChart.sort((a, b) => {
      const indexA = order.indexOf(a.name);
      const indexB = order.indexOf(b.name);
      return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
    });
  }
  
  return dataForChart;
});


/**
 * chartOptions 现在只负责组装，不负责计算
 */
const chartOptions = computed((): EChartsOption => {
  const data = processedChartData.value;
  
  if (data.length === 0) {
    return { title: { text: props.title, subtext: '无可用数据', left: 'center', top: 'center' } };
  }

  return {
    title: {
      text: props.title,
      left: 'center',
      top: 15,
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      type: 'scroll',
      itemGap: 10,
      data: data.map(item => item.name) // 直接从数据派生图例
    },
    series: [{
      name: props.title,
      type: 'pie',
      radius: ['20%', '70%'],
      center: ['65%', '55%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: { show: false, position: 'center' },
      emphasis: {
        label: { show: true, fontSize: '14', fontWeight: 'bold', position: 'center' },
        labelLine: { show: false }
      },
      data: data
    }]
  };
});

// --- 生命周期钩子和 Watcher ---

onMounted(() => {
  if (chartDom.value) {
    myChart = echarts.init(chartDom.value);
    myChart.setOption(chartOptions.value);
    window.addEventListener('resize', () => myChart?.resize());
  }
});

// 唯一需要的 Watcher，用于响应式更新图表
watch(chartOptions, (newOptions) => {
  if (myChart) {
    // 使用 `false` 进行合并更新，以启用平滑动画
    myChart.setOption(newOptions, false);
  }
}, { deep: true }); // 使用 deep watch 确保对嵌套对象的更改也能被侦测到


const resizeChart = () => { myChart?.resize(); };
defineExpose({ resizeChart });
</script>