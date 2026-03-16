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
 * 年度任务量统计项（按季度）
 */
export interface TaskYearlyCountItem {
  year: string; // 年份，如 "2024"
  count: number; // 该季度任务数量
  type: string;
}

/**
 * 年度任务量统计结果
 */
export type TaskYearlyCount = TaskYearlyCountItem[];

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

// 配套的类型定义（建议放在同目录的types.ts或当前文件中）
export interface CodeStandardPassRate {
  passed: number; // 通过的代码规范检查数量
  failed: number; // 未通过的代码规范检查数量
}

// 配套的类型定义（需和接口返回数据结构对应）
export interface MonthlyCodeQuality {
  /** 月份，格式：YYYY-MM */
  month: string;
  /** 代码质量综合评分，范围：0-100 */
  overallScore: number;
}

export interface YearlyCodeQuality {
  /** 年份，格式：YYYY */
  year: string;
  /** 代码质量综合评分，范围：0-100 */
  overallScore: number;
}

/**
 * 用户操作热力图数据项
 * - module: 功能模块标识（如 system:user / workflow / taskmanagement）
 * - timeSlot: 时间槽（通常为 YYYY-MM-DD）
 * - count: 该时间槽内的操作次数
 */
export interface UserOperationHeatmapItem {
  module: string;
  timeSlot: string;
  count: number;
}

/**
 * 用户操作热力图返回结果
 */
export type UserOperationHeatmap = UserOperationHeatmapItem[];

/**
 * 活跃用户分布数据项
 */
export interface ActiveUserDistributionItem {
  timeSlot: string; // 时间段，如 "0-2点"
  count: number; // 用户数量
}

/**
 * 活跃用户分布返回结果
 */
export type ActiveUserDistribution = ActiveUserDistributionItem[];

/**
 * 峰值时段分析数据项
 */
export interface PeakTimeAnalysisItem {
  hour: string; // 小时，如 "0", "2", "4" 等
  count: number; // 用户数量
}

/**
 * 峰值时段分析返回结果
 */
export type PeakTimeAnalysis = PeakTimeAnalysisItem[];

/**
 * 在线用户数量返回结果
 */
export interface OnlineUserCount {
  count: number; // 当前在线用户数量
}

/**
 * 系统负载数据项
 */
export interface SystemLoadItem {
  timestamp: string; // 时间戳
  cpuUsage: number; // CPU使用率（百分比）
  memoryUsage: number; // 内存使用率（百分比）
  gpuUsage?: number; // GPU使用率（百分比，可选）
}

/**
 * 系统负载返回结果
 */
export type SystemLoad = SystemLoadItem[];

/**
 * 漏洞修复效率数据项
 */
export interface VulnerabilityFixEfficiencyItem {
  date: string; // 日期，格式：YYYY-MM-DD
  critical: number; // 重危漏洞数量
  high: number; // 高危漏洞数量
  medium: number; // 中危漏洞数量
  low: number; // 低危漏洞数量
}

/**
 * 漏洞修复效率返回结果
 */
export type VulnerabilityFixEfficiency = VulnerabilityFixEfficiencyItem[];
