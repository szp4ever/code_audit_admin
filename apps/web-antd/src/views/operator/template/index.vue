<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { getVxePopupContainer } from '@vben/utils';

import { message, Modal, Popconfirm, Space, Tag } from 'ant-design-vue';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import { templateList, templateRemove } from '#/api/operator/template';

import { columns, searchFormSchema } from './data';
import TemplateModal from './template-modal.vue';

// 表单配置
const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: { allowClear: true },
  },
  schema: searchFormSchema as any,
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

// 表格配置
const gridOptions: VxeGridProps = {
  checkboxConfig: { highlight: true, reserve: true },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},

  // [修改 1] 关闭服务端排序 (remote: false)
  // 效果：点击表头时，表格会自动对当前页数据进行排序，不发网络请求，反应极快
  sortConfig: {
    remote: false,
    trigger: 'default', // 点击表头排序
  },

  proxyConfig: {
    ajax: {
      // [修改 2] query 方法中移除了 sort 参数的处理
      // 因为是前端排序，不需要传 orderByColumn 给后端
      query: async ({ page }, formValues = {}) => {
        const params: any = {
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          templateId: formValues.template_id,
          templateName: formValues.template_name,
          templateCode: formValues.template_code,
          templateType: formValues.template_type,
          status: formValues.status,
          createByName: formValues.create_by,
        };

        params.params = {};
        if (formValues.create_time?.length === 2) {
          params.params.beginCreateTime = formValues.create_time[0];
          params.params.endCreateTime = formValues.create_time[1];
        }
        if (formValues.update_time?.length === 2) {
          params.params.beginUpdateTime = formValues.update_time[0];
          params.params.endUpdateTime = formValues.update_time[1];
        }

        return await templateList(params);
      },
    },
  },
  rowConfig: { keyField: 'template_id' },
  id: 'operator-template-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions: gridOptions as any,
});

const [TemplateModalWin, modalApi] = useVbenModal({
  connectedComponent: TemplateModal,
});

function handleAdd() {
  modalApi.setData({});
  modalApi.open();
}

function handleEdit(row: any) {
  modalApi.setData({ ...row });
  modalApi.open();
}

async function handleDelete(row: any) {
  await templateRemove(row.template_id);
  message.success('删除成功');
  tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((r: any) => r.template_id);
  if (ids.length === 0) {
    message.warning('请选择要删除的记录');
    return;
  }

  Modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的 ${ids.length} 条记录吗？`,
    onOk: async () => {
      await templateRemove(ids.join(',') as any);
      message.success('删除成功');
      tableApi.query();
      tableApi.grid.clearCheckboxRow();
    },
  });
}

function getFileName(path: string) {
  if (!path) return '下载文件';
  try {
    const cleanUrl = path.split('?')[0] || '';
    if (!cleanUrl) return '下载文件';
    const fileName = cleanUrl.split('/').pop();
    return fileName || '下载文件';
  } catch {
    return '下载文件';
  }
}

function getTemplateTypeConfig(type: string) {
  const map: Record<string, any> = {
    '1': { text: '文本内容', color: 'blue' },
    '2': { text: 'Word 模板', color: 'cyan' },
  };
  return map[type] || { text: '未知', color: 'default' };
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="模板列表">
      <template #toolbar-tools>
        <Space>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            danger
            type="primary"
            v-access:code="['operator:template:remove']"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button
            type="primary"
            v-access:code="['operator:template:add']"
            @click="handleAdd"
          >
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>

      <template #template_type="{ row }">
        <Tag :color="getTemplateTypeConfig(row.template_type).color">
          {{ getTemplateTypeConfig(row.template_type).text }}
        </Tag>
      </template>

      <template #file_path="{ row }">
        <span v-if="row.template_type === '1'" :title="row.template_content">
          <span v-if="!row.template_content" class="text-gray-400">无内容</span>
          <span v-else>
            {{
              row.template_content.length > 20
                ? `${row.template_content.slice(0, 20)}...`
                : row.template_content
            }}
          </span>
        </span>
        <span v-else>
          <span v-if="!row.file_path" class="text-gray-400">未上传文件</span>
          <a
            v-else
            :href="row.file_path"
            target="_blank"
            class="text-primary flex items-center hover:underline"
            :download="getFileName(row.file_path)"
            title="点击下载"
          >
            <span class="mr-1">⬇️</span>
            {{ getFileName(row.file_path) }}
          </a>
        </span>
      </template>

      <template #status="{ row }">
        <Tag :color="row.status === '0' ? 'green' : 'red'">
          {{ row.status === '0' ? '正常' : '停用' }}
        </Tag>
      </template>

      <template #action="{ row }">
        <Space>
          <a-button
            type="link"
            v-access:code="['operator:template:edit']"
            @click="handleEdit(row)"
          >
            {{ $t('pages.common.edit') }}
          </a-button>

          <Popconfirm
            :get-popup-container="getVxePopupContainer"
            placement="left"
            title="确认删除该模板？"
            @confirm="handleDelete(row)"
          >
            <a-button
              type="link"
              danger
              v-access:code="['operator:template:remove']"
            >
              {{ $t('pages.common.delete') }}
            </a-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <TemplateModalWin @reload="tableApi.query()" />
  </Page>
</template>
