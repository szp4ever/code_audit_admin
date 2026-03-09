import type {
  TaskDurationStats,
  TaskStatusStats,
  TaskTypeStats,
  TaskMonthlyCount,
  TaskQuarterlyStats, RealTimeTaskCount, TaskYearlyCount, CodeStandardPassRate, MonthlyCodeQuality,
  YearlyCodeQuality
} from './model';

import { requestClient } from '#/api/request';

enum Api {
  statsStatus = '/taskmanagement/stats/status',
  statsType = '/taskmanagement/stats/type',
  statsDuration = '/taskmanagement/stats/duration',
  monthlyCount = '/taskmanagement/monthlycount',
  yearlyCount = '/taskmanagement/yearlycount',
  statsQuarterly = '/taskmanagement/stats/quarterly',
  realtimeCount = '/taskmanagement/realtime_count',
  codeStandardPassRate = '/taskmanagement/code_standard_pass_rate',
  monthlyCodeQuality = '/taskmanagement/monthly_code_Quality',
  yearlyCodeQuality = '/taskmanagement/yearly_code_Quality',
}

/**
 * 获取任务状态统计
 * @returns 任务状态统计结果
 */
export function getTaskStatusStats() {
  return requestClient.get<TaskStatusStats>(Api.statsStatus);
}

/**
 * 获取任务类型统计
 * @returns 任务类型统计结果
 */
export function getTaskTypeStats() {
  return requestClient.get<TaskTypeStats>(Api.statsType);
}

/**
 * 获取任务耗时统计
 * @param timeRange 时间范围：day|hour|week
 * @returns 任务耗时统计结果
 */
export function getTaskDurationStats(timeRange?: 'day' | 'hour' | 'week') {
  return requestClient.get<TaskDurationStats>(Api.statsDuration, {
    params: timeRange ? { timeRange } : undefined,
  });
}

/**
 * 获取月度任务量统计
 */
export function getMonthlyTaskCount(params: { start: string; end: string }) {
  return requestClient.get<TaskMonthlyCount>(Api.monthlyCount, { params });
}
/**
 * 获取年度任务量统计
 */
export function getYearlyTaskCount(params: { start: string; end: string }) {
  return requestClient.get<TaskYearlyCount>(Api.yearlyCount, { params });
}


/**
 * 获取季度统计
 */
export function getQuarterlyTaskStats(params: { year: string }) {
  return requestClient.get<TaskQuarterlyStats>(Api.statsQuarterly, { params });
}

/**
 * 获取实时任务状态数量
 */
export function getRealTimeTaskCount() {
  return requestClient.get<RealTimeTaskCount>(Api.realtimeCount);
}

/**
 * 获取代码规范检查通过率统计
 * @param params - 查询参数（开始年月/结束年月，格式：YYYY-MM）
 * @returns 代码规范检查通过/未通过数量统计
 */
export function getCodeStandardPassRate(params: { start: string; end: string }) {
  return requestClient.get<CodeStandardPassRate>(Api.codeStandardPassRate, { params });
}

/**
 * 获取月度代码质量综合评分统计
 * @param params - 查询参数（开始年月/结束年月，格式：YYYY-MM）
 * @returns 月度代码质量综合评分列表
 */
export function getMonthlyCodeQuality(params: { start: string; end: string }) {
  return requestClient.get<MonthlyCodeQuality[]>(Api.monthlyCodeQuality, { params });
}

/**
 * 获取年度代码质量综合评分统计
 * @param params - 查询参数（开始年份/结束年份，格式：YYYY）
 * @returns 年度代码质量综合评分列表
 */
export function getYearlyCodeQuality(params: { start: string; end: string }) {
  return requestClient.get<YearlyCodeQuality[]>(Api.yearlyCodeQuality, { params });
}



