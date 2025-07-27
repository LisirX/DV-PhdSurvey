<template>
  <div class="analysis-page-container">
    <!-- 页面头部 -->
    <header class="page-header">
      <h1>满意度、时间与心理健康的相关性分析</h1>
      <p>
        博士生满意度与寻求心理健康支持意愿随时间的关联分析
      </p>
    </header>

    <!-- 图表区域：左右两列 -->
    <div class="chart-area">
      <!-- 左列 -->
      <div class="chart-column">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>整体满意度分布&ensp;&ensp;</span>
              <el-tag v-if="selectedSatisfactionBin" type="info" size="small">
               选取的范围: {{ selectedSatisfactionBin }}
              </el-tag>
            </div>
          </template>
          <div class="chart-content">
            <SatisfactionDistributionBar
              :satisfaction-data="satisfactionDistributionData"
              :selected-bin="selectedSatisfactionBin"
              @select-bin="handleBinSelection"
            />
          </div>
        </el-card>

        <el-card class="chart-card">
          <template #header>
            <div class="card-header">按年份划分的心理健康求助情况</div>
          </template>
          <div class="chart-content">
            <MentalHealthByYearStack :filtered-data="filteredBySatisfactionData" />
          </div>
        </el-card>
      </div>

      <!-- 右列 -->
      <div class="chart-column">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">心理健康求助趋势演变</div>
          </template>
          <div class="chart-content">
            <MentalHealthTrendLine :filtered-data="filteredBySatisfactionData" />
          </div>
        </el-card>

        <el-card class="chart-card">
          <template #header>
            <div class="card-header">平均每周工时趋势</div>
          </template>
          <div class="chart-content">
            <WorkHoursTrendLine :filtered-data="filteredBySatisfactionData" />
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElLoading, ElMessage } from 'element-plus';

// 子组件导入
import SatisfactionDistributionBar from '@/components/SatisfactionDistributionBar.vue';
import MentalHealthByYearStack from '@/components/MentalHealthByYearStack.vue';
import MentalHealthTrendLine from '@/components/MentalHealthTrendLine.vue';
import WorkHoursTrendLine from '@/components/WorkHoursTrendLine.vue';

// 状态
const allSurveyData = ref([]);
const isLoading = ref(true);
const selectedSatisfactionBin = ref(null);

// 数据处理
const processedData = computed(() => {
  if (isLoading.value || !allSurveyData.value.length) return [];
  return allSurveyData.value.map(item => {
    const scores = [
      item.satisfactionStudyPeriod,
      item.satisfactionFunding,
      item.satisfactionWorkHours,
      item.satisfactionFreedom,
      item.satisfactionPay
    ];
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return { ...item, avgSatisfaction: avg };
  });
});

const satisfactionBins = {
  '0.0-0.2': d => d.filter(i => i.avgSatisfaction >= 0 && i.avgSatisfaction < 0.2),
  '0.2-0.4': d => d.filter(i => i.avgSatisfaction >= 0.2 && i.avgSatisfaction < 0.4),
  '0.4-0.6': d => d.filter(i => i.avgSatisfaction >= 0.4 && i.avgSatisfaction < 0.6),
  '0.6-0.8': d => d.filter(i => i.avgSatisfaction >= 0.6 && i.avgSatisfaction < 0.8),
  '0.8-1.0': d => d.filter(i => i.avgSatisfaction >= 0.8 && i.avgSatisfaction <= 1.0),
};
const binLabels = Object.keys(satisfactionBins);

const satisfactionDistributionData = computed(() => {
  if (!processedData.value.length) return [];
  return binLabels.map(label => ({
    label,
    count: satisfactionBins[label](processedData.value).length,
  }));
});

const filteredBySatisfactionData = computed(() => {
  if (!selectedSatisfactionBin.value) return processedData.value;
  const fn = satisfactionBins[selectedSatisfactionBin.value];
  return fn ? fn(processedData.value) : [];
});

// 事件处理
function handleBinSelection(binLabel) {
  selectedSatisfactionBin.value =
    selectedSatisfactionBin.value === binLabel ? null : binLabel;
}

// 生命周期
onMounted(async () => {
  isLoading.value = true;
  const loading = ElLoading.service({ lock: true, text: '加载中...' });
  try {
    const res = await fetch('/survey-data/survey-data.json');
    if (!res.ok) throw new Error('Network error');
    allSurveyData.value = await res.json();
  } catch (e) {
    ElMessage.error('Failed to load survey data');
    console.error(e);
  } finally {
    isLoading.value = false;
    loading.close();
  }
});
</script>

<style scoped>
.analysis-page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f7f9fc;
  padding: 24px;
  box-sizing: border-box;
}

/* 页面头部 */
.page-header {
  flex-shrink: 0;
  text-align: center;
  margin-bottom: 16px;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}
.page-header h1 {
  font-size: 2.25rem;
  font-weight: 800;
  color: #1f2d3d;
  margin-bottom: 0.5rem;
}
.page-header p {
  font-size: 1.1rem;
  color: #6b7280;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.7;
}

/* 图表区域（两列） */
.chart-area {
  flex: 1;
  display: flex;
  gap: 24px;
  height: 100%;
}

/* 每列 */
.chart-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 卡片 */
.chart-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  border: 1px solid #eef2f8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

/* 卡片头部适配 */
:deep(.el-card__header) {
  flex-shrink: 0;
  padding: 16px 20px;
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
}

/* 卡片内容区 */
:deep(.el-card__body) {
  flex: 1;
  display: flex;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
}

/* 图表容器 */
.chart-content {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}
</style>
