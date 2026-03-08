<script setup lang="ts">
import { computed } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import type { BackupScheduleConfig } from '#/api/backup/model';
import { saveBackupScheduleConfig } from '#/api/backup';

const props = defineProps<{
  config?: BackupScheduleConfig;
}>();

const emit = defineEmits<{
  reload: [];
}>();

function getFormSchema() {
  return [
    {
      component: 'Switch',
      fieldName: 'enabled',
      label: '启用定时备份',
      defaultValue: false,
    },
    {
      component: 'Input',
      fieldName: 'cronExpression',
      label: 'Cron 表达式',
      componentProps: {
        placeholder: '例如：0 0 2 1 * ? (每月1号凌晨2点)',
      },
      dependencies: {
        show: (values) => values.enabled === true,
        triggerFields: ['enabled'],
      },
      rules: [
        {
          validator: (_rule: any, value: string, callback: any) => {
            if (!value || !value.trim()) {
              callback('请输入 Cron 表达式');
              return;
            }
            // 简单的 Cron 表达式验证
            const cronRegex =
              /^(\*|([0-9]|[1-5][0-9])|\*\/([0-9]|[1-5][0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|[12][0-9]|3[01])|\*\/([1-9]|[12][0-9]|3[01])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\?|\*|([0-6])|\*\/([0-6]))$/;
            if (!cronRegex.test(value.trim())) {
              callback('Cron 表达式格式不正确');
              return;
            }
            callback();
          },
          trigger: 'blur',
        },
      ],
    },
    {
      component: 'InputNumber',
      fieldName: 'keepCount',
      label: '保留备份数量',
      componentProps: {
        min: 1,
        max: 100,
        placeholder: '保留最近的备份文件数量',
      },
      defaultValue: 10,
      dependencies: {
        show: (values) => values.enabled === true,
        triggerFields: ['enabled'],
      },
      rules: [
        {
          validator: (_rule: any, value: number, callback: any) => {
            if (!value || value < 1) {
              callback('保留数量至少为 1');
              return;
            }
            callback();
          },
          trigger: 'blur',
        },
      ],
    },
  ];
}

const [Form, formApi] = useVbenForm({
  schema: getFormSchema(),
  labelWidth: 120,
  wrapperCol: { span: 18 },
  showDefaultActions: false,
});

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onCancel: handleCancel,
  onConfirm: handleSubmit,
  onOpenChange: async (isOpen) => {
    if (!isOpen) {
      return null;
    }
    modalApi.modalLoading(true);

    const { config } = modalApi.getData() as { config?: BackupScheduleConfig };
    if (config) {
      await formApi.setValues({
        // enabled: 0-启用，1-不启用；表单里用布尔表示
        enabled: config.enabled === 0,
        cronExpression: config.cronExpression || '0 0 2 1 * ?',
        keepCount: config.keepCount ?? 10,
      });
    }

    modalApi.modalLoading(false);
  },
});

async function handleSubmit() {
  try {
    modalApi.modalLoading(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const values = cloneDeep(await formApi.getValues());
    await saveBackupScheduleConfig({
      // 0 表示启用，1 表示不启用
      enabled: values.enabled ? 0 : 1,
      cronExpression: values.cronExpression?.trim(),
      keepCount: values.keepCount ?? 10,
    });
    message.success('保存成功');
    await handleCancel();
    emit('reload');
  } catch (error) {
    console.error(error);
    message.error('保存失败');
  } finally {
    modalApi.modalLoading(false);
  }
}

async function handleCancel() {
  modalApi.close();
  await formApi.resetForm();
}
</script>

<template>
  <BasicModal :close-on-click-modal="false" class="w-[550px]" title="定时备份配置">
    <Form />
    <template #footer>
      <div class="text-sm text-gray-500 mb-4">
        <p>提示：</p>
        <p>• Cron 表达式格式：秒 分 时 日 月 周</p>
        <p>• 示例：0 0 2 1 * ? 表示每月1号凌晨2点执行</p>
        <p>• 示例：0 0 0 * * ? 表示每天凌晨0点执行</p>
      </div>
    </template>
  </BasicModal>
</template>

