<!-- src/views/SurveyDashboard.vue -->
<template>
  <div class="dashboard-container">
    
    <!-- 左侧面板：固定，不滚动 -->
    <div class="left-panel">
      <el-card shadow="hover">
        <!-- V-bind: 将计算出的国家数据传递给子组件 -->
        <GeographicGraphComponent :country-data="countryDataStats" @selectNewCountry="handleCountrySelection" />
      </el-card>
      <el-card shadow="hover" style="margin-top: 20px;">
        <h3 class="selected-title">当前选择的国家/地区</h3>

        <p class="data-count-text">
          已选中数据条数：<strong>{{ filteredSurveyData.length }}</strong> 条
        </p>

        <div v-if="selectedCountries.length > 0" class="tag-list">
          <el-tag v-for="country in selectedCountries" :key="country.name" type="success" size="large">
            {{ country.name }}
          </el-tag>
        </div>

        <div v-else class="placeholder-text">
          请在上方地图上点击选择国家/地区进行分析
        </div>
      </el-card>
    </div>

    <!-- 右侧面板：占据剩余空间，且自身可垂直滚动 -->
    <div class="right-panel">
      <el-tabs 
        v-model="activeTab" 
        type="border-card" 
        class="analysis-tabs"
        @tab-change="handleTabChange"
      >
        <!-- 趋势分析 Tab -->
        <el-tab-pane label="趋势分析" name="trends">
          <div v-if="isTabVisible.trends">
            <div class="chart-item">
              <SatisfactionTrendChart 
                ref="satisfactionTrendChartRef"
                :survey-data="filteredSurveyData" 
              />
            </div>
            <div class="chart-item">
              <WorkHoursTrendChart 
                ref="workHoursTrendChartRef"
                :survey-data="filteredSurveyData" 
              />
            </div>
          </div>
        </el-tab-pane>

        <!-- 选择题分布 Tab -->
        <el-tab-pane label="选择题分布" name="categorical">
          <div v-if="isTabVisible.categorical">
            <div class="chart-item">
              <CategoricalPieChart 
                ref="prospectsPieChartRef"
                title="职业前景提升程度" 
                data-key="careerProspectImprovement" 
                :survey-data="filteredSurveyData" 
              />
            </div>
            <div class="chart-item">
              <CategoricalPieChart
                ref="academicPieChartRef"
                title="是否愿意从事学术研究" 
                data-key="wantAcademicCareer" 
                :survey-data="filteredSurveyData" 
              />
            </div>
            <div class="chart-item">
              <CategoricalPieChart
                ref="mentalHealthPieChartRef"
                title="是否寻求过心理健康帮助" 
                data-key="soughtMentalHealthHelp" 
                :survey-data="filteredSurveyData" 
              />
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 导师支持分析 Tab -->
        <el-tab-pane label="导师支持分析" name="supervisor">
          <div v-if="isTabVisible.supervisor">
            <div class="chart-item">
              <CategoricalPieChart 
                ref="honestTalkPieChartRef"
                title="能与导师真诚交流职业发展" 
                data-key="honestCareerTalkWithSupervisors" 
                :survey-data="filteredSurveyData" 
              />
            </div>
            <div class="chart-item">
              <CategoricalPieChart
                ref="acceptNonAcademicPieChartRef"
                title="导师对非学术职业的接受度" 
                data-key="supervisorAcceptNonAcademic" 
                :survey-data="filteredSurveyData" 
              />
            </div>
            <div class="chart-item">
              <CategoricalPieChart
                ref="adviceNonAcademicPieChartRef"
                title="导师提供非学术职业建议的能力" 
                data-key="supervisorAdviceNonAcademic" 
                :survey-data="filteredSurveyData" 
              />
            </div>
             <div class="chart-item">
              <CategoricalPieChart
                ref="encourageTrainingPieChartRef"
                title="导师鼓励参加职业发展培训" 
                data-key="supervisorEncourageCareerTraining" 
                :survey-data="filteredSurveyData" 
              />
            </div>
          </div>
        </el-tab-pane>

        <!-- 原因分析(词云) Tab -->
        <el-tab-pane label="原因分析(词云)" name="wordcloud">
          <div v-if="isTabVisible.wordcloud">
            <div class="chart-item">
              <ReasonsWordCloud 
                ref="studyReasonsWordCloudRef"
                title="求学原因" 
                data-key="studyReasons" 
                :survey-data="filteredSurveyData"
                :custom-stopwords="wordCloudStopwords['studyReasons']"
              />
            </div>
             <div class="chart-item">
              <ReasonsWordCloud 
                ref="reconsiderReasonsWordCloudRef"
                title="重新选择的原因" 
                data-key="reconsiderReasons" 
                :survey-data="filteredSurveyData"
                :custom-stopwords="wordCloudStopwords['reconsiderReasons']"
              />
            </div>
             <div class="chart-item">
              <ReasonsWordCloud 
                ref="phdDifficultiesWordCloudRef"
                title="所在地区读博难点" 
                data-key="phdRegionDifficulties" 
                :survey-data="filteredSurveyData"
                :custom-stopwords="wordCloudStopwords['phdRegionDifficulties']"
              />
            </div>
             <div class="chart-item">
              <ReasonsWordCloud 
                ref="careerInfoSourcesWordCloudRef"
                title="了解职业信息的途径" 
                data-key="careerInfoSources" 
                :survey-data="filteredSurveyData"
                :custom-stopwords="wordCloudStopwords['careerInfoSources']"
              />
            </div>
            <div class="chart-item">
              <ReasonsWordCloud 
                ref="noAcademicWordCloudRef"
                title="不做学术研究的原因" 
                data-key="reasonsNoAcademicCareer" 
                :survey-data="filteredSurveyData"
                :custom-stopwords="wordCloudStopwords['reasonsNoAcademicCareer']"
              />
            </div>
          </div>
        </el-tab-pane>
        <!-- 读博难处 Tab -->
        <el-tab-pane label="读博难处" name="phd-difficulties">
          <div v-if="isTabVisible['phd-difficulties']" class="phd-difficulties-container">
            <div class="chart-item phd-difficulties-chart">
              <CategoricalPieChart
                ref="phdDifficultiesPieChartRef"
                title="读博难处分布"
                :survey-data="phdDifficultiesPieData"
                data-key="difficulty"
                :category-order="phdDifficultiesOrder"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { ElLoading, ElMessage } from 'element-plus';
