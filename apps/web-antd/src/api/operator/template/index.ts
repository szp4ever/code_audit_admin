import type { Template, TemplateForm, TemplateQuery } from './model';

import type { ID, IDS, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  add = '/operator/template/add',
  export = '/operator/template/export',
  info = '/operator/template/info',
  list = '/operator/template/list',
  remove = '/operator/template/remove',
  root = '/operator/template',
  update = '/operator/template/update',
}

/**
 * 查询模版列表
 * @param params 查询参数
 * @returns 分页结果
 */
export function templateList(params?: TemplateQuery) {
  return requestClient.get<PageResult<Template>>(Api.list, { params });
}

/**
 * 导出模版列表
 * @param params 导出参数
 * @returns blob
 */
export function templateExport(params?: TemplateQuery) {
  return commonExport(Api.export, params ?? {});
}

/**
 * 查询模版详情
 * @param id 模版ID
 * @returns 模版信息
 */
export function templateInfo(id: ID) {
  return requestClient.get<Template>(`${Api.info}/${id}`);
}

/**
 * 新增模版
 * @param data 模版数据
 * @returns void
 */
export function templateAdd(data: TemplateForm) {
  return requestClient.postWithMsg<void>(Api.add, data);
}

/**
 * 修改模版
 * @param data 模版数据
 * @returns void
 */
export function templateUpdate(data: TemplateForm) {
  return requestClient.putWithMsg<void>(Api.update, data);
}

/**
 * 删除模版
 * @param ids id数组
 * @returns void
 */
export function templateRemove(ids: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.remove}/${ids}`);
}
