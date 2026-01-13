import type {
  TaskDurationStats,
  TaskStatusStats,
  TaskTypeStats,
} from './model';

import { requestClient } from '#/api/request';

enum Api {
  statsStatus = '/taskmanagement/stats/status',
  statsType = '/taskmanagement/stats/type',
  statsDuration = '/taskmanagement/stats/duration',
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

