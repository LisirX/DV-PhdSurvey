/**
 * 中心化的颜色映射表。
 * 作用：确保在整个应用的不同图表中，同一字段或类别始终显示相同的颜色，增强数据可读性和用户体验。
 * key: 数据字段或系列名称 (e.g., '求学', 'Yes', 'Strongly agree')
 * value: 对应的十六进制颜色值
 */
export const colorMapping: Record<string, string> = {
  // ======================================================
  // 趋势图系列 (Trend Chart Series)
  // ======================================================
  '求学': '#5470c6',
  '经费': '#91cc75',
  '工时': '#fac858',
  '自由度': '#ee6666',
  '薪资': '#73c0de',
  '平均工时': '#3ba272',

  // ======================================================
  // 通用类别 (General Categorical Options)
  // ======================================================
  'Yes': '#91cc75', // 绿色，表示肯定
  'No': '#ee6666', // 红色，表示否定
  'Prefer Not To Say': '#cccccc', // 灰色，表示中立或未选择

  // ======================================================
  // AgreeLevel (同意程度量表) - 采用蓝-绿-黄-红发散色阶
  // ======================================================
  'Strongly agree': '#5470c6',      // 深蓝 (非常同意)
  'Agree': '#91cc75',               // 绿色 (同意)
  'Neither agree nor disagree': '#fac858', // 黄色 (中立)
  'Disagree': '#f89a9a',             // 浅红 (不同意)
  'Strongly disagree': '#ee6666',      // 深红 (非常不同意)
  'Unsure/Not applicable': '#cccccc', // 灰色 (不确定/不适用)

  // ======================================================
  // DegreeLevel (前景提升程度量表) - 采用蓝-绿-红顺序色阶
  // ======================================================
  'Dramatically': '#5470c6',     // 深蓝 (显著提升)
  'Substantially': '#73c0de',    // 浅蓝 (大幅提升)
  'Somewhat': '#91cc75',          // 绿色 (有所提升)
  'Barely': '#fac858',            // 黄色 (几乎没有)
  'Not at all': '#ee6666',       // 红色 (完全没有)
  'Unsure': '#cccccc',            // 灰色 (不确定)

  // ================== 读博难处（phdRegionDifficulties） =====================
  'Career uncertainty': '#5470c6', // 蓝
  'Academic research jobs': '#91cc75', // 绿
  'Industry research jobs': '#fac858', // 黄
  'Non-research jobs': '#ee6666', // 红
  'Government research jobs': '#73c0de', // 浅蓝
  'Charity/non-profit jobs': '#a120c4', // 紫
  'Other difficulties': '#c070a2', // 粉紫
  'Please specify': '#cccccc', // 灰色（特殊项）
  'Permanent job search': '#3ba272', // 深绿
  'Affordable housing': '#cc9f75', // 棕
  'Work/life balance': '#678e48', // 深绿
  'Cost of living': '#2cc99f', // 青色
  'International student issues': '#264acd', // 靛蓝
  'Future student debt': '#f89a9a', // 浅红
};

/**
 * 备用颜色 (Fallback Color)
 * 当一个类别在上面的映射表中找不到对应颜色时，使用此颜色。
 * 这可以防止程序在遇到未定义类别时崩溃或显示不一致的颜色。
 */
export const FALLBACK_COLOR = '#9e9e9e';

// ======================================================
// 类别顺序映射 (Category Order Mapping) - 【新增部分】
// ======================================================
const agreeLevelOrder = ['Strongly agree', 'Agree', 'Neither agree nor disagree', 'Disagree', 'Strongly disagree', 'Unsure/Not applicable'];
const degreeLevelOrder = ['Dramatically', 'Substantially', 'Somewhat', 'Barely', 'Not at all', 'Unsure'];
const yesNoOrder = ['Yes', 'No', 'Prefer Not To Say'];

/**
 * 为每个分类图表定义固定的、有意义的类别顺序。
 * key: SurveyResponse 中的 dataKey
 * value: 一个包含有序类别名称的数组
 */
export const categoryOrderMapping: Record<string, string[]> = {
  // DegreeLevel 类型的问题
  'careerProspectImprovement': degreeLevelOrder,

  // AgreeLevel 类型的问题
  'honestCareerTalkWithSupervisors': agreeLevelOrder,
  'supervisorAcceptNonAcademic': agreeLevelOrder,
  'supervisorAdviceNonAcademic': agreeLevelOrder,
  'supervisorEncourageCareerTraining': agreeLevelOrder,

  // Yes/No 类型的问题
  'soughtMentalHealthHelp': yesNoOrder,
  'wantAcademicCareer': ['Yes', 'No'], // 这个没有 'Prefer Not to Say'
};