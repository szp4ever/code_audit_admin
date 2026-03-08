import type { BackupQueryParams, BackupRecord, BackupScheduleConfig } from './model';
import type { PageResult, IDS } from '#/api/common';

import { requestClient } from '#/api/request';

enum Api {
  root = '/system/backup',
  list = '/system/backup/list',
  create = '/system/backup/create',
  download = '/system/backup/download',
  remove = '/system/backup/remove',
  scheduleConfig = '/system/backup/schedule/config',
}

/**
 * 获取备份列表
 */
export function backupList(params?: BackupQueryParams) {
  return requestClient.get<PageResult<BackupRecord>>(Api.list, {
    params,
  });
}

/**
 * 创建备份
 */
export function backupCreate() {
  return requestClient.postWithMsg<BackupRecord>(Api.create);
}

/**
 * 下载备份文件
 * @param backupId 备份ID
 */
export function backupDownload(backupId: IDS) {
  return requestClient.get<Blob>(`${Api.download}/${backupId}`, {
    responseType: 'blob',
    isTransformResponse: false,
  });
}

/**
 * 删除备份
 * @param backupIds 备份ID列表
 */
export function backupRemove(backupIds: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.remove}/${backupIds}`);
}

/**
 * 获取定时备份配置
 */
export function getBackupScheduleConfig() {
  return requestClient.get<BackupScheduleConfig>(Api.scheduleConfig);
}

/**
 * 保存定时备份配置
 */
export function saveBackupScheduleConfig(config: BackupScheduleConfig) {
  return requestClient.postWithMsg<void>(Api.scheduleConfig, config);
}
