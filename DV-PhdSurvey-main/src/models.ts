/* GeographicGraphComponent Start */

// 国家信息，仅包含名称（代码不是必需）
export interface Country {
  name: string       // 国家名称，例如 "China"
  code?: string      // 可选：国家代码，例如 "CN"
}

/* GeographicGraphComponent End */

/* DataType Start */
export type SurveyYear = 2017 | 2019 | 2022; // 调查年份
export type DegreeLevel = 'Barely' | 'Dramatically' | 'Not at all' 
| 'Somewhat' | 'Substantially' | 'Unsure';
export type AgreeLevel = 'Agree' | 'Disagree' | 'Neither agree nor disagree' 
| 'Strongly agree' | 'Strongly disagree' | 'Unsure/Not applicable';
export type WorkHourRange = '<11' | '11-20'            
  | '21-30' | '31-40' | '41-50' | '51-60' | '61-70'
  | "71-80" | '>80';

export type SurveyResponse = {
  responseID: number;                             // 数据ID
  dataYear: SurveyYear;                           // 数据年份
  country: string;                                // 所在国家
  studyReasons: string[];                         // 求学原因（多选）
  reconsiderReasons: string[];                    // 重新选择的原因（多选）
  phdRegionDifficulties: string[];                // 所在地区读博难点（多选）
  careerInfoSources: string[];                    // 了解职业途径（多选）
  reasonsNoAcademicCareer: string[];              // 不想做学术研究的原因（多选）
  careerProspectImprovement: DegreeLevel;         // 职业前景提升（单选）
  honestCareerTalkWithSupervisors: AgreeLevel;    // 是否能与导师真诚交流职业发展（单选）
  supervisorAcceptNonAcademic: AgreeLevel;        // 导师是否接受非学术职业（单选）
  supervisorAdviceNonAcademic: AgreeLevel;        // 导师是否能提供非学术职业建议（单选）
  supervisorEncourageCareerTraining: AgreeLevel;  // 导师是否鼓励职业训练（单选）
  soughtMentalHealthHelp: 'Yes' | 'No' 
  | 'Prefer Not To Say';                          // 是否寻求心理帮助
  wantAcademicCareer: 'Yes' | 'No';               // 是否愿意从事学术研究
  satisfactionStudyPeriod: number;                // 求学满意度
  satisfactionFunding: number;                    // 经费满意度
  satisfactionWorkHours: number;                  // 工作时长满意度
  satisfactionFreedom: number;                    // 自由度满意度
  satisfactionPay: number;                        // 薪资满意度
  avgWeeklyWorkHours: WorkHourRange;              // 每周工作时长（小时）
};
/* DataType End */

/* CovidType Start */

export type CovidSurveyResponse = {
  responseID: number;                             // 数据ID
  dataYear: SurveyYear;                           // 数据年份
  covidImpact: -1 | 0 | 1;                        // 疫情对博士学位项目的影响
  // 1 代表觉得疫情对博士学位项目有积极影响，0 代表没有影响，-1 代表觉得疫情对博士学位项目有消极影响
}; 

/* CovidType End */