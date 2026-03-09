import type { SecurityConfig } from './model';

import { requestClient } from '#/api/request';

enum Api {
  root = '/system/security/config',
}

/**
 * 获取安全配置
 */
export function getSecurityConfig() {
  return requestClient.get<SecurityConfig>(Api.root);
}

/**
 * 更新安全配置
 * 后端根据当前租户 / 系统维度进行持久化
 */
export function updateSecurityConfig(data: SecurityConfig) {
  return requestClient.postWithMsg<void>(Api.root, data);
}

