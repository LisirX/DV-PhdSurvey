<template>
  <div class="analysis-container">
    <header class="page-header">
      <h1>导师影响力分析与聚类探索</h1>
      <p>通过交互式热力图与自动聚类分析，全面揭示导师支持因素对学生职业选择的复杂影响。</p>
    </header>

    <el-tabs v-model="activeTab" type="border-card" class="main-tabs">
      <!-- ======================================================= -->
      <!-- 标签页 1: 聚类分析 -->
      <!-- ======================================================= -->
      <el-tab-pane label="导师影响力聚类分析" name="cluster">
        <!-- Top Row: Controls and Main Charts -->
        <el-row :gutter="30">
          <!-- 左侧：聚类控制面板 -->
          <el-col :md="8" :sm="24">
            <el-card class="control-panel">
              <h3 class="control-title">自动模式发现 (K-Means 聚类)</h3>
              <p class="control-description">
                采用 K-Means 算法将样本自动分为 {{ kValue }} 个群体。点击右侧散点图或下方桑基图中的类别节点，可高亮该类别的完整流向路径，并实现双图联动。
              </p>
              <div class="slider-item">
                <label class="slider-label">聚类数量 (K): {{ kValue }}</label>
                <el-slider v-model="kValue" :min="2" :max="6" :step="1" show-stops />
              </div>
            </el-card>
          </el-col>

          <!-- 右侧：聚类结果 -->
          <el-col :md="16" :sm="24">
            <el-card class="result-card" :style="{ backgroundColor: resultCardColor, color: resultCardTextColor }">
              <div v-if="!isLoading" class="result-content">
                <div class="result-header">{{ summaryDisplayData.description }}</div>
                <div class="percentage-display">
                  <span class="percentage-value">{{ summaryDisplayData.percentage }}</span>
                  <span v-if="typeof summaryDisplayData.percentage === 'number'" class="percentage-symbol">%</span>
                </div>
                <div class="result-description">的学生选择从事学术职业.</div>
                <div class="sample-size">(基于 <strong>{{ summaryDisplayData.sampleSize }}</strong> 个学生样本)</div>
              </div>
              <div v-else class="loading-state">Loading...</div>
            </el-card>

            <el-alert v-if="summaryDisplayData.lowSampleWarning" title="低样本量警告" description="当前情景样本量过小，结果可能不具有统计显著性。"
              type="warning" show-icon :closable="false" class="sample-warning-alert" />

            <el-card class="cluster-card">
              <template #header>
                <div class="card-header">
                  <span>聚类分析结果 (PCA 降维可视化)</span>
                  <el-tag v-if="selectedCluster !== null" type="success" effect="dark">
                    当前查看: 类别 {{ selectedCluster }}
                  </el-tag>
                  <el-tag v-else type="info" effect="plain">
                    点击图表中的类别进行选择
                  </el-tag>
                </div>
              </template>
              <el-row :gutter="10">
                <el-col :span="14">
                  <div ref="scatterPlotDom" style="width: 100%; height: 400px;"></div>
                </el-col>
                <el-col :span="10">
                  <div ref="radarChartDom" style="width: 100%; height: 400px;"></div>
                </el-col>
              </el-row>
            </el-card>
          </el-col>
        </el-row>

        <!-- Bottom Row: Full-width Sankey Diagram -->
        <el-row :gutter="30" style="margin-top: 30px;">
          <el-col :span="24">
            <el-card class="cluster-card">
              <template #header>
                <div class="card-header">
                  <span>分层路径流向分析 (桑基图)</span>
                  <el-tag v-if="selectedCluster !== null" type="success" effect="dark">
                    已高亮: 类别 {{ selectedCluster }} 的路径
                  </el-tag>
                  <el-tag v-else type="info" effect="plain">
                    显示所有路径
                  </el-tag>
                </div>
              </template>
              <p class="heatmap-description">
                路径的颜色由其最终流向决定：<span style="color: #ef4444; font-weight: bold;">红色</span>代表学术职业，<span
                  style="color: #3b82f6; font-weight: bold;">蓝色</span>代表非学术职业。
              </p>
              <div ref="sankeyDom" style="width: 100%; height: 600px;"></div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- ======================================================= -->
      <!-- 标签页 2: 交互式热力图 (新增) -->
      <!-- ======================================================= -->
      <el-tab-pane label="交互式热力图" name="heatmap">
        <el-row :gutter="30">
          <!-- 左侧：热力图控制面板 -->
          <el-col :md="8" :sm="24">
            <el-card class="control-panel">
              <h3 class="control-title">交互式探索</h3>
              <p class="control-description">
                选择任意两个因素作为热力图的坐标轴，使用滑块筛选另外两个因素，探索不同组合对学生选择学术职业比例的影响。<br>
                绿色字体的单元格表示样本量过小，结果可能不具有统计显著性。<br>
                点击热力图单元格可查看该组合下学术职业选择的具体比例和样本量。
              </p>
              <el-form label-position="top" label-width="100px">
                <el-form-item label="选择 X 轴因素">
                  <el-select v-model="xAxisFactorKey" placeholder="请选择" style="width: 100%;">
                    <el-option v-for="item in axisOptionsX" :key="item.key" :label="item.label" :value="item.key" />
                  </el-select>
                </el-form-item>
                <el-form-item label="选择 Y 轴因素">
                  <el-select v-model="yAxisFactorKey" placeholder="请选择" style="width: 100%;">
                    <el-option v-for="item in axisOptionsY" :key="item.key" :label="item.label" :value="item.key" />
                  </el-select>
                </el-form-item>

                <el-divider />

                <div v-for="factor in sliderFactors" :key="factor.key" class="slider-item">
                  <label class="slider-label">筛选器: {{ factor.label }}</label>
                  <el-slider v-model="sliderValues[factor.key]" :min="-1" :max="4" :step="1" :marks="sliderMarks" />
                </div>
              </el-form>
            </el-card>
          </el-col>

          <!-- 右侧：热力图与详情 -->
          <el-col :md="16" :sm="24">
            <!-- ======================= START: 新的 Result Card ======================= -->
            <el-card class="result-card"
              :style="{ backgroundColor: heatmapResultCardColor, color: heatmapResultCardTextColor }">
              <div v-if="!isLoading" class="result-content">
                <div class="result-header">{{ heatmapSummaryData.description }}</div>
                <div class="percentage-display">
                  <span class="percentage-value">{{ heatmapSummaryData.percentage }}</span>
                  <span v-if="typeof heatmapSummaryData.percentage === 'number'" class="percentage-symbol">%</span>
                </div>
                <div class="result-description">的学生选择从事学术职业.</div>
                <div class="sample-size">(基于 <strong>{{ heatmapSummaryData.sampleSize }}</strong> 个学生样本)</div>
              </div>
              <div v-else class="loading-state">Loading...</div>
            </el-card>
            <!-- ======================= END: 新的 Result Card ======================= -->

            <!-- 低样本量警告 -->
            <el-alert v-if="heatmapSummaryData.lowSampleWarning" title="低样本量警告" description="当前情景样本量过小，结果可能不具有统计显著性。"
              type="error" show-icon :closable="false" class="sample-error-alert" />

            <!-- 热力图图表 Card -->
            <el-card class="cluster-card">
              <template #header>
                <div class="card-header">
                  <span>学术职业选择比例热力图</span>
                </div>
              </template>
              <div ref="heatmapDom" style="width: 100%; height: 500px;"></div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

    </el-tabs>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue';
