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

