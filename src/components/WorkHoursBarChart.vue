<template>
  <div ref="chartDom" class="chart-canvas"></div>
</template>
<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import * as echarts from 'echarts/core';
const props = defineProps({
  mergedData: { type: Array, required: true },
  selectedImpactNames: { type: Array, required: true },
  config: { type: Object, required: true }
});
const chartDom = ref(null);
let chartInstance = null;
const calculateDistribution = (dataSubset) => {
  const total = dataSubset.length;
  if (total === 0) return {satisfaction: Array(props.config.SATISFACTION_BINS.length).fill(0),workHours: Array(props.config.WORK_HOUR_ORDER.length).fill(0)};
  const satisfactionCounts = Array(props.config.SATISFACTION_BINS.length).fill(0);
  const workHoursCounts = props.config.WORK_HOUR_ORDER.reduce((acc, key) => ({...acc,[key]:0}),{});
  dataSubset.forEach(item => {
    if (item && typeof item.satisfactionStudyPeriod === 'number' && typeof item.satisfactionFunding === 'number' && typeof item.satisfactionWorkHours === 'number' && typeof item.satisfactionFreedom === 'number' && typeof item.satisfactionPay === 'number') {
      const avgSatisfaction = (item.satisfactionStudyPeriod + item.satisfactionFunding + item.satisfactionWorkHours + item.satisfactionFreedom + item.satisfactionPay) / 5;
      const satBinIndex = Math.min(Math.floor(avgSatisfaction / 0.2), 4);
      satisfactionCounts[satBinIndex]++;
    }
    if (item && workHoursCounts[item.avgWeeklyWorkHours] !== undefined) {
      workHoursCounts[item.avgWeeklyWorkHours]++;
    }
  });
  return {satisfaction: satisfactionCounts.map(count => parseFloat(((count/total)*100).toFixed(1))),workHours: props.config.WORK_HOUR_ORDER.map(key => parseFloat(((workHoursCounts[key]/total)*100).toFixed(1)))};
};
// 将 series 的计算逻辑放入 computed 属性中
const chartSeries = computed(() => {
  const overallSeries = {name:'总体平均',type:'bar',data:calculateDistribution(props.mergedData).workHours,itemStyle:{color:'#409EFF',opacity:.7},barGap:'20%'};
  const impactNameMap = Object.entries(props.config.COVID_IMPACT_MAP).reduce((acc, [key, val]) => ({...acc,[val.name]:Number(key)}),{});
  const selectedSeries = props.selectedImpactNames.filter(name => name !== undefined && name !== null).map(name => {
    const impact = impactNameMap[name];
    if (impact === undefined) return null;
    const subset = props.mergedData.filter(d => d.covidImpact === impact);
    const distributions = calculateDistribution(subset);
    return {name: name,type:'bar',data:distributions.workHours,itemStyle:{color:props.config.COVID_IMPACT_MAP[impact].color,opacity:1}};
  }).filter(Boolean);
  return [overallSeries, ...selectedSeries];
});
onMounted(() => {
  chartInstance = echarts.init(chartDom.value);
  chartInstance.setOption({
    tooltip:{trigger:'axis',axisPointer:{type:'shadow'}},
    legend:{top:5},
    grid:{left:'3%',right:'4%',bottom:'3%',containLabel:true},
    xAxis:{type:'category',data:props.config.WORK_HOUR_ORDER,axisLabel:{interval:0,rotate:30}},
    yAxis:{type:'value',axisLabel:{formatter:'{value}%'}},
    series: chartSeries.value // 使用 computed 属性进行初始渲染
  });
});
// watch 现在只监听最终的 computed 属性，职责单一
watch(chartSeries, (newSeries) => {
  if (chartInstance) {
    chartInstance.setOption({ series: newSeries }, { replaceMerge: ['series'] });
  }
});
onUnmounted(() => {chartInstance?.dispose();});
</script>
<style scoped>
.chart-canvas{width:100%;height:100%}
</style>