import * as echarts from 'echarts/core';
import { ScatterChart, RadarChart, SankeyChart, HeatmapChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent, RadarComponent, VisualMapComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { ElLoading, ElMessage } from 'element-plus';
import { kmeans } from 'ml-kmeans';
import { PCA } from 'ml-pca';

// ECharts 模块注册
echarts.use([
  ScatterChart, RadarChart, SankeyChart, HeatmapChart,
  TitleComponent, TooltipComponent, GridComponent, LegendComponent, RadarComponent, VisualMapComponent,
  CanvasRenderer
]);

// --- 全局常量与响应式状态 ---
const clusterColors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272'];

const allSurveyData = ref([]);
const filteredSurveyData = ref([]);
const isLoading = ref(true);
const activeTab = ref('cluster');
const factors = ref({
  honestCareerTalkWithSupervisors: { label: '真诚交流', key: 'honestCareerTalkWithSupervisors' },
  supervisorEncourageCareerTraining: { label: '鼓励培训', key: 'supervisorEncourageCareerTraining' },
  supervisorAcceptNonAcademic: { label: '接受非学术', key: 'supervisorAcceptNonAcademic' },
  supervisorAdviceNonAcademic: { label: '建议非学术', key: 'supervisorAdviceNonAcademic' }
});
const summaryDisplayData = ref({ percentage: '--', sampleSize: 0, description: '正在加载数据...', lowSampleWarning: false });
const kValue = ref(3);
const clusterResults = ref(null);
const selectedCluster = ref(null);
const scatterPlotDom = ref(null), radarChartDom = ref(null), sankeyDom = ref(null), heatmapDom = ref(null);
let scatterInstance, radarInstance, sankeyInstance, heatmapInstance = null;

// --- 热力图状态 ---
const xAxisFactorKey = ref('honestCareerTalkWithSupervisors');
const yAxisFactorKey = ref('supervisorAcceptNonAcademic');
const sliderValues = ref({});
const selectedCell = ref(null);
const sliderMarks = {
  '-1': '全部', 0: '0', 1: '1', 2: '2', 3: '3', 4: '4'
};


// --- 工具函数 ---
const agreeLevelToNumber = (level) => {
  const mapping = { 'Strongly disagree': 0, 'Disagree': 1, 'Neither agree nor disagree': 2, 'Agree': 3, 'Strongly agree': 4, 'Unsure/Not applicable': -1 };
  return mapping[level] ?? -1;
};
const agreeLevels = { 0: '非常不同意', 1: '不同意', 2: '中立', 3: '同意', 4: '非常同意' };
const agreeLevelsArray = ['非常不同意', '不同意', '中立', '同意', '非常同意'];

// --- 计算属性 (聚类) ---
const sankeyOptions = computed(() => {
  if (!clusterResults.value) {
    return { title: { text: '数据计算中...', left: 'center', top: 'center' } };
  }
  const agreeLevelOrder = { '非常同意': 0, '同意': 1, '中立': 2, '不同意': 3, '非常不同意': 4 };
  const nodes = new Set();
  const linkAggregator = new Map();
  const factorList = Object.values(factors.value);
  clusterResults.value.clusters.forEach(cluster => {
    cluster.members.forEach(member => {
      const endpoint = member.wantAcademicCareer === 'Yes' ? '学术职业' : '非学术职业';
      const pathNodes = [`类别 ${cluster.id}`, ...factorList.map(f => `${f.label} - ${agreeLevels[agreeLevelToNumber(member[f.key])]}`), endpoint];
      pathNodes.forEach(nodeName => nodes.add(nodeName));
      for (let i = 0; i < pathNodes.length - 1; i++) {
        const linkKey = `${cluster.id}|${pathNodes[i]}|${pathNodes[i + 1]}|${endpoint}`;
        linkAggregator.set(linkKey, (linkAggregator.get(linkKey) || 0) + 1);
      }
    });
  });
  const links = [];
  linkAggregator.forEach((count, key) => {
    const [clusterIdStr, source, target, endpoint] = key.split('|');
    links.push({ source, target, value: count, _clusterId: parseInt(clusterIdStr, 10), _endpoint: endpoint, lineStyle: { color: endpoint === '学术职业' ? '#ef4444' : '#3b82f6' } });
  });
  const factorLabels = factorList.map(f => f.label);
  const allNodeNames = Array.from(nodes);
  allNodeNames.sort((a, b) => {
    const getNodeInfo = (name) => {
      const clusterMatch = name.match(/类别 (\d+)/);
      if (clusterMatch) return { depth: 0, rank: parseInt(clusterMatch[1], 10) };
      if (name === '学术职业') return { depth: factorLabels.length + 1, rank: 0 };
      if (name === '非学术职业') return { depth: factorLabels.length + 1, rank: 1 };
      const parts = name.split(' - ');
      const factorLabel = parts[0];
      const agreeLevel = parts[1];
      const depth = factorLabels.indexOf(factorLabel) + 1;
      const rank = agreeLevelOrder[agreeLevel] ?? 99;
      return { depth, rank };
    };
    const infoA = getNodeInfo(a);
    const infoB = getNodeInfo(b);
    if (infoA.depth !== infoB.depth) return infoA.depth - infoB.depth;
    return infoA.rank - infoB.rank;
  });
  const finalNodes = allNodeNames.map(name => {
    const node = { name };
    const match = name.match(/类别 (\d+)/);
    if (match) {
      const clusterId = parseInt(match[1], 10);
      node.itemStyle = { color: clusterColors[clusterId % clusterColors.length], borderColor: '#000000', borderWidth: selectedCluster.value === clusterId ? 2 : 0 };
    } else if (name === '学术职业') {
      node.itemStyle = { color: '#ef4444' };
    } else if (name === '非学术职业') {
      node.itemStyle = { color: '#3b82f6' };
    } else {
      node.itemStyle = { color: '#333333' };
    }
    return node;
  });
  const isHighlighting = selectedCluster.value !== null;
  if (isHighlighting) {
    const activeNodes = new Set();
    links.forEach(link => {
      if (link._clusterId === selectedCluster.value) {
        link.lineStyle.opacity = 0.7;
        activeNodes.add(link.source);
        activeNodes.add(link.target);
      } else {
        link.lineStyle.opacity = 0.05;
      }
    });
    finalNodes.forEach(node => {
      const isStartOrEnd = node.name.startsWith('类别') || ['学术职业', '非学术职业'].includes(node.name);
      if (!isStartOrEnd && !activeNodes.has(node.name)) {
        node.itemStyle.opacity = 0.2;
      }
    });
  }
  return {
    tooltip: { trigger: 'item', triggerOn: 'mousemove', formatter: ({ dataType, data }) => { if (dataType === 'edge') { return `${data.source} → ${data.target}<br/>` + `最终流向: <strong style="color: ${data.lineStyle.color};">${data._endpoint}</strong><br/>` + `人数: ${data.value}`; } return `${data.name}`; } },
    series: [{ type: 'sankey', left: '2%', right: '8%', top: '5%', bottom: '5%', nodeAlign: 'justify', nodeWidth: 15, nodeGap: 10, data: finalNodes, links, emphasis: { focus: 'adjacency' }, lineStyle: { curveness: 0.5 }, label: { color: '#333', fontSize: 11 }, layoutIterations: 0 }]
  };
});

const scatterPlotOptions = computed(() => {
  if (!clusterResults.value) return { title: { text: '聚类结果计算中...', left: 'center', top: 'center' } };
  const series = clusterResults.value.clusters.map((cluster, index) => ({ name: `类别 ${cluster.id}`, type: 'scatter', symbolSize: 8, color: clusterColors[index % clusterColors.length], itemStyle: { borderColor: '#000000', borderWidth: selectedCluster.value === cluster.id ? 2 : 0 }, data: clusterResults.value.scatterData.filter(d => d.cluster === cluster.id).map(d => d.value), emphasis: { focus: 'series', scale: 1.5 } }));
  return { tooltip: { trigger: 'item', formatter: "点击选择或取消选择该类别" }, legend: { show: true, top: 10, type: 'scroll' }, xAxis: { name: 'PCA 1', splitLine: { show: false }, nameLocation: 'middle', nameGap: 25 }, yAxis: { name: 'PCA 2', splitLine: { show: false }, nameLocation: 'middle', nameGap: 25 }, series: series, grid: { top: '20%', bottom: '15%', left: '15%', right: '5%' } };
});

const resultCardColor = computed(() => {
  const p = summaryDisplayData.value.percentage;
  if (typeof p !== 'number') return '#a1a1aa';
  const interpolate = (c1, c2, f) => c1.map((c, i) => Math.round(c + f * (c2[i] - c)));
  const blue = [59, 130, 246], white = [241, 245, 249], red = [239, 68, 68];
  const color = p < 50 ? interpolate(blue, white, p / 50) : interpolate(white, red, (p - 50) / 50);
  return `rgb(${color.join(',')})`;
});

const resultCardTextColor = computed(() => {
  const p = summaryDisplayData.value.percentage;
  return (p > 25 && p < 75) ? '#1f2d3d' : '#ffffff';
});

const radarChartOptions = computed(() => {
  if (!radarChartData.value) return { title: { text: '请在图表中选择一个类别', left: 'center', top: 'center', textStyle: { fontSize: 14, color: '#999' } } };
  return { title: { text: `类别 ${selectedCluster.value} 特征画像`, left: 'center', top: 10 }, tooltip: { trigger: 'item' }, legend: { data: radarChartData.value.legendData, bottom: 5 }, radar: { indicator: radarChartData.value.indicator, radius: '65%', center: ['50%', '55%'] }, series: [{ type: 'radar', data: radarChartData.value.seriesData }] };
});

const radarChartData = computed(() => {
  if (!clusterResults.value || selectedCluster.value === null) return null;
  const cluster = clusterResults.value.clusters[selectedCluster.value];
  return { legendData: [`类别 ${selectedCluster.value}`], indicator: Object.values(factors.value).map(f => ({ name: f.label, max: 4 })), seriesData: [{ value: cluster.centroid, name: `类别 ${selectedCluster.value}` }] };
});

// --- 热力图计算属性 ---
const axisOptionsX = computed(() => Object.values(factors.value).filter(f => f.key !== yAxisFactorKey.value));
const axisOptionsY = computed(() => Object.values(factors.value).filter(f => f.key !== xAxisFactorKey.value));
const sliderFactors = computed(() => Object.values(factors.value).filter(f => f.key !== xAxisFactorKey.value && f.key !== yAxisFactorKey.value));

const heatmapData = computed(() => {
  if (isLoading.value) return [];
  let data = allSurveyData.value;
  sliderFactors.value.forEach(factor => {
    const value = sliderValues.value[factor.key];
    if (value !== -1 && value !== undefined) {
      data = data.filter(item => agreeLevelToNumber(item[factor.key]) === value);
    }
  });
  const grid = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => ({ totalCount: 0, academicCount: 0 })));
  data.forEach(item => {
    const x = agreeLevelToNumber(item[xAxisFactorKey.value]);
    const y = agreeLevelToNumber(item[yAxisFactorKey.value]);
    if (x >= 0 && y >= 0) {
      grid[x][y].totalCount++;
      if (item.wantAcademicCareer === 'Yes') {
        grid[x][y].academicCount++;
      }
    }
  });
  const chartData = [];
  for (let x = 0; x < 5; x++) {
    for (let y = 0; y < 5; y++) {
      const cell = grid[x][y];
      const percentage = cell.totalCount > 0 ? (cell.academicCount / cell.totalCount) * 100 : -1;
      const dataPoint = {
        value: [x, y, percentage],
        totalCount: cell.totalCount,
        academicCount: cell.academicCount,
        percentage: percentage,
        itemStyle: {},
        label: {}
      };

      // 条件1：样本量低（但大于0），设置红色边框
      if (cell.totalCount > 0 && cell.totalCount < 10) {
        dataPoint.label.color = '	#00e400';
        dataPoint.label.fontWeight = 'bold'; // 字体加粗
      }
      
      // 条件2：无数据，设置灰色背景
      if (cell.totalCount === 0) {
        dataPoint.itemStyle.color = '#f3f3f3';
        dataPoint.label.color = '	#00e400';
        dataPoint.label.fontWeight = 'bold'; // 字体加粗
      }
      
      chartData.push(dataPoint);
    }
  }
  return chartData;
});

