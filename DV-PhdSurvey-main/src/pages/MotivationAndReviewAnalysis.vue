<template>
  <div class="survey-charts-container">
    <!-- 动态标题 -->
    <h2>动机与回顾分析</h2>

    <!-- 图表容器 -->
    <el-row :gutter="20">
      <el-col :lg="12" :md="24">
        <div class="chart-container">
          <div ref="motivationChart" class="chart"></div>
        </div>
      </el-col>
      <el-col :lg="12" :md="24">
        <div class="chart-container">
          <div ref="reconsiderChart" class="chart"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 说明框 -->
    <div class="explanation-container">
      <el-card class="explanation-card">
        <template #header>
          <div class="card-header">
            <span>动机分类说明</span>
          </div>
        </template>
        <div class="explanation-content">
          <div class="motivation-type">
            <h4>学术性动机包括：</h4>
            <ul>
              <li>I want to pursue an academic career (希望从事学术职业)</li>
              <li>I wanted to continue pursuing my research (希望继续从事研究)</li>
              <li>Personal interest in my subject of choice (对所选学科的个人兴趣)</li>
            </ul>
          </div>
          <div class="motivation-type">
            <h4>功利性动机包括：</h4>
            <ul>
              <li>I want to pursue a non-academic career (希望从事非学术职业)</li>
              <li>I wanted to live in another country (希望在其他国家生活)</li>
              <li>No job I want is available without a PhD (没有博士学位无法获得理想工作)</li>
            </ul>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { ElLoading } from 'element-plus';
import { loadSurveyData } from '@/data.ts';

echarts.use([PieChart, TooltipComponent, LegendComponent, TitleComponent, LabelLayout, CanvasRenderer]);

