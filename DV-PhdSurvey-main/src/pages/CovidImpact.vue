<template>
  <div class="covid-analysis-container">
    <header class="page-header">
      <h1>疫情对博士生项目影响分析 (2022年数据)</h1>
      <p>探索疫情影响与博士生满意度及工作时长的关联。点击左侧饼图进行筛选和对比。</p>
    </header>

    <div v-if="isInitialLoading" class="loading-container">
      <el-alert title="数据正在加载中..." type="info" center show-icon :closable="false" />
    </div>

    <!-- 图表区域: 使用 CSS Grid 布局 -->
    <div v-else class="dashboard-grid">
      
      <!-- 左侧: 疫情影响分布饼图 (Grid Item 1) -->
      <div class="grid-item-left">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>疫情影响分布 (点击筛选)</span>
            </div>
          </template>
          <div class="chart-content">
            <CovidImpactPie 
              :pie-data="pieChartData"
              @select-impact="handleImpactSelection"
            />
          </div>
        </el-card>
      </div>

      <!-- 右侧: 联动图表 (Grid Item 2) -->
      <div class="grid-item-right">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header"><span>平均满意度分布</span></div>
          </template>
          <div class="chart-content">
            <SatisfactionBarChart 
              :merged-data="mergedData"
              :selected-impact-names="selectedImpactNames"
              :config="chartConfig"
            />
          </div>
        </el-card>

        <el-card class="chart-card">
          <template #header>
            <div class="card-header"><span>每周工作时长分布</span></div>
          </template>
          <div class="chart-content">
            <WorkHoursBarChart 
              :merged-data="mergedData"
              :selected-impact-names="selectedImpactNames"
              :config="chartConfig"
            />
          </div>
        </el-card>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElLoading, ElMessage, ElAlert, ElRow, ElCol, ElCard } from 'element-plus';
import CovidImpactPie from '@/components/CovidImpactPie.vue';
import SatisfactionBarChart from '@/components/SatisfactionBarChart.vue';
import WorkHoursBarChart from '@/components/WorkHoursBarChart.vue';
import { loadSurveyData, loadCovidData } from '@/data';

const isInitialLoading = ref(true);
const mergedData = ref([]);
const selectedImpactNames = ref([]);

// 将所有静态配置打包成一个对象传递给子组件
const chartConfig = {
  COVID_IMPACT_MAP: {
    '-1': { name: '消极影响', color: '#f56c6c' },
    '0': { name: '没有影响', color: '#909399' },
    '1': { name: '积极影响', color: '#67c23a' }
  },
  SATISFACTION_BINS: ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'],
  WORK_HOUR_ORDER: ['<11', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71-80', '>80']
};

// 只计算饼图所需的数据
const pieChartData = computed(() => {
  if (isInitialLoading.value) return [];
  const pieCounts = { '-1': 0, '0': 0, '1': 0 };
  mergedData.value.forEach(item => { pieCounts[item.covidImpact]++; });
  return Object.entries(pieCounts).map(([impactStr, value]) => ({
    value,
    name: chartConfig.COVID_IMPACT_MAP[impactStr].name,
    itemStyle: { color: chartConfig.COVID_IMPACT_MAP[impactStr].color }
  }));
});

// 事件处理器，更新选中的名称列表
function handleImpactSelection(newSelectedNames) {
  selectedImpactNames.value = newSelectedNames;
}

// 数据加载
onMounted(async () => {
  const loading = ElLoading.service({ lock: true, text: '正在加载并合并数据...' });
  try {
    const [surveyResponses, covidResponses] = await Promise.all([loadSurveyData(), loadCovidData()]);
    const covidMap = new Map(covidResponses.map(d => [d.responseID, d]));
    const survey2022 = surveyResponses.filter(d => d.dataYear === 2022);
    mergedData.value = survey2022.map(item => {
      const covidItem = covidMap.get(item.responseID);
      return covidItem ? { ...item, ...covidItem } : null;
    }).filter(Boolean);
  } catch (error) {
    ElMessage.error('数据加载失败!');
    console.error(error);
  } finally {
    isInitialLoading.value = false;
    loading.close();
  }
});
</script>

<style scoped>
/* 页面基础样式 */
.covid-analysis-container {
  padding: 24px;
  background-color: #f7f9fc;
  border-radius: 12px;
  box-sizing: border-box;
}
.page-header {
  text-align: center;
  margin-bottom: 2rem;
}
.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2d3d;
}
.page-header p {
  font-size: 1rem;
  color: #6b7280;
  max-width: 800px;
  margin: 0.5rem auto 0;
}
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px;
}
.card-header {
  font-weight: 600;
  font-size: 1.1rem;
}

/* ---------------------------------------------------- */
/* --- 核心布局样式 (请重点关注这部分) --- */
/* ---------------------------------------------------- */

/* 1. 主网格容器 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 2fr; 
  gap: 20px;
  height: 75vh;
}

/* 2. 左侧容器 */
.grid-item-left {
  display: flex;
  flex-direction: column;
  height: 100%; 
}

/* 2. 右侧容器 (它将包含两个垂直排列的卡片) */
.grid-item-right {
  display: flex;
  flex-direction: column;
  /* 定义右侧两个卡片之间的垂直间距 */
  gap: 20px; 
}

/* 3. 通用卡片样式 (实现高度自适应和内部填充) */
.chart-card {
  border-radius: 10px;
  background-color: #fff;
  border: 1px solid #eef2f8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  
  /* 关键: 让卡片自身成为 Flex 容器，以便控制其内部结构 */
  display: flex;
  flex-direction: column;
  
  /* 关键: 让右侧的两个卡片平分其容器的高度 */
  flex: 1; 
}

/* 4. 深入控制 el-card 内部，让图表内容区填满空间 */
:deep(.el-card__header) {
  /* 固定头部高度，不允许它在 Flex 布局中收缩 */
  flex-shrink: 0;
  padding: 16px 20px;
}
:deep(.el-card__body) {
  /* 让卡片身体部分占据所有可用的剩余空间 */
  flex-grow: 1;
  padding: 0; /* 我们在 .chart-content 中控制内边距 */
  
  /* 关键: 必须让 body 也成为 Flex 容器，它的子元素才能使用 height: 100% */
  display: flex;
  flex-direction: column;
}

/* 5. 图表最终的容器样式 */
.chart-content {
  width: 100%;
  height: 100%; /* 完美填满 .el-card__body 所分配的空间 */
  box-sizing: border-box;
  padding: 10px;
}
</style>