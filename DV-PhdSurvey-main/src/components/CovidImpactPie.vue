<template>
  <div ref="chartDom" class="chart-canvas"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// ECharts 按需引入
echarts.use([
  PieChart,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer
]);

// 定义 props 和 emits
const props = defineProps({
  pieData: {
    type: Array,
    required: true,
    default: () => [],
  }
});
const emit = defineEmits(['select-impact']);

// ECharts 实例和 DOM 引用
const chartDom = ref(null);
let chartInstance = null;

// 新增：用于追踪组件内部选中状态的 ref
const internalSelectedNames = ref([]);

// 核心：动态计算图表配置
const chartOptions = computed(() => {
  // 检查当前是否有任何扇区被选中
  const isAnythingSelected = internalSelectedNames.value.length > 0;

  // 动态生成 series 数据，根据选中状态调整样式
  const dynamicPieData = props.pieData.map(item => {
    const isSelected = internalSelectedNames.value.includes(item.name);
    return {
      ...item, // 继承原始数据
      itemStyle: {
        ...item.itemStyle, // 继承原始 itemStyle (如颜色)
        // 如果有任何项被选中，且当前项【未被选中】，则降低其不透明度
        opacity: isAnythingSelected && !isSelected ? 0.4 : 1,
      },
    };
  });

  return {
    tooltip: { 
      trigger: 'item', 
      formatter: '{b}: {c} ({d}%)' 
    },
    legend: { 
      orient: 'horizontal', 
      bottom: '20%', 
      data: props.pieData.map(p => p.name),
      // 增加图例与图表的间距
      padding: [20, 0, 0, 0],
    },
    series: [{
      name: '疫情影响',
      type: 'pie',
      radius: ['25%', '60%'], // 调整为圆环图，视觉效果更现代
      center: ['50%', '46%'], // 向上微调，为图例留出空间
      selectedMode: 'multiple',
      itemStyle: { 
        borderRadius: 8, 
        borderColor: '#fff', 
        borderWidth: 2 
      },
      label: { 
        show: true, 
        formatter: '{b}\n{d}%', 
        fontSize: 13 
      },
      labelLine: { 
        length: 10, 
        length2: 15 
      },
      
      // 核心：定义【选中状态】下的样式
      select: {
        itemStyle: {
          shadowBlur: 12,
          shadowColor: 'rgba(0, 0, 0, 0.4)'
        },
        label: {
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      
      // 鼠标悬浮时的样式
      emphasis: { 
        label: { 
          show: true, 
          fontSize: 14, 
          fontWeight: 'bold' 
        } 
      },
      
      // 使用我们动态生成的 data
      data: dynamicPieData, 
    }]
  };
});

// 渲染或更新图表
const renderChart = () => {
  if (chartInstance) {
    chartInstance.setOption(chartOptions.value);
  }
};

// --- 生命周期钩子 ---

onMounted(() => {
  if (!chartDom.value) return;

  chartInstance = echarts.init(chartDom.value);

  // 监听 ECharts 的选中状态变化事件
  chartInstance.on('selectchanged', (params) => {
    let selectedNames = [];

    // 从事件参数中安全地提取所有选中项的名称
    if (params.selected && params.selected.length > 0) {
      const selectionInfo = params.selected[0];
      const selectedDataIndices = selectionInfo.dataIndex;
      selectedNames = selectedDataIndices.map(index => {
        return props.pieData[index]?.name;
      }).filter(Boolean); // 过滤掉可能因数据不同步产生的 null
    }
    
    // 1. 更新内部状态，这将触发 chartOptions 的重新计算
    internalSelectedNames.value = selectedNames;
    
    // 2. 将选中的名称列表发送给父组件
    emit('select-impact', selectedNames);
  });
  
  // 初始渲染
  renderChart();
});

onUnmounted(() => {
  chartInstance?.dispose();
});

// --- 侦听器 ---

// 当父组件传入的数据变化时，重新渲染图表
watch(() => props.pieData, () => {
  renderChart();
}, { deep: true });
</script>

<style scoped>
.chart-canvas {
  width: 100%;
  height: 100%;
}
</style>