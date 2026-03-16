import type {
  TaskDurationStats,
  TaskStatusStats,
  TaskTypeStats,
  TaskMonthlyCount,
  TaskQuarterlyStats, RealTimeTaskCount, TaskYearlyCount, CodeStandardPassRate, MonthlyCodeQuality,
  YearlyCodeQuality,ActiveUserDistribution,PeakTimeAnalysis,OnlineUserCount,SystemLoad,VulnerabilityFixEfficiency
} from './model';

import { requestClient } from '#/api/request';

enum Api {
  statsStatus = '/taskmanagement/stats/status',
  statsType = '/taskmanagement/stats/type',
  statsDuration = '/taskmanagement/stats/duration',
  userOperationHeatmap = '/taskmanagement/stats/user-operation-heatmap',
  monthlyCount = '/taskmanagement/monthlycount',
  yearlyCount = '/taskmanagement/yearlycount',
  statsQuarterly = '/taskmanagement/stats/quarterly',
  realtimeCount = '/taskmanagement/realtime_count',
  codeStandardPassRate = '/taskmanagement/code_standard_pass_rate',
  monthlyCodeQuality = '/taskmanagement/monthly_code_Quality',
  yearlyCodeQuality = '/taskmanagement/yearly_code_Quality',
  activeUserDistribution = '/taskmanagement/stats/active-user-distribution',
  peakTimeAnalysis = '/taskmanagement/stats/peak-time-analysis',
  onlineUserCount = '/taskmanagement/stats/online-user-count',
  systemLoad = '/taskmanagement/stats/system-load',
  vulnerabilityFixEfficiency = '/taskmanagement/stats/vulnerability-fix-efficiency',
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
 * 获取用户操作热力图数据
 * @param params timeRange: day|week|month（默认 week）；startDate/endDate: YYYY-MM-DD
 */
export function getUserOperationHeatmap(params?: {
  timeRange?: 'day' | 'month' | 'week';
  startDate?: string;
  endDate?: string;
}) {
  return requestClient.get<import('./model').UserOperationHeatmap>(Api.userOperationHeatmap, {
    params,
  });
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

/**
 * 获取活跃用户分布
 * @param params - 查询参数（日期，格式：YYYY-MM-DD）
 * @returns 活跃用户分布结果
 */
export function getActiveUserDistribution(params?: { date: string }) {
  return requestClient.get<ActiveUserDistribution>(Api.activeUserDistribution, { params });
}

/**
 * 获取峰值时段分析
 * @param params - 查询参数（日期，格式：YYYY-MM-DD）
 * @returns 峰值时段分析结果
 */
export function getPeakTimeAnalysis(params: { date: string }) {
  return requestClient.get<PeakTimeAnalysis>(Api.peakTimeAnalysis, { params });
}

/**
 * 获取在线用户数量
 * @returns 在线用户数量结果
 */
export function getOnlineUserCount() {
  return requestClient.get<OnlineUserCount>(Api.onlineUserCount);
}

/**
 * 获取系统负载数据
 * @param params - 查询参数（时间范围：1h|24h）
 * @returns 系统负载数据结果
 */
export function getSystemLoad(params: { timeRange: '1h' | '24h' }) {
  return requestClient.get<SystemLoad>(Api.systemLoad, { params });
}

/**
 * 获取漏洞修复效率数据
 * @param params - 查询参数（开始日期和结束日期，格式：YYYY-MM-DD）
 * @returns 漏洞修复效率数据结果
 */
export function getVulnerabilityFixEfficiency(params: { startDate: string; endDate: string }) {
  return requestClient.get<VulnerabilityFixEfficiency>(Api.vulnerabilityFixEfficiency, { params });
}