import { loadSurveyData } from '@/data';
import { SurveyResponse, Country } from '@/models';
import GeographicGraphComponent from '@/components/GeographicGraphComponent.vue';
import SatisfactionTrendChart from '@/components/SatisfactionTrendChart.vue';
import WorkHoursTrendChart from '@/components/WorkHoursTrendChart.vue';
import CategoricalPieChart from '@/components/CategoricalPieChart.vue';
import ReasonsWordCloud from '@/components/ReasonsWordCloud.vue';

// --- 状态定义 ---
const activeTab = ref('trends');
const isTabVisible = reactive({
  trends: true,
  categorical: false,
  supervisor: false,
  wordcloud: false,
  'phd-difficulties': false,
});

// --- 图表组件 ref (保持不变) ---
const satisfactionTrendChartRef = ref();
const workHoursTrendChartRef = ref();
const prospectsPieChartRef = ref();
const academicPieChartRef = ref();
const mentalHealthPieChartRef = ref();
const honestTalkPieChartRef = ref();
const acceptNonAcademicPieChartRef = ref();
const adviceNonAcademicPieChartRef = ref();
const encourageTrainingPieChartRef = ref();
const studyReasonsWordCloudRef = ref();
const noAcademicWordCloudRef = ref();
const reconsiderReasonsWordCloudRef = ref();
const phdDifficultiesWordCloudRef = ref();
const careerInfoSourcesWordCloudRef = ref();
const phdDifficultiesPieChartRef = ref();

