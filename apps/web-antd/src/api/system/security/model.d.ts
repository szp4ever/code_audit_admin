export interface SecurityConfig {
  /**
   * 白名单 IP 或 IP 段，多个使用英文逗号分隔
   * 支持格式：
   * - 单个IP：192.168.1.1
   * - CIDR格式：192.168.1.0/24
   * - IP范围：192.168.1.1-192.168.1.100
   * - 通配符：192.168.1.* 或 192.168.*.*
   */
  whitelistIps: string;

  /**
   * 空闲超时时间，单位：分钟
   */
  idleTimeoutMinutes: number;

  /**
   * 注册/初始密码最小长度
   */
  passwordMinLength: number;

  /**
   * 是否要求包含特殊字符
   * 0: 需要特殊字符
   * 1: 不需要特殊字符
   */
  passwordRequireSpecial: number;
}

