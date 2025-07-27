<!-- src/components/WorkHoursTrendChart.vue -->
<template>
    <el-card shadow="hover">
        <div ref="chartDom" style="height: 200px; width: 100%;"></div>
    </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, defineProps } from 'vue';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { SurveyResponse, WorkHourRange } from '@/models';
// 引入颜色映射
import { colorMapping, FALLBACK_COLOR } from '@/util/colors';

echarts.use([LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

const props = defineProps<{ surveyData: SurveyResponse[] }>();
const chartDom = ref<HTMLDivElement | null>(null);
let myChart: echarts.ECharts | null = null;

const surveyYears: number[] = [2017, 2019, 2022];

const workHourRangeToValue = (range: WorkHourRange): number => { /* ... 函数内容不变 ... */
    switch (range) {
        case '<11': return 5.5; case '11-20': return 15.5; case '21-30': return 25.5;
        case '31-40': return 35.5; case '41-50': return 45.5; case '51-60': return 55.5;
        case '61-70': return 65.5; case '71-80': return 75.5; case '>80': return 85;
        default: return 0;
    }
};

const chartOptions = computed(() => {
    const dataPoints = surveyYears.map(year => {
        const yearData = props.surveyData.filter(d => d.dataYear === year);
        if (yearData.length === 0) return null;
        const totalHours = yearData.reduce((sum, item) => sum + workHourRangeToValue(item.avgWeeklyWorkHours), 0);
        return parseFloat((totalHours / yearData.length).toFixed(2));
    });

    const seriesName = '平均工时';

    return {
        title: { text: '平均每周工作时长趋势 (小时)', left: 'center' },
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: surveyYears.map(String) },
        yAxis: { type: 'value', name: '小时', scale: true },
        // 关键改动：为这唯一的系列分配固定颜色
        series: [{ 
            name: seriesName, 
            type: 'line', 
            smooth: true, 
            data: dataPoints, 
            areaStyle: {}, 
            emphasis: { focus: 'series' },
            color: colorMapping[seriesName] || FALLBACK_COLOR // 使用映射颜色
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

const resizeChart = () => { myChart?.resize(); };
defineExpose({ resizeChart });
</script>