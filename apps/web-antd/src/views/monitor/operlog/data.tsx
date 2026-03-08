import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { DescItem } from '#/components/description';

import { DictEnum } from '@vben/constants';

import { Tag } from 'ant-design-vue';
import dayjs from 'dayjs';

import { getDictOptions } from '#/utils/dict';
import {
  renderDict,
  renderHttpMethodTag,
  renderJsonPreview,
} from '#/utils/render';

import { createKeywordHistory } from '../keyword-history';

/**
 * 行内关键字字段名
 */
const HIGHLIGHT_KEY_PROP = '__keyword';

/**
 * 关键字搜索历史（仅当前页面使用）
 */
const OPERLOG_KEYWORD_HISTORY_KEY = 'monitor:operlog:keywordHistory';
const operlogKeywordHistory = createKeywordHistory(OPERLOG_KEYWORD_HISTORY_KEY);

function getRowKeyword(row: Record<string, any>): string {
  return (row?.[HIGHLIGHT_KEY_PROP] as string) || '';
}

/**
 * 文本高亮渲染
 * @param text 单元格原始文本
 * @param row 当前行数据（包含关键字）
 */
function renderHighlightText(text: unknown, row: Record<string, any>) {
  const value = text == null ? '' : String(text);
  const keyword = getRowKeyword(row).trim();

  if (!keyword) return value;

  const lowerText = value.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();

  if (!lowerText.includes(lowerKeyword)) {
    return value;
  }

  const nodes: (string | JSX.Element)[] = [];
  let start = 0;

  while (true) {
    const index = lowerText.indexOf(lowerKeyword, start);
    if (index === -1) {
      if (start < value.length) {
        nodes.push(value.slice(start));
      }
      break;
    }

    if (index > start) {
      nodes.push(value.slice(start, index));
    }

    const match = value.slice(index, index + keyword.length);
    nodes.push(
      <span class="bg-yellow-200 text-red-600 dark:bg-yellow-700/60">
        {match}
      </span>,
    );

    start = index + keyword.length;
  }

  return nodes;
}

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'AutoComplete',
    fieldName: 'keyword',
    label: '关键字',
    componentProps: {
      placeholder: '支持系统模块、操作人员、IP地址等模糊搜索',
      allowClear: true,
      // 聚焦时同步一次本地历史，点击输入框即可看到历史记录
      options: operlogKeywordHistory.options,
      onFocus() {
        operlogKeywordHistory.syncFromStorage();
      },
    },
  },
  {
    component: 'Input',
    fieldName: 'title',
    label: '系统模块',
  },
  {
    component: 'Input',
    fieldName: 'operName',
    label: '操作人员',
  },
  {
    component: 'Select',
    componentProps: {
      options: getDictOptions(DictEnum.SYS_OPER_TYPE),
    },
    fieldName: 'businessType',
    label: '操作类型',
  },
  {
    component: 'Input',
    fieldName: 'operIp',
    label: '操作IP',
  },
  {
    component: 'Select',
    componentProps: {
      options: getDictOptions(DictEnum.SYS_COMMON_STATUS),
    },
    fieldName: 'status',
    label: '状态',
  },
  {
    component: 'RangePicker',
    fieldName: 'createTime',
    label: '操作时间',
    componentProps: {
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    field: 'title',
    title: '系统模块',
    slots: {
      default: ({ row }) => renderHighlightText(row.title, row),
    },
  },
  {
    title: '操作类型',
    field: 'businessType',
    slots: {
      default: ({ row }) => {
        return renderDict(row.businessType, DictEnum.SYS_OPER_TYPE);
      },
    },
  },
  {
    field: 'operName',
    title: '操作人员',
    slots: {
      default: ({ row }) => renderHighlightText(row.operName, row),
    },
  },
  {
    field: 'operIp',
    title: 'IP地址',
    slots: {
      default: ({ row }) => renderHighlightText(row.operIp, row),
    },
  },
  {
    field: 'operLocation',
    title: 'IP信息',
    slots: {
      default: ({ row }) => renderHighlightText(row.operLocation, row),
    },
  },
  {
    field: 'status',
    title: '操作状态',
    slots: {
      default: ({ row }) => {
        return renderDict(row.status, DictEnum.SYS_COMMON_STATUS);
      },
    },
  },
  {
    field: 'operTime',
    title: '操作日期',
    sortable: true,
    slots: {
      default: ({ row }) => {
        const value = row.operTime;
        if (!value) return '';
        const formatted = dayjs(value).format('YYYY-MM-DD HH:mm:ss');
        return renderHighlightText(formatted, row);
      },
    },
  },
  {
    field: 'costTime',
    title: '操作耗时',
    sortable: true,
    formatter({ cellValue }) {
      return `${cellValue} ms`;
    },
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    width: 120,
  },
];

export const descSchema: DescItem[] = [
  {
    field: 'operId',
    label: '日志编号',
  },
  {
    field: 'status',
    label: '操作结果',
    render(value) {
      return renderDict(value, DictEnum.SYS_COMMON_STATUS);
    },
  },
  {
    field: 'title',
    label: '操作模块',
    labelMinWidth: 80,
    render(value, { businessType }) {
      const operType = renderDict(businessType, DictEnum.SYS_OPER_TYPE);
      return (
        <div class="flex items-center">
          <Tag>{value}</Tag>
          {operType}
        </div>
      );
    },
  },
  {
    field: 'operIp',
    label: '操作信息',
    render(_, data) {
      return `账号: ${data.operName} / ${data.deptName} / ${data.operIp} / ${data.operLocation}`;
    },
  },
  {
    field: 'operUrl',
    label: '请求信息',
    render(_, data) {
      const { operUrl, requestMethod } = data;
      const methodTag = renderHttpMethodTag(requestMethod);
      return (
        <span>
          {methodTag} {operUrl}
        </span>
      );
    },
  },
  {
    field: 'errorMsg',
    label: '异常信息',
    render(value) {
      return <span class="font-bold text-red-600">{value}</span>;
    },
    show: (data) => {
      return data && data.errorMsg !== '';
    },
  },
  {
    field: 'method',
    label: '方法',
  },
  /**
   * 默认word-break: break-word;会导致json预览样式异常
   */
  {
    field: 'operParam',
    label: '请求参数',
    render(value) {
      return (
        <div class="max-h-[300px] w-full overflow-y-auto">
          {renderJsonPreview(value)}
        </div>
      );
    },
  },
  {
    field: 'jsonResult',
    label: '响应参数',
    render(value) {
      return (
        <div class="max-h-[300px] w-full overflow-y-auto">
          {renderJsonPreview(value)}
        </div>
      );
    },
    show(data) {
      return data && data.jsonResult;
    },
  },
  {
    field: 'costTime',
    label: '耗时',
    render(value) {
      return `${value} ms`;
    },
  },
  {
    field: 'operTime',
    label: '操作时间',
    render(value) {
      if (!value) return '';
      return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
    },
  },
];
