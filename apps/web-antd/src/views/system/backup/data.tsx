import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { BackupRecord } from '#/api/backup/model';

import { DictEnum } from '@vben/constants';

import dayjs from 'dayjs';

import { getDictOptions } from '#/utils/dict';
import { renderDict } from '#/utils/render';
import { calculateFileSize } from '#/utils/file';

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'fileName',
    label: '备份文件名',
  },
  {
    component: 'Select',
    componentProps: {
      options: getDictOptions(DictEnum.SYS_COMMON_STATUS),
    },
    fieldName: 'status',
    label: '备份状态',
  },
  {
    component: 'RangePicker',
    fieldName: 'createTime',
    label: '备份时间',
    componentProps: {
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
  },
];

export const columns: VxeGridProps<BackupRecord>['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    field: 'fileName',
    title: '备份文件名',
    minWidth: 200,
  },
  {
    field: 'fileSize',
    title: '文件大小',
    width: 120,
    formatter({ cellValue }) {
      if (!cellValue) return '-';
      const size = Number(cellValue);
      return calculateFileSize(size);
    },
  },
  {
    field: 'status',
    title: '备份状态',
    width: 100,
    slots: {
      default: ({ row }) => {
        // 备份状态：0-失败，1-成功
        // sys_common_status 字典：0-正常/成功，1-停用/失败
        // 需要进行值转换：1 -> 0, 0 -> 1
        const statusValue = row.status;
        const convertedStatus = statusValue === 0 || statusValue === '0' ? '1' : '0';
        return renderDict(convertedStatus, DictEnum.SYS_COMMON_STATUS);
      },
    },
  },
  {
    field: 'backupTime',
    title: '备份时间',
    width: 180,
    formatter({ cellValue }) {
      if (!cellValue) return '-';
      return dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss');
    },
  },
  {
    field: 'createTime',
    title: '创建时间',
    width: 180,
    formatter({ cellValue }) {
      if (!cellValue) return '-';
      return dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss');
    },
  },
  {
    field: 'remark',
    title: '备注',
    minWidth: 150,
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    width: 180,
  },
];