// --- 屏蔽词配置 (保持不变) ---
const wordCloudStopwords: Record<string, string[]> = {
  studyReasons: ['study', 'research', 'learn', 'degree', 'phd', 'reason', 'reasons', 'interest', 'interested', 'wanted', 'pi'],
  reconsiderReasons: ['choose', 'change', 'would', 'different', 'choice', 'decision', 'area', 'pi'],
  phdRegionDifficulties: ['phd', 'difficulties', 'difficulty', 'region', 'country', 'area', 'pi'],
  careerInfoSources: ['career', 'careers', 'information', 'sources', 'source', 'find', 'job', 'jobs', 'pi'],
  reasonsNoAcademicCareer: ['academic', 'academia', 'career', 'research', 'science', 'don', 'work', 'job', 'jobs', 'pi', 'lack']
};

// --- 核心修改 1: 定义唯一的、顶层的映射表 ---
// (从源数据名 -> 地图名)
const geoJsonNameMap: Record<string, string> = {
  'United States': 'United States of America',
  'Czech Republic': 'Czechia',
  'Bosnia and Herzegovina': 'Bosnia and Herz.',
  'Slovakia (Slovak Republic)': 'Slovakia',
  'Burma (Myanmar)': 'Myanmar',
  'Taiwan': 'Taiwan(China)',
  'Haïti': 'Haiti',
  "Cote d'Ivoire": "Côte d'Ivoire",
  'Congo, Democratic Republic of': 'Dem. Rep. Congo',
  'Cayman Islands': 'Cayman Is.',
  'Antigua and Barbuda': 'Antigua and Barb.',
  'United States Virgin Islands': 'U.S. Virgin Is.',
};

// --- 数据加载与过滤 ---
const allSurveyData = ref<SurveyResponse[]>([]);
const selectedCountries = ref<Country[]>([]);
// --- countryNameMap 已被删除 ---

onMounted(async () => {
  const loading = ElLoading.service({ lock: true, text: '加载中...' });
  try {
    allSurveyData.value = await loadSurveyData();
    nextTick(() => {
      handleTabChange('trends');
    });
  } catch (error) {
    ElMessage.error('数据加载失败！');
  } finally {
    loading.close();
  }
});

const filteredSurveyData = computed(() => {
  if (selectedCountries.value.length === 0) {
    return allSurveyData.value;
  }
  
  // --- 核心修改 2: 动态反转 geoJsonNameMap 来实现反向查找 ---
  // (从地图名 -> 源数据名)
  const reverseGeoJsonMap = Object.fromEntries(
    Object.entries(geoJsonNameMap).map(([sourceName, mapName]) => [mapName, sourceName])
  );

  const selectedCountryNames = new Set(
    selectedCountries.value.map(country => 
      // 使用反转后的映射表
      reverseGeoJsonMap[country.name] || country.name
    )
  );

  return allSurveyData.value.filter(response => selectedCountryNames.has(response.country));
});


const countryDataStats = computed(() => {
  // --- 核心修改 3: 使用顶层的 geoJsonNameMap ---
  const stats: { name: string; value: number }[] = [];
  const counts: Record<string, number> = {};

  allSurveyData.value.forEach(item => {
    const countryName = item.country;
    if (countryName) {
      counts[countryName] = (counts[countryName] || 0) + 1;
    }
  });

  for (const [name, count] of Object.entries(counts)) {
    stats.push({
      // 使用顶层映射表
      name: geoJsonNameMap[name] || name,
      value: count,
    });
  }

  return stats;
});


const difficultyMapping: Record<string, string> = {
  'Learning what career possibilities exist': 'Career uncertainty', 'Finding research careers within academia': 'Academic research jobs', 'Finding research careers within industry': 'Industry research jobs', 'Finding non-research careers that use my skills': 'Non-research jobs', 'Finding research careers within government': 'Government research jobs', 'Finding research careers with charity/non-profit': 'Charity/non-profit jobs', 'Other': 'Other difficulties', 'please specify': 'Other difficulties', 'Finding a permanent job after completing my education': 'Permanent job search', 'Lack of affordable housing': 'Affordable housing', 'Work/life balance': 'Work/life balance', 'Overall cost of living': 'Cost of living', 'Living as an international student in another country': 'International student issues', 'Future student debt': 'Future student debt'
};

