import { ElMessage } from "element-plus";
import { CovidSurveyResponse, SurveyResponse } from "@/models.ts";

const DATA_BASE_URL = import.meta.env.BASE_URL;

async function GET(path: string) {
  try {
    const type = path.endsWith('.json') ? 'json' : 'text';
    if (path.startsWith('/')) path = path.slice(1);
    const resp = await fetch(DATA_BASE_URL + path)
    if (!resp.ok) {
      throw new Error(`Failed to fetch ${path}: ${resp.status} ${resp.statusText}`);
    }
    if (type === 'json') {
      return await resp.json();
    } else if (type === 'text') {
      return await resp.text();
    } else {
      throw new Error(`Unsupported type: ${type}`);
    }
  } catch (e) {
    console.error('Error GET ' + path)
    ElMessage.error({
      message: '发生网络错误，请重试！',
      duration: 5000000,
    });
    throw e;
  }
}
/**
 * @returns 返回所有调查的数据集
 */
export async function loadSurveyData() {
  return await GET(`/survey-data/survey-data.json`) as SurveyResponse[];
}

/**
 * @returns 返回Covid相关数据集
 */
export async function loadCovidData() {
  return await GET(`/survey-data/covid-data.json`) as CovidSurveyResponse[];
}