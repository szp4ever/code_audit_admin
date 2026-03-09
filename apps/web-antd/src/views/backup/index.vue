<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { BackupRecord } from '#/api/backup/model';

import { onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { getVxePopupContainer } from '@vben/utils';

import { Modal, Popconfirm, Space, message } from 'ant-design-vue';

import {
  addSortParams,
  useVbenVxeGrid,
  vxeCheckboxChecked,
} from '#/adapter/vxe-table';
import {
  backupList,
  backupCreate,
  backupDownload,
  backupRemove,
  getBackupScheduleConfig,
  saveBackupScheduleConfig,
} from '#/api/backup';
import { downloadByData } from '#/utils/file/download';

import { columns, querySchema } from './data';
import scheduleModal from './schedule-modal.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  fieldMappingTime: [
    [
      'createTime',
      ['params[beginTime]', 'params[endTime]'],
      ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
    ],
  ],
};

const gridOptions: VxeGridProps<BackupRecord> = {
  checkboxConfig: {
    highlight: true,
    reserve: true,
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page, sorts }, formValues = {}) => {
        // 转换搜索条件中的状态值
        // 字典值：0=成功，1=失败
        // 备份状态：0=失败，1=成功
        // 需要进行转换：字典值 0 -> 备份状态 1，字典值 1 -> 备份状态 0
        const convertedFormValues = { ...formValues };
        if (convertedFormValues.status !== undefined && convertedFormValues.status !== null && convertedFormValues.status !== '') {
          const dictStatus = String(convertedFormValues.status);
          // 字典值 "0"（成功）-> 备份状态 1，字典值 "1"（失败）-> 备份状态 0
          convertedFormValues.status = dictStatus === '0' ? 1 : 0;
        }
        const params = {
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...convertedFormValues,
        };
        addSortParams(params, sorts);
        return await backupList(params);
      },
    },
  },
  rowConfig: {
    keyField: 'backupId',
  },
  sortConfig: {
    remote: true,
    multiple: true,
  },
  id: 'backup-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents: {
    sortChange: () => tableApi.query(),
  },
});

const [ScheduleModal, scheduleModalApi] = useVbenModal({
  connectedComponent: scheduleModal,
});

// 定时备份配置状态
const scheduleEnabled = ref(false);
const scheduleConfig = ref<any>(null);

// 加载定时备份配置
async function loadScheduleConfig() {
  try {
    const config = await getBackupScheduleConfig();
    scheduleConfig.value = config;
    // enabled: 0-启用，1-不启用
    scheduleEnabled.value = config?.enabled === 0;
  } catch (error) {
    console.error('加载定时备份配置失败:', error);
  }
}

// 切换定时备份状态
async function handleScheduleToggle(checked: boolean) {
  if (!checked) {
    Modal.confirm({
      title: '提示',
      content: '确定要关闭定时备份吗？',
      onOk: async () => {
        try {
          await saveBackupScheduleConfig({
            ...scheduleConfig.value,
            // 1 表示不启用
            enabled: 1,
          });
          scheduleEnabled.value = false;
          message.success('已关闭定时备份');
          await loadScheduleConfig();
        } catch (error) {
          message.error('操作失败');
        }
      },
    });
  } else {
    scheduleModalApi.setData({ config: scheduleConfig.value });
    scheduleModalApi.open();
  }
}

// 配置定时备份
function handleScheduleConfig() {
  scheduleModalApi.setData({ config: scheduleConfig.value });
  scheduleModalApi.open();
}

// 手动备份
function handleBackup() {
  Modal.confirm({
    title: '确认备份',
    content: '确定要立即执行数据库备份吗？备份过程可能需要一些时间，请耐心等待。',
    okText: '确认备份',
    cancelText: '取消',
    onOk: async () => {
      try {
        const hideLoading = message.loading('正在备份数据库，请稍候...', 0);
        const backupRecord = await backupCreate();
        hideLoading();
        
        if (backupRecord?.backupId) {
          // 备份成功后自动下载
          try {
            const hideDownloadLoading = message.loading('正在下载备份文件...', 0);
            const blob = await backupDownload(backupRecord.backupId);
            hideDownloadLoading();
            downloadByData(
              blob,
              backupRecord.fileName || `backup_${backupRecord.backupId}.sql`,
            );
            message.success('备份并下载成功');
          } catch (downloadError) {
            message.warning('备份成功，但下载失败，请稍后手动下载');
          }
        } else {
          message.success('备份成功');
        }
        
        await tableApi.query();
      } catch (error) {
        message.error('备份失败，请稍后重试');
      }
    },
  });
}

// 下载备份
async function handleDownload(record: BackupRecord) {
  try {
    const hideLoading = message.loading('正在下载备份文件...', 0);
    const blob = await backupDownload(record.backupId!);
    hideLoading();
    downloadByData(blob, record.fileName || `backup_${record.backupId}.sql`);
    message.success('下载成功');
  } catch (error) {
    message.error('下载失败');
  }
}

// 删除备份
function handleDelete(record: BackupRecord) {
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除备份文件 "${record.fileName}" 吗？`,
    onOk: async () => {
      await backupRemove(record.backupId!);
      await tableApi.query();
    },
  });
}

// 批量删除
function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: BackupRecord) => row.backupId);
  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的 ${ids.length} 个备份文件吗？`,
    onOk: async () => {
      await backupRemove(ids);
      await tableApi.query();
    },
  });
}

// 初始化
onMounted(() => {
  loadScheduleConfig();
});
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="数据备份管理">
      <template #toolbar-tools>
        <Space>
          <a-button type="primary" @click="handleBackup">
            <template #icon>
              <iconify-icon icon="lucide:database" />
            </template>
            立即备份
          </a-button>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            danger
            type="primary"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
        </Space>
      </template>
      <template #action="{ row }">
        <Space>
          <ghost-button
            :disabled="row.status !== '1'"
            @click.stop="handleDownload(row)"
          >
            下载
          </ghost-button>
          <Popconfirm
            :get-popup-container="getVxePopupContainer"
            placement="left"
            title="确认删除该备份文件吗？"
            @confirm="handleDelete(row)"
          >
            <ghost-button danger @click.stop="">
              {{ $t('pages.common.delete') }}
            </ghost-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <ScheduleModal @reload="loadScheduleConfig" />
  </Page>
</template>