const phdDifficultiesPieData = computed(() => {
  const counts: Record<string, number> = {};
  filteredSurveyData.value.forEach(item => {
    (item.phdRegionDifficulties || []).forEach(diff => {
      const mappedDiff = difficultyMapping[diff] || diff;
      counts[mappedDiff] = (counts[mappedDiff] || 0) + 1;
    });
  });
  return Object.entries(counts).map(([difficulty, count]) => ({
    difficulty,
    value: count
  }));
});
const phdDifficultiesOrder = ['Career uncertainty', 'Academic research jobs', 'Industry research jobs', 'Non-research jobs', 'Government research jobs', 'Charity/non-profit jobs', 'Other difficulties', 'Permanent job search', 'Affordable housing', 'Work/life balance', 'Cost of living', 'International student issues', 'Future student debt'];

function handleCountrySelection(countries: Country[]) {
  selectedCountries.value = countries;
}

const handleTabChange = (tabName: string | number) => {
  const name = tabName as keyof typeof isTabVisible;
  isTabVisible[name] = true;
  nextTick(() => {
    switch (name) {
      case 'trends': satisfactionTrendChartRef.value?.resizeChart(); workHoursTrendChartRef.value?.resizeChart(); break;
      case 'categorical': prospectsPieChartRef.value?.resizeChart(); academicPieChartRef.value?.resizeChart(); mentalHealthPieChartRef.value?.resizeChart(); break;
      case 'supervisor': honestTalkPieChartRef.value?.resizeChart(); acceptNonAcademicPieChartRef.value?.resizeChart(); adviceNonAcademicPieChartRef.value?.resizeChart(); encourageTrainingPieChartRef.value?.resizeChart(); break;
      case 'wordcloud': studyReasonsWordCloudRef.value?.resizeChart(); reconsiderReasonsWordCloudRef.value?.resizeChart(); phdDifficultiesWordCloudRef.value?.resizeChart(); careerInfoSourcesWordCloudRef.value?.resizeChart(); noAcademicWordCloudRef.value?.resizeChart(); break;
      case 'phd-difficulties': phdDifficultiesPieChartRef.value?.resizeChart(); break;
    }
  });
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  height: 100%; 
  padding: 20px;
  box-sizing: border-box;
  background-color: #f0f2f5;
  gap: 20px;
}

.left-panel {
  width: 62.5%; 
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.right-panel {
  flex: 1; 
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.selected-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-height: 180px;
  overflow-y: auto;
  padding-right: 4px;
}
.placeholder-text {
  color: #909399;
  padding: 20px 0;
}
.chart-item {
  margin-bottom: 24px;
}
.chart-item:last-child {
  margin-bottom: 0;
}
.chart-item h4 {
  text-align: center;
  margin: 0 0 12px 0;
}

.tag-list .el-tag {
  font-size: 13px;
  padding: 0 10px;
  margin-bottom: 4px;
  line-height: 26px;
}

.right-panel .el-tab-pane>.chart-item:first-child {
  margin-top: 12px;
}

/* --- 专门针对读博难处标签页的样式优化 --- */
.phd-difficulties-container {
  padding: 20px 0;
  min-height: 600px; /* 确保有足够空间 */
}

.phd-difficulties-chart {
  margin-bottom: 40px; /* 增加底部边距 */
}

/* 确保标签页内容有足够的空间 */
.analysis-tabs .el-tab-pane {
  min-height: 500px;
}

/* 针对读博难处标签页的特殊处理 */
.analysis-tabs .el-tab-pane[name="phd-difficulties"] {
  min-height: 700px; /* 为读博难处提供更多空间 */
}
</style>