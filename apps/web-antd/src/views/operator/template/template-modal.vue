<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { useAccessStore } from '@vben/stores';

import { UploadOutlined } from '@ant-design/icons-vue';
// [关键修改] 使用别名引入组件，解决白屏问题
import {
  Button as AButton,
  Col as ACol,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  Radio as ARadio,
  RadioGroup as ARadioGroup,
  Row as ARow,
  Select as ASelect,
  SelectOption as ASelectOption,
  Textarea as ATextarea,
  Upload as AUpload,
  message,
} from 'ant-design-vue';

import { templateAdd, templateUpdate } from '#/api/operator/template';

const emit = defineEmits(['reload']);
const formRef = ref();

const accessStore = useAccessStore();
const uploadUrl = `${import.meta.env.VITE_GLOB_API_URL}/resource/oss/upload`;

const headers = computed(() => ({
  Authorization: `Bearer ${accessStore.accessToken}`,
}));

const fileList = ref<any[]>([]);

const formData = ref({
  template_id: undefined as number | undefined,
  template_name: '',
  template_code: '',
  template_type: '1',
  status: '0',
  template_content: '',
  remark: '',
  file_path: '',
  file_kind: 'text',
});

const isFileMode = computed(() => formData.value.template_type === '2');

const acceptType = computed(() => {
  return formData.value.template_type === '2' ? '.docx,.doc' : '*';
});

const uploadTip = computed(() => {
  return formData.value.template_type === '2' ? '仅支持 Word (.docx) 格式' : '';
});

const handleTypeChange = (val: any) => {
  if (val === '1') {
    fileList.value = [];
    formData.value.file_path = '';
    formData.value.file_kind = 'text';
  } else {
    formData.value.template_content = '';
    formData.value.file_kind = 'docx';
  }
  formRef.value?.clearValidate();
};

const handleUploadChange = (info: any) => {
  let resFileList = [...info.fileList];
  resFileList = resFileList.slice(-1);
  fileList.value = resFileList;

  switch (info.file.status) {
    case 'done': {
      const url = info.file.response?.data?.url;
      if (url) {
        formData.value.file_path = url;
        message.success(`${info.file.name} 上传成功`);
        formRef.value?.validateFields(['file_path']);
      }
      break;
    }
    case 'error': {
      message.error(`${info.file.name} 上传失败`);
      formData.value.file_path = '';
      break;
    }
    case 'removed': {
      formData.value.file_path = '';
      break;
    }
  }
};

const [Modal, modalApi] = useVbenModal({
  title: '模板配置',
  draggable: true,
  onConfirm: async () => {
    try {
      modalApi.setState({ loading: true });
      await formRef.value?.validate();

      if (isFileMode.value) {
        formData.value.template_content = '';
      } else {
        formData.value.file_path = '';
        formData.value.file_kind = 'text';
      }

      if (formData.value.template_id) {
        await templateUpdate(formData.value);
        message.success('修改成功');
      } else {
        await templateAdd(formData.value);
        message.success('新增成功');
      }
      emit('reload');
      modalApi.close();
    } catch (error) {
      console.warn('校验失败', error);
    } finally {
      modalApi.setState({ loading: false });
    }
  },
  onOpenChange: (isOpen) => {
    if (isOpen) {
      const data = modalApi.getData<Record<string, any>>();
      formRef.value?.clearValidate();

      if (data) {
        formData.value = { ...data } as any;
        if (data.template_type === '2' && data.file_path) {
          const fileName = data.file_path.split('/').pop();
          fileList.value = [
            {
              uid: '-1',
              name: fileName || 'file',
              status: 'done',
              url: data.file_path,
            },
          ];
        } else {
          fileList.value = [];
        }
      } else {
        formData.value = {
          template_id: undefined,
          template_name: '',
          template_code: '',
          template_type: '1',
          status: '0',
          template_content: '',
          remark: '',
          file_path: '',
          file_kind: 'text',
        };
        fileList.value = [];
      }
    }
  },
});
</script>

<template>
  <Modal>
    <div class="p-4">
      <AForm
        ref="formRef"
        :model="formData"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <ARow :gutter="16">
          <ACol :span="24">
            <AFormItem
              label="模板名称"
              name="template_name"
              :rules="[{ required: true, message: '请输入名称' }]"
            >
              <AInput
                v-model:value="formData.template_name"
                placeholder="请输入模板名称"
              />
            </AFormItem>
          </ACol>
          <ACol :span="24">
            <AFormItem
              label="模板编码"
              name="template_code"
              :rules="[{ required: true, message: '请输入编码' }]"
            >
              <AInput
                v-model:value="formData.template_code"
                placeholder="唯一标识"
              />
            </AFormItem>
          </ACol>
        </ARow>

        <ARow :gutter="16">
          <ACol :span="12">
            <AFormItem label="模板类型" name="template_type">
              <ASelect
                v-model:value="formData.template_type"
                @change="handleTypeChange"
              >
                <ASelectOption value="1">文本内容</ASelectOption>
                <ASelectOption value="2">Word 模板</ASelectOption>
              </ASelect>
            </AFormItem>
          </ACol>
          <ACol :span="12">
            <AFormItem label="状态" name="status">
              <ARadioGroup v-model:value="formData.status">
                <ARadio value="0">正常</ARadio>
                <ARadio value="1">停用</ARadio>
              </ARadioGroup>
            </AFormItem>
          </ACol>
        </ARow>

        <AFormItem
          v-if="!isFileMode"
          label="模板内容"
          name="template_content"
          :rules="[{ required: true, message: '请输入内容' }]"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 19 }"
        >
          <ATextarea
            v-model:value="formData.template_content"
            :rows="6"
            show-count
            :maxlength="2000"
          />
        </AFormItem>

        <AFormItem
          v-if="isFileMode"
          label="Word文件"
          name="file_path"
          :rules="[{ required: true, message: '请上传文件' }]"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 19 }"
        >
          <AUpload
            name="file"
            :action="uploadUrl"
            :headers="headers"
            :file-list="fileList"
            @change="handleUploadChange"
            :max-count="1"
            :accept="acceptType"
          >
            <AButton type="primary">
              <UploadOutlined />
              上传文件
            </AButton>
          </AUpload>

          <div class="mt-1 text-xs text-gray-400">{{ uploadTip }}</div>

          <AInput v-model:value="formData.file_path" type="hidden" />
        </AFormItem>

        <AFormItem
          label="备注"
          name="remark"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 19 }"
        >
          <ATextarea v-model:value="formData.remark" :rows="2" />
        </AFormItem>
      </AForm>
    </div>
  </Modal>
</template>
