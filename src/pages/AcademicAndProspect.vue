<template>
  <div class="survey-charts-container">
    <!-- 1. 年份选择器 -->
    <div class="year-selector">
      <el-radio-group v-model="selectedYear" @change="handleYearChange" size="large">
        <el-radio-button :label="2017">2017年</el-radio-button>
        <el-radio-button :label="2019">2019年</el-radio-button>
        <el-radio-button :label="2022">2022年</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 2. 动态标题 -->
    <h2>{{ selectedYear }}年博士职业前景分析</h2>

    <!-- 3. 图表容器 -->
    <el-row :gutter="20">
      <el-col :lg="12" :md="24">
        <div class="chart-container">
          <div ref="question1Chart" class="chart"></div>
        </div>
      </el-col>
      <el-col :lg="12" :md="24">
        <div class="chart-container">
          <div ref="question2Chart" class="chart"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components';
import { LabelLayout } from 'echarts/features';
import { loadSurveyData } from '@/data';
import { CanvasRenderer } from 'echarts/renderers';
import { ElRadioGroup, ElRadioButton, ElLoading } from 'element-plus';

echarts.use([PieChart, TooltipComponent, LegendComponent, TitleComponent, LabelLayout, CanvasRenderer]);

export default {
  name: 'PieChartVisualLinkage',
  components: { ElRadioGroup, ElRadioButton },
  setup() {
    const question1Chart = ref(null);
    const question2Chart = ref(null);
    const surveyData = ref([]);
    const selectedYear = ref(2022);
    let question1ChartInstance = null;
    let question2ChartInstance = null;
    let currentFilter = 'All';

    const colorMap = {
      'Barely': '#73c0de', 'Dramatically': '#5470c6', 'Not at all': '#fc8452',
      'Somewhat': '#9a60b4', 'Substantially': '#91cc75', 'Unsure': '#ea7ccc',
      'Yes': '#91cc75', 'No': '#ee6666'
    };
    const fixedCategories = ['Dramatically', 'Substantially', 'Somewhat', 'Barely', 'Not at all', 'Unsure'];
    const zhMap = {
      'Dramatically': '非常大',
      'Substantially': '较大',
      'Somewhat': '一般',
      'Barely': '较小',
      'Not at all': '完全没有',
      'Unsure': '不确定',
      'Yes': '是',
      'No': '否'
    };

    const processData = () => {
      const yearData = surveyData.value.filter(item => item.dataYear === selectedYear.value);
      const question1Stats = {
        'Yes': yearData.filter(item => item.wantAcademicCareer === 'Yes').length,
        'No': yearData.filter(item => item.wantAcademicCareer === 'No').length
      };
      let filteredData = yearData;
      if (currentFilter !== 'All') {
        filteredData = yearData.filter(item => item.wantAcademicCareer === currentFilter);
      }

      const question2Stats = {};
      fixedCategories.forEach(cat => { question2Stats[cat] = 0; });
      filteredData.forEach(item => {
        if (fixedCategories.includes(item.careerProspectImprovement)) {
          question2Stats[item.careerProspectImprovement]++;
        }
      });

      const question1Data = Object.entries(question1Stats).map(([name, value]) => ({
        name: zhMap[name], value, itemStyle: { color: colorMap[name] }
      }));

      const question2Data = fixedCategories.map(name => ({
        name: zhMap[name], value: question2Stats[name], itemStyle: { color: colorMap[name] }
      }));

      return { question1Data, question2Data };
    };

    const updateQuestion2Chart = () => {
      if (!question2ChartInstance) return;
      const { question2Data } = processData();
      question2ChartInstance.setOption({
        title: {
          subtext: currentFilter === 'All' ? '全部学生' : `学术职业意向：${zhMap[currentFilter]}`,
        },
        series: [{ data: question2Data }]
      }, { notMerge: false });
    };

    const initOrUpdateCharts = () => {
      if (!question1Chart.value || !question2Chart.value) return;
      const { question1Data, question2Data } = processData();

      const question1Option = {
        title: { text: '是否希望从事学术职业', left: 'center', top: 10, textStyle: { fontSize: 16, fontWeight: 'bold' } },
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { orient: 'horizontal', bottom: 10, data: question1Data.map(item => item.name) },
        series: [{
          name: '学术职业意向', type: 'pie', radius: '65%', center: ['50%', '55%'],
          itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, formatter: '{b}\n{d}%', fontSize: 13, fontWeight: 'normal' },
          labelLine: { length: 10, length2: 15 },
          emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
          data: question1Data, id: 'q1-pie'
        }],
        universalTransition: { enabled: true }
      };

      const question2Option = {
        title: {
          text: '博士学位对职业前景的提升',
          subtext: currentFilter === 'All' ? '全部学生' : `学术职业意向：${zhMap[currentFilter]}`,
          left: 'center', top: 10, textStyle: { fontSize: 16, fontWeight: 'bold' }
        },
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { orient: 'horizontal', bottom: 10, data: question2Data.map(item => item.name) },
        series: [{
          name: '职业前景提升', type: 'pie', radius: ['35%', '65%'], center: ['50%', '55%'],
          itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, formatter: '{b}\n{d}%', fontSize: 13, fontWeight: 'normal' },
          labelLine: { length: 10, length2: 15 },
          emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
          data: question2Data, id: 'q2-pie'
        }],
        universalTransition: { enabled: true }
      };

      if (!question1ChartInstance) {
        question1ChartInstance = echarts.init(question1Chart.value);
        question1ChartInstance.on('click', (params) => {
          const reverseMap = { '是': 'Yes', '否': 'No' };
          const newFilter = reverseMap[params.name] === currentFilter ? 'All' : reverseMap[params.name];
          if (currentFilter !== newFilter) {
            currentFilter = newFilter;
            updateQuestion2Chart();
          }
        });
      }
      question1ChartInstance.setOption(question1Option);

      if (!question2ChartInstance) {
        question2ChartInstance = echarts.init(question2Chart.value);
      }
      question2ChartInstance.setOption(question2Option);
    };

    const handleYearChange = () => {
      currentFilter = 'All';
      initOrUpdateCharts();
    };

    onMounted(async () => {
      const loading = ElLoading.service({ lock: true, text: '加载中...' });
      try {
        surveyData.value = await loadSurveyData();
        initOrUpdateCharts();
      } catch (error) {
        console.error('数据加载失败:', error);
      } finally {
        loading.close();
      }
    });

    onUnmounted(() => {
      question1ChartInstance?.dispose();
      question2ChartInstance?.dispose();
    });

    return { question1Chart, question2Chart, selectedYear, handleYearChange };
  }
};
</script>

<style scoped>
/* 保持不变 */
.survey-charts-container {
  padding: 25px;
  max-width: 1400px;
  margin: 20px auto;
  background-color: #f7f9fc;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 30, 80, 0.08);
}
.chart-container {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  height: 100%;
  border: 1px solid #eef2f8;
}
.chart {
  width: 100%;
  height: 450px;
}
h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #1f2d3d;
  font-size: 26px;
  font-weight: 600;
}
h3 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
  font-weight: 500;
}
.year-selector {
  text-align: center;
  margin-bottom: 30px;
}
</style>
