import type { PageQuery, PageResult } from '#/api/common';

/**
 * 备份记录
 */
export interface BackupRecord {
  /** 备份ID */
  backupId?: string | number;
  /** 备份文件名 */
  fileName?: string;
  /** 备份文件大小（字节） */
  fileSize?: number;
  /** 备份时间 */
  backupTime?: string;
  /** 备份状态：0-失败，1-成功 */
  status?: string | number;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createTime?: string;
}

/**
 * 备份查询参数
 */
export interface BackupQueryParams extends PageQuery {
  fileName?: string;
  status?: string | number;
  beginTime?: string;
  endTime?: string;
}

/**
 * 定时备份配置
 */
export interface BackupScheduleConfig {
  /** 是否启用定时备份 */
  /**
   * 是否启用定时备份
   * 0 - 启用
   * 1 - 不启用
   */
  enabled?: 0 | 1;
  /** Cron 表达式 */
  cronExpression?: string;
  /** 保留备份数量 */
  keepCount?: number;
}