const heatmapOptions = computed(() => {
  return {
    tooltip: {
      position: 'top',
      formatter: (params) => {
        const { totalCount, academicCount, percentage } = params.data;
        if (totalCount === 0) return '无数据';
        const lowSampleIndicator = totalCount < 10 ? '<br/><strong style="color: #ef4444;">(低样本量)</strong>' : '';
        return `
          ${factors.value[xAxisFactorKey.value].label}: ${agreeLevels[params.data.value[0]]}<br/>
          ${factors.value[yAxisFactorKey.value].label}: ${agreeLevels[params.data.value[1]]}<br/>
          <strong>学术职业比例: ${percentage.toFixed(1)}%</strong><br/>
          (样本: ${academicCount} / ${totalCount})${lowSampleIndicator}
        `;
      }
    },
    grid: { height: '70%', top: '5%', left: '15%', right: '5%', bottom: '10%' },
    xAxis: {
      type: 'category',
      data: agreeLevelsArray,
      name: factors.value[xAxisFactorKey.value]?.label,
      nameLocation: 'middle',
      nameGap: 35,
      splitArea: { show: false },
      splitLine: {
        show: true,
        lineStyle: {
          width: 2,
          color: '#f9fafb'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: agreeLevelsArray,
      name: factors.value[yAxisFactorKey.value]?.label,
      nameLocation: 'middle',
      nameGap: 80,
      splitArea: { show: false },
      splitLine: {
        show: true,
        lineStyle: {
          width: 2,
          color: '#f9fafb'
        }
      }
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '2%',
      color: ['#ef4444', '#f8f9fa', '#3b82f6'] // 使用红-白-蓝色系
    },
    series: [{
      name: '学术职业选择比例',
      type: 'heatmap',
      data: heatmapData.value,
      label: { show: true, color: '#000', formatter: (params) => { if (params.data.value[2] === -1) return 'N/A'; return `${params.data.value[2].toFixed(0)}%`; } },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
      itemStyle: {
        borderWidth: 1,
        borderColor: '#000'
      }
    }]
  };
});

const heatmapSummaryData = computed(() => {
  if (selectedCell.value) {
    const { percentage, totalCount } = selectedCell.value;
    const desc = totalCount < 10 ? '低样本量下的结果' : '当前筛选条件下的结果';
    return {
      percentage: parseFloat(percentage.toFixed(1)),
      sampleSize: totalCount,
      description: desc,
      lowSampleWarning: totalCount < 10 && totalCount > 0
    };
  }
  return { percentage: '--', sampleSize: 0, description: '请在热力图中选择一个单元格', lowSampleWarning: false };
});

const heatmapResultCardColor = computed(() => {
  const percentage = heatmapSummaryData.value.percentage;
  if (typeof percentage !== 'number') {
    return '#a1a1aa'; // 中性灰色
  }
  // 使用与visualMap一致的色系: 蓝 -> 白 -> 红
  const blue = [59, 130, 246];
  const white = [248, 249, 250];
  const red = [239, 68, 68];
  const interpolate = (c1, c2, f) => c1.map((c, i) => Math.round(c + f * (c2[i] - c)));
  
  const color = percentage < 50 
    ? interpolate(blue, white, percentage / 50) 
    : interpolate(white, red, (percentage - 50) / 50);
  
  return `rgb(${color.join(',')})`;
});

const heatmapResultCardTextColor = computed(() => {
    const p = heatmapSummaryData.value.percentage;
    return (p > 25 && p < 75) ? '#1f2d3d' : '#ffffff';
});

// --- 方法与函数 ---
const initCharts = () => {
  if (scatterPlotDom.value && !scatterInstance) {
    scatterInstance = echarts.init(scatterPlotDom.value);
    scatterInstance.on('click', p => { if (p.componentType === 'series') { selectedCluster.value = selectedCluster.value === p.seriesIndex ? null : p.seriesIndex; } });
  }
  if (radarChartDom.value && !radarInstance) {
    radarInstance = echarts.init(radarChartDom.value);
  }
  if (sankeyDom.value && !sankeyInstance) {
    sankeyInstance = echarts.init(sankeyDom.value);
    sankeyInstance.on('click', p => { if (p.data?.name?.startsWith('类别')) { const match = p.data.name.match(/类别 (\d+)/); if (match) { const clickedClusterId = parseInt(match[1], 10); selectedCluster.value = selectedCluster.value === clickedClusterId ? null : clickedClusterId; } } });
  }
  if (heatmapDom.value && !heatmapInstance) {
    heatmapInstance = echarts.init(heatmapDom.value);
    heatmapInstance.on('click', (params) => {
      if (params.componentType === 'series' && params.data.totalCount > 0) {
        selectedCell.value = params.data;
      }
    });
  }
};

const updateAllCharts = () => {
  if (scatterInstance) scatterInstance.setOption(scatterPlotOptions.value, { notMerge: true });
  if (radarInstance) radarInstance.setOption(radarChartOptions.value, { notMerge: true });
  if (sankeyInstance) sankeyInstance.setOption(sankeyOptions.value, { notMerge: true });
  if (heatmapInstance) heatmapInstance.setOption(heatmapOptions.value, { notMerge: true });
};

const runClustering = () => {
  if (isLoading.value || filteredSurveyData.value.length === 0) return;
  const dataForClustering = filteredSurveyData.value.map(item => Object.values(factors.value).map(f => agreeLevelToNumber(item[f.key])));
  if (dataForClustering.length < kValue.value) {
    ElMessage.warning('有效样本数量不足以进行聚类。');
    clusterResults.value = null;
    return;
  }
  const ans = kmeans(dataForClustering, kValue.value, { seed: 42 });
  const pca = new PCA(dataForClustering);
  const projectedData = pca.predict(dataForClustering).data;
  const results = {
    clusters: Array.from({ length: kValue.value }, (_, i) => ({ id: i, centroid: ans.centroids[i], members: [] })),
    scatterData: []
  };
  ans.clusters.forEach((clusterIndex, dataIndex) => {
    results.clusters[clusterIndex].members.push(filteredSurveyData.value[dataIndex]);
    results.scatterData.push({ value: [projectedData[dataIndex][0], projectedData[dataIndex][1]], cluster: clusterIndex });
  });
  clusterResults.value = results;
  if (selectedCluster.value === null || selectedCluster.value >= kValue.value) {
    selectedCluster.value = null;
  }
};

const updateSummaryFromCluster = (clusterId) => {
  if (!clusterResults.value) return;
  const cluster = clusterResults.value.clusters[clusterId];
  const members = cluster.members;
  const sampleSize = members.length;
  if (sampleSize === 0) {
    summaryDisplayData.value = { percentage: 'N/A', sampleSize: 0, description: `对于类别 ${clusterId}:`, lowSampleWarning: false };
    return;
  }
  const academicCount = members.filter(d => d.wantAcademicCareer === 'Yes').length;
  const percentage = parseFloat(((academicCount / sampleSize) * 100).toFixed(1));
  summaryDisplayData.value = { percentage, sampleSize, description: `对于类别 ${clusterId}:`, lowSampleWarning: false };
};

const resetSummaryToDefault = () => {
  if (activeTab.value === 'cluster') {
    summaryDisplayData.value = { percentage: '--', sampleSize: 0, description: '请在图表中选择一个类别', lowSampleWarning: false };
  }
};

// --- 生命周期与侦听器 ---
onMounted(async () => {
  const loading = ElLoading.service({ lock: true, text: '加载并解析数据中...' });
  try {
    const response = await fetch('/survey-data/survey-data.json');
    if (!response.ok) throw new Error('网络错误，无法加载数据文件');
    const data = await response.json();
    allSurveyData.value = data;
    filteredSurveyData.value = allSurveyData.value.filter(item =>
      Object.values(factors.value).every(factor => agreeLevelToNumber(item[factor.key]) !== -1)
    );
    if (allSurveyData.value.length > filteredSurveyData.value.length) {
      ElMessage.info({
        message: `已自动剔除 ${allSurveyData.value.length - filteredSurveyData.value.length} 条包含无效答案的数据。`,
        duration: 4000
      });
    }
    isLoading.value = false;
    await nextTick();
    initCharts();
    runClustering();
    resetSummaryToDefault();
    sliderFactors.value.forEach(factor => {
      sliderValues.value[factor.key] = -1;
    });
    updateAllCharts();
  } catch (error) {
    ElMessage.error('数据加载失败，请检查文件路径或网络连接。');
    console.error(error);
  } finally {
    loading.close();
  }
});

onBeforeUnmount(() => {
  if (sankeyInstance) sankeyInstance.dispose();
  if (scatterInstance) scatterInstance.dispose();
  if (radarInstance) radarInstance.dispose();
  if (heatmapInstance) heatmapInstance.dispose();
});

watch([clusterResults, selectedCluster], () => {
  if (activeTab.value === 'cluster') {
    updateAllCharts();
    if (selectedCluster.value !== null) {
      updateSummaryFromCluster(selectedCluster.value);
    } else {
      resetSummaryToDefault();
    }
  }
}, { deep: true });

watch(kValue, () => {
  selectedCluster.value = null;
  runClustering();
});

watch(
  [() => xAxisFactorKey.value, () => yAxisFactorKey.value, sliderValues],
  () => {
    if (xAxisFactorKey.value === yAxisFactorKey.value) {
      yAxisFactorKey.value = Object.values(factors.value).find(f => f.key !== xAxisFactorKey.value).key;
    }
    sliderFactors.value.forEach(factor => {
      if (sliderValues.value[factor.key] === undefined) {
        sliderValues.value[factor.key] = -1;
      }
    });
    selectedCell.value = null;
    nextTick(() => {
      if (heatmapInstance) {
        heatmapInstance.setOption(heatmapOptions.value, { notMerge: true });
      }
    });
  },
  { deep: true }
);

watch(activeTab, (newTab) => {
  nextTick(() => {
    if (newTab === 'heatmap' && heatmapInstance) {
      heatmapInstance.resize();
    } else if (newTab === 'cluster') {
      if (scatterInstance) scatterInstance.resize();
      if (radarInstance) radarInstance.resize();
      if (sankeyInstance) sankeyInstance.resize();
    }
  });
});

</script>

<style scoped>
.analysis-container {
  padding: 24px;
  background-color: #f9fafb;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.page-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1f2d3d;
}

.page-header p {
  font-size: 1.1rem;
  color: #6b7280;
  max-width: 800px;
  margin: 0.5rem auto 0;
}

.main-tabs {
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

:deep(.el-tabs__content) {
  padding: 24px;
}

.control-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.control-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #111827;
}

.control-description {
  font-size: 0.9rem;
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 2rem;
  background-color: #f3f4f6;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #6366f1;
}

.slider-item {
  margin-bottom: 2.5rem;
}

.slider-item:last-child {
  margin-bottom: 1rem;
}

.slider-label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: #374151;
}

.result-card {
  text-align: center;
  padding: 1.5rem;
  border-radius: 12px;
  transition: background-color 0.4s ease, color 0.4s ease;
  border: none;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.result-content {
  transition: color 0.4s ease;
}

.result-header {
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.9;
}

.percentage-display {
  margin: 0.5rem 0;
  display: flex;
  justify-content: center;
  align-items: baseline;
}

.percentage-value {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1;
}

.percentage-symbol {
  font-size: 1.8rem;
  font-weight: 600;
  margin-left: 0.5rem;
  opacity: 0.7;
}

.sample-size,
.result-description {
  font-size: 0.9rem;
}

.loading-state {
  color: #6b7280;
}

.sample-error-alert {
  margin-top: -10px;
  margin-bottom: 30px;
  border-radius: 8px;
  z-index: 10;
  position: relative;
}

.cluster-card {
  margin-top: 30px;
}

.card-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.heatmap-description {
  color: #4b5563;
  margin-top: -10px;
  margin-bottom: 15px;
  font-size: 0.9rem;
  background-color: #f3f4f6;
  padding: 10px;
  border-radius: 4px;
  line-height: 1.5;
}

.placeholder-text {
  color: #909399;
}

.cell-details p {
  margin: 8px 0;
  color: #374151;
}

.cell-details .detail-value {
  font-weight: 600;
  color: #111827;
}

.condition-list {
  padding-left: 20px;
  margin-top: 5px;
  list-style-type: disc;
}
</style>