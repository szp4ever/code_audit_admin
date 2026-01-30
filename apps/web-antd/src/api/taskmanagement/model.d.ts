/**
 * 任务管理实体
 */
export interface TaskManagement {
  id: string;
  title: string;
  createDept?: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  taskType: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createTime: string;
  updateBy?: string;
  updateTime: string;
  remark?: string;
  delFlag: number;
  tenantId?: string;
}

/**
 * 任务状态统计结果
 */
export interface TaskStatusStats {
  [status: string]: number;
}

/**
 * 任务类型统计结果
 */
export interface TaskTypeStats {
  [taskType: string]: number;
}

/**
 * 任务耗时统计项
 */
export interface TaskDurationStatItem {
  date: string;
  avgDuration: number; // 平均耗时（秒）
  count: number; // 任务数量
}

/**
 * 任务耗时统计结果
 */
export type TaskDurationStats = TaskDurationStatItem[];

/**
 * 月度任务量统计项
 */
export interface TaskMonthlyCountItem {
  month: string; // 年月，如 "2024-01"
  count: number; // 该月任务数量
  type: string;
}

/**
 * 月度任务量统计结果
 */
export type TaskMonthlyCount  = TaskMonthlyCountItem[];

/**
 * 季度统计项
 */
export interface TaskQuarterlyStatsItem {
  quarter: string; // 季度标识，如 "Q1"
  total: number; // 该季度总任务量
  success: number; // 该季度成功任务数
  fail: number; // 该季度失败任务数
  successRate: number; // 该季度成功率（小数形式，如 0.8 对应 80%）
  failRate: number; // 该季度失败率（小数形式，如 0.2 对应 20%）
}
export type TaskQuarterlyStats = TaskQuarterlyStatsItem[];
/**
 * 实时任务统计
 */
export interface RealTimeTaskCount {
  inProgressCount: number;
  pendingCount: number;
  completeCount: number;
}

