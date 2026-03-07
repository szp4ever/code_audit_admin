import type {
  TaskDurationStats,
  TaskStatusStats,
  TaskTypeStats,
  TaskMonthlyCount,
  TaskQuarterlyStats, RealTimeTaskCount, TaskYearlyCount
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