export default {
  name: 'MotivationAndReviewAnalysis',
  setup() {
    const motivationChart = ref(null);
    const reconsiderChart = ref(null);
    const surveyData = ref([]);
    let motivationChartInstance = null;
    let reconsiderChartInstance = null;
    let currentFilter = 'All';

    // 动机分类映射
    const reasonClassification = {
      "I want to pursue an academic career": "academic",
      "I wanted to continue pursuing my research": "academic", 
      "Personal interest in my subject of choice": "academic",
      "I want to pursue a non-academic career": "utilitarian",
      "I wanted to live in another country": "utilitarian",
      "No job I want is available without a Master's/PhD": "utilitarian",
      "No job I want is available without a PhD": "utilitarian"
    };

    // 颜色映射
    const colorMap = {
      'academic': '#91cc75',
      'utilitarian': '#5470c6',
      'other_motivation': '#fac858',
      'Change area of study': '#73c0de',
      'Change adviser': '#fc8452', 
      'Change university/institution': '#9a60b4',
      'Change supervisor': '#ea7ccc',
      'Not pursue a PhD at all': '#ee6666',
      'Other': '#fac858'
    };

    // 中文映射
    const zhMap = {
      'academic': '学术性动机',
      'utilitarian': '功利性动机',
      'other_motivation': '混合/其他动机',
      'Change area of study': '改变研究领域',
      'Change adviser': '更换指导老师',
      'Change university/institution': '更换学校/机构', 
      'Change supervisor': '更换导师',
      'Not pursue a PhD at all': '不再攻读博士学位',
      'Other': '其他'
    };

    // 固定的重新考虑选项
    const fixedReconsiderCategories = [
      'Change area of study',
      'Change adviser', 
      'Change university/institution',
      'Change supervisor',
      'Not pursue a PhD at all',
      'Other'
    ];

    const processData = () => {
      // 处理动机数据 - 使用"纯净"样本分类逻辑
      const motivationStats = { academic: 0, utilitarian: 0, other_motivation: 0 };
      
      surveyData.value.forEach(item => {
        // 归类categories
        const categories = new Set();
        let hasOtherReasons = false;
        
        item.studyReasons.forEach(reason => {
          const classification = reasonClassification[reason];
          if (classification) {
            categories.add(classification);
          } else if (reason.trim() !== '') {
            hasOtherReasons = true;
          }
        });
        
        // 只属于功利型
        if (categories.has("utilitarian") && !categories.has("academic")) {
          motivationStats.utilitarian++;
        }
        // 只属于学术型
        else if (categories.has("academic") && !categories.has("utilitarian")) {
          motivationStats.academic++;
        }
        // 其他情况（包括有交集的、只有其他动机的、没有动机的）
        else if (hasOtherReasons || categories.size === 0 || categories.size > 1) {
          motivationStats.other_motivation++;
        }
      });

      // 根据当前筛选条件过滤数据
      let filteredData = surveyData.value;
      if (currentFilter !== 'All') {
        filteredData = surveyData.value.filter(item => {
          // 归类categories
          const categories = new Set();
          let hasOtherReasons = false;
          
          item.studyReasons.forEach(reason => {
            const classification = reasonClassification[reason];
            if (classification) {
              categories.add(classification);
            } else if (reason.trim() !== '') {
              hasOtherReasons = true;
            }
          });
          
          if (currentFilter === 'utilitarian') {
            // 只属于功利型
            return categories.has("utilitarian") && !categories.has("academic");
          } else if (currentFilter === 'academic') {
            // 只属于学术型
            return categories.has("academic") && !categories.has("utilitarian");
          } else if (currentFilter === 'other_motivation') {
            // 其他情况（包括有交集的、只有其他动机的、没有动机的）
            return hasOtherReasons || categories.size === 0 || categories.size > 1;
          }
          
          return false;
        });
      }

      // 处理重新考虑数据，合并相关选项
      const reconsiderStats = {};
      fixedReconsiderCategories.forEach(cat => { 
        reconsiderStats[cat] = 0; 
      });

      filteredData.forEach(item => {
        item.reconsiderReasons.forEach(reason => {
          // 合并"Change supervisor"和"Change supervisor/PI"
          if (reason === 'Change supervisor/PI') {
            reason = 'Change supervisor';
          }
          // 合并"Not pursue a PhD at all"和"Not pursue a graduate degree at all"
          if (reason === 'Not pursue a graduate degree at all') {
            reason = 'Not pursue a PhD at all';
          }
          // 合并"Other"和"please specify"为"Other"
          if (reason === 'please specify') {
            reason = 'Other';
          }
          
          if (fixedReconsiderCategories.includes(reason)) {
            reconsiderStats[reason]++;
          }
        });
      });

      const motivationData = Object.entries(motivationStats).map(([name, value]) => ({
        name: zhMap[name], 
        value, 
        itemStyle: { color: colorMap[name] },
        originalName: name
      }));

      const reconsiderData = fixedReconsiderCategories.map(name => ({
        name: zhMap[name], 
        value: reconsiderStats[name], 
        itemStyle: { color: colorMap[name] }
      }));

      return { motivationData, reconsiderData };
    };

    const updateReconsiderChart = () => {
      if (!reconsiderChartInstance) return;
      const { reconsiderData } = processData();
      
      let subtitle = '全部学生';
      if (currentFilter === 'academic') {
        subtitle = '学术性动机群体';
      } else if (currentFilter === 'utilitarian') {
        subtitle = '功利性动机群体';
      } else if (currentFilter === 'other_motivation') {
        subtitle = '其他动机群体';
      }
      
      reconsiderChartInstance.setOption({
        title: {
          subtext: subtitle,
        },
        series: [{ data: reconsiderData }]
      }, { notMerge: false });
    };

    const initOrUpdateCharts = () => {
      if (!motivationChart.value || !reconsiderChart.value) return;
      const { motivationData, reconsiderData } = processData();

      const motivationOption = {
        title: { 
          text: '功利性/学术性动机占比', 
          left: 'center', 
          top: 10, 
          textStyle: { fontSize: 16, fontWeight: 'bold' } 
        },
        tooltip: { 
          trigger: 'item', 
          formatter: '{b}: {c} ({d}%)' 
        },
        legend: { 
          orient: 'horizontal', 
          bottom: 10, 
          data: motivationData.map(item => item.name) 
        },
        series: [{
          name: '动机类型', 
          type: 'pie', 
          radius: '65%', 
          center: ['50%', '55%'],
          itemStyle: { 
            borderRadius: 8, 
            borderColor: '#fff', 
            borderWidth: 2 
          },
          label: { 
            show: true, 
            formatter: '{b}\n{d}%', 
            fontSize: 13, 
            fontWeight: 'normal' 
          },
          labelLine: { 
            length: 10, 
            length2: 15 
          },
          emphasis: { 
            label: { 
              show: true, 
              fontSize: 14, 
              fontWeight: 'bold' 
            } 
          },
          data: motivationData, 
          id: 'motivation-pie'
        }],
        universalTransition: { enabled: true }
      };

      let subtitle = '全部学生';
      if (currentFilter === 'academic') {
        subtitle = '学术性动机群体';
      } else if (currentFilter === 'utilitarian') {
        subtitle = '功利性动机群体';
      } else if (currentFilter === 'other_motivation') {
        subtitle = '其他动机群体';
      }

      const reconsiderOption = {
        title: {
          text: '重新选择意向分布',
          subtext: subtitle,
          left: 'center', 
          top: 10, 
          textStyle: { fontSize: 16, fontWeight: 'bold' }
        },
        tooltip: { 
          trigger: 'item', 
          formatter: '{b}: {c} ({d}%)' 
        },
        legend: { 
          orient: 'horizontal', 
          bottom: 10, 
          data: reconsiderData.map(item => item.name) 
        },
        series: [{
          name: '重新选择意向', 
          type: 'pie', 
          radius: ['35%', '65%'], 
          center: ['50%', '55%'],
          itemStyle: { 
            borderRadius: 8, 
            borderColor: '#fff', 
            borderWidth: 2 
          },
          label: { 
            show: true, 
            formatter: '{b}\n{d}%', 
            fontSize: 13, 
            fontWeight: 'normal' 
          },
          labelLine: { 
            length: 10, 
            length2: 15 
          },
          emphasis: { 
            label: { 
              show: true, 
              fontSize: 14, 
              fontWeight: 'bold' 
            } 
          },
          data: reconsiderData, 
          id: 'reconsider-pie'
        }],
        universalTransition: { enabled: true }
      };

      if (!motivationChartInstance) {
        motivationChartInstance = echarts.init(motivationChart.value);
        motivationChartInstance.on('click', (params) => {
          const clickedData = motivationData.find(item => item.name === params.name);
          const newFilter = clickedData?.originalName === currentFilter ? 'All' : clickedData?.originalName;
          if (currentFilter !== newFilter) {
            currentFilter = newFilter;
            updateReconsiderChart();
          }
        });
      }
      motivationChartInstance.setOption(motivationOption);

      if (!reconsiderChartInstance) {
        reconsiderChartInstance = echarts.init(reconsiderChart.value);
      }
      reconsiderChartInstance.setOption(reconsiderOption);
    };

    onMounted(async () => {
      const loading = ElLoading.service({ lock: true, text: '加载中...' });
      try {
        surveyData.value = await loadSurveyData();
        
        // 调试：分析不同动机群体的"Not pursue a PhD at all"比例
        const academicGroup = surveyData.value.filter(item => {
          const categories = new Set();
          item.studyReasons.forEach(reason => {
            const classification = reasonClassification[reason];
            if (classification) {
              categories.add(classification);
            }
          });
          // 只属于学术型
          return categories.has("academic") && !categories.has("utilitarian");
        });
        
        const utilitarianGroup = surveyData.value.filter(item => {
          const categories = new Set();
          item.studyReasons.forEach(reason => {
            const classification = reasonClassification[reason];
            if (classification) {
              categories.add(classification);
            }
          });
          // 只属于功利型
          return categories.has("utilitarian") && !categories.has("academic");
        });
        
        const academicNotPursue = academicGroup.filter(item => 
          item.reconsiderReasons.includes('Not pursue a PhD at all') || 
          item.reconsiderReasons.includes('Not pursue a graduate degree at all')
        ).length;
        
        const utilitarianNotPursue = utilitarianGroup.filter(item => 
          item.reconsiderReasons.includes('Not pursue a PhD at all') || 
          item.reconsiderReasons.includes('Not pursue a graduate degree at all')
        ).length;
        
        console.log('调试信息:');
        console.log(`学术性动机群体总数: ${academicGroup.length}`);
        console.log(`功利性动机群体总数: ${utilitarianGroup.length}`);
        console.log(`学术性群体中"Not pursue PhD"人数: ${academicNotPursue}`);
        console.log(`功利性群体中"Not pursue PhD"人数: ${utilitarianNotPursue}`);
        console.log(`学术性群体"Not pursue PhD"比例: ${(academicNotPursue/academicGroup.length*100).toFixed(2)}%`);
        console.log(`功利性群体"Not pursue PhD"比例: ${(utilitarianNotPursue/utilitarianGroup.length*100).toFixed(2)}%`);
        console.log(`比例差距: ${(utilitarianNotPursue/utilitarianGroup.length)/(academicNotPursue/academicGroup.length)}`);
        
        initOrUpdateCharts();
      } catch (error) {
        console.error('数据加载失败:', error);
      } finally {
        loading.close();
      }
    });

    onUnmounted(() => {
      motivationChartInstance?.dispose();
      reconsiderChartInstance?.dispose();
    });

    return { motivationChart, reconsiderChart };
  }
};
</script>

<style scoped>
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

.explanation-container {
  margin-top: 30px;
}

.explanation-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  color: #1f2d3d;
}

.explanation-content {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.motivation-type {
  flex: 1;
  min-width: 300px;
}

.motivation-type h4 {
  color: #409eff;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
}

.motivation-type ul {
  list-style-type: disc;
  padding-left: 20px;
  margin: 0;
}

.motivation-type li {
  margin-bottom: 8px;
  color: #606266;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .explanation-content {
    flex-direction: column;
    gap: 20px;
  }
  
  .motivation-type {
    min-width: auto;
  }
}
</style>