import type { VxeGridProps } from '#/adapter/vxe-table';

// ==========================================
// 1. 表格列配置 (VxeTable)
// ⚠️ 注意：这里必须使用 "field"，绝对不能改名！
// ==========================================
// 表格列配置
export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 50, fixed: 'left' },
  {
    title: '模板ID',
    field: 'template_id',
    width: 80,
  },
  {
    title: '模板名称',
    field: 'template_name',
    minWidth: 150,
  },
  {
    title: '模板编码',
    field: 'template_code',
    width: 150,
  },
  {
    title: '模板类型',
    field: 'template_type',
    width: 140,
    slots: { default: 'template_type' },
  },
  {
    title: '内容/文件',
    field: 'file_path',
    minWidth: 220,
    slots: { default: 'file_path' },
  },
  {
    title: '状态',
    field: 'status',
    width: 100,
    slots: { default: 'status' },
  },
  {
    title: '创建人',
    field: 'create_by',
    width: 120,
  },
  // [修改] 开启排序，并且格式化为精确时间 (YYYY-MM-DD HH:mm:ss)
  {
    title: '创建时间',
    field: 'create_time',
    width: 160,
    sortable: true,
    formatter: 'formatDateTime', // 改为 formatDateTime
  },
  // [修改] 开启排序，并且格式化为精确时间
  {
    title: '更新时间',
    field: 'update_time',
    width: 160,
    sortable: true,
    formatter: 'formatDateTime', // 改为 formatDateTime
  },
  {
    title: '操作',
    width: 140,
    fixed: 'right',
    slots: { default: 'action' },
  },
];

// ==========================================
// 2. 搜索表单配置 (Vben Form)
// ⚠️ 注意：这里必须使用 "fieldName"，否则会白屏！
// ==========================================
export const searchFormSchema = [
  {
    fieldName: 'template_id', // [必须是 fieldName]
    label: '模板ID',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    fieldName: 'template_name', // [必须是 fieldName]
    label: '模板名称',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    fieldName: 'template_code', // [必须是 fieldName]
    label: '模板编码',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    fieldName: 'create_by', // [必须是 fieldName]
    label: '创建人',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    fieldName: 'template_type', // [必须是 fieldName]
    label: '模板类型',
    component: 'Select',
    componentProps: {
      options: [
        { label: '文本内容', value: '1' },
        { label: 'Word 模板', value: '2' },
      ],
    },
    colProps: { span: 6 },
  },
  {
    fieldName: 'status', // [必须是 fieldName]
    label: '状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '正常', value: '0' },
        { label: '停用', value: '1' },
      ],
    },
    colProps: { span: 6 },
  },
  {
    fieldName: 'create_time', // [必须是 fieldName]
    label: '创建时间',
    component: 'RangePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
    },
    colProps: { span: 6 },
  },
  {
    fieldName: 'update_time', // [必须是 fieldName]
    label: '更新时间',
    component: 'RangePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
    },
    colProps: { span: 6 },
  },
];
