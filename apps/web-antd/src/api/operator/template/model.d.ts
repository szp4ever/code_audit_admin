import type { BaseEntity, PageQuery } from '#/api/common';

/**
 * 模版视图对象 (对应 sys_template 表结构)
 */
export interface Template {
  /** 主键 */
  template_id: number | string;

  /** 模版名称 */
  template_name: string;

  /** 模版编码 */
  template_code: string;

  /** 模版内容 */
  template_content: string;

  /** 模版类型 (1=提示词, 2=消息通知) */
  template_type: string;

  /** 状态 (0=正常, 1=停用) */
  status: string;

  /** 备注 */
  remark: string;

  /** 创建者 */
  create_by?: string;

  /** 创建时间 */
  create_time?: string;

  /** 更新者 */
  update_by?: string;

  /** 更新时间 */
  update_time?: string;
}

/**
 * 模版表单对象 (新增/修改)
 */
export interface TemplateForm extends BaseEntity {
  /** 主键 (修改时必传) */
  template_id?: number | string;

  template_name?: string;
  template_code?: string;
  template_content?: string;
  template_type?: string;
  status?: string;
  remark?: string;
}

/**
 * 查询参数
 */
export interface TemplateQuery extends PageQuery {
  template_name?: string;
  template_code?: string;
  status?: string;
  /** 日期范围等其他参数 */
  params?: any;
}
