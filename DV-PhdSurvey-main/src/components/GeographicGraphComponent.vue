<template>
    <div ref="chartContainer" style="width: 100%; height: 600px;"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, defineProps, defineEmits } from 'vue';
import * as echarts from 'echarts/core';
import {
    TitleComponent, TooltipComponent, LegendComponent, GeoComponent, VisualMapComponent
} from 'echarts/components';
import { MapChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import worldGeoJSON from '@/assets/world.json';
import { Country } from '@/models';

// 注册 ECharts 组件
echarts.use([
    TitleComponent, TooltipComponent, LegendComponent, GeoComponent, VisualMapComponent,
    MapChart, CanvasRenderer
]);

echarts.registerMap('world', worldGeoJSON as any);

const props = defineProps<{
    countryData: { name: string; value: number }[];
}>();

const emit = defineEmits<{
    (e: 'selectNewCountry', countries: Country[]): void;
}>();

const chartContainer = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;
let resizeObs: ResizeObserver | null = null;
const selectedCountrySet = new Set<string>();

const updateChartOptions = () => {
    if (!chart) return;

    const maxDataValue = props.countryData.length > 0
        ? Math.max(...props.countryData.map(item => item.value), 0)
        : 1;

    // --- 核心修改 1: 创建一个包含数据和选中状态的统一 series.data ---
    // 这将作为系列(series)的唯一数据源，解决了 geo 和 series 的冲突。
    const dataMap = new Map(props.countryData.map(item => [item.name, item.value]));

    const seriesData = (worldGeoJSON as any).features.map((feature: any) => {
        const countryName = feature.properties.name;
        return {
            name: countryName,
            value: dataMap.get(countryName), // value 可能为 undefined，echarts 会处理
            // 在这里直接声明选中状态
            selected: selectedCountrySet.has(countryName)
        };
    });

    chart.setOption({
        backgroundColor: '#f9f9f9',
        title: { text: '全球调查数据分布图', subtext: '点击国家进行筛选', left: 'center', top: 20 },
        tooltip: {
            trigger: 'item',
            formatter: (params: any) => {
                // series.data 中现在总有 name
                if (params.name && params.value != null) {
                    return `${params.name}<br/>数据量: ${params.value}`;
                }
                return params.name;
            }
        },
        visualMap: {
            min: 0,
            max: maxDataValue > 0 ? maxDataValue : 1,
            left: 'left',
            top: 'bottom',
            text: ['高 (数据量)', '低'],
            calculable: true,
            inRange: {
                color: [
                    '#1a9850', '#66bd63', '#a6d96a', '#d9ef8b',
                    '#fee08b', '#fdae61', '#f46d43', '#d73027'
                ]
            }
        },
        geo: {
            // geo 现在只作为底图，不参与交互和数据绑定
            map: 'world',
            roam: true,
            label: { show: false },
            emphasis: {
                label: { show: true, color: "#A07070", fontSize: 12 },
                itemStyle: { areaColor: '#B3A5C9', borderColor: '#BF3142', borderWidth: 1 }
            },
            select: {
                label: { show: true, fontSize: 14 },
                itemStyle: { areaColor:'#B3A5C9',borderColor: '#BF3142', borderWidth: 1 }
            },
        },
        series: [
            {
                name: '国家数据量',
                type: 'map',
                geoIndex: 0,
                selectedMode: 'multiple',
                data: seriesData,
            }
        ]
    }, { notMerge: true });
};

onMounted(() => {
    if (!chartContainer.value) return;

    chart = echarts.init(chartContainer.value);

    // --- 核心修改 3: 恢复完整的更新闭环 ---
    chart.on('click', (params: any) => {
        // 事件源现在主要是 series
        if (params.componentType === 'series' && params.seriesType === 'map') {
            if (!params.name) return;

            const countryName = params.name;

            // 1. 更新业务状态
            if (selectedCountrySet.has(countryName)) {
                selectedCountrySet.delete(countryName);
            } else {
                selectedCountrySet.add(countryName);
            }

            // 2. 调用渲染函数，根据最新状态重绘图表
            updateChartOptions();

            // 3. 发射事件，通知父组件
            emit('selectNewCountry', Array.from(selectedCountrySet).map(name => ({ name })));
        }
    });

    resizeObs = new ResizeObserver(() => chart?.resize());
    resizeObs.observe(chartContainer.value);

    // 初始渲染
    updateChartOptions();
});

watch(() => props.countryData, () => {
    // 当外部数据变化时，也调用这个统一的渲染函数
    updateChartOptions();
}, { deep: true });

onUnmounted(() => {
    resizeObs?.disconnect();
    chart?.dispose();
});
</script>