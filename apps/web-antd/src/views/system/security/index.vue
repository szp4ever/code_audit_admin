<script setup lang="ts">
import type { RuleObject } from 'ant-design-vue/es/form';

import { computed, onMounted, reactive, ref } from 'vue';

import { useAccess } from '@vben/access';
import { Fallback, Page } from '@vben/common-ui';

import { Form, FormItem, Input, InputNumber, Switch } from 'ant-design-vue';

import { getSecurityConfig, updateSecurityConfig } from '#/api/system/security';

const { hasAccessByRoles } = useAccess();

/**
 * 与菜单管理一致：
 * 只有租户管理员（admin）和超级管理员（superadmin）可以访问安全管理
 */
const isAdmin = computed(() => hasAccessByRoles(['admin', 'superadmin']));

const loading = ref(false);
const saving = ref(false);

const formRef = ref<InstanceType<typeof Form> | null>(null);

const formModel = reactive({
  whitelistIps: '',
  idleTimeoutMinutes: 30,
  passwordMinLength: 8,
  passwordRequireSpecial: true,
});

/**
 * IP地址格式验证正则表达式
 * 支持IPv4格式：xxx.xxx.xxx.xxx (0-255)
 */
const ipRegex =
  /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

/**
 * CIDR格式验证：192.168.1.0/24
 */
const cidrRegex =
  /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/([0-9]|[12][0-9]|3[0-2])$/;

/**
 * IP范围格式验证：192.168.1.1-192.168.1.100
 */
const ipRangeRegex =
  /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)-((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

/**
 * IP通配符格式验证：192.168.1.* 或 192.168.*.*
 * 要求必须是4段，每段可以是数字(0-255)或*
 */
const ipWildcardRegex =
  /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|\*)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|\*)$/;

/**
 * 验证IP地址或IP段格式
 * 支持格式：
 * 1. 单个IP：192.168.1.1
 * 2. CIDR格式：192.168.1.0/24
 * 3. IP范围：192.168.1.1-192.168.1.100
 * 4. 通配符：192.168.1.* 或 192.168.*.*
 */
function validateIps(_rule: RuleObject, value: string) {
  if (!value || value.trim() === '') {
    return Promise.resolve();
  }
  const ips = value
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);
  for (const ip of ips) {
    // 检查是否为CIDR格式
    if (cidrRegex.test(ip)) {
      continue;
    }
    // 检查是否为IP范围格式
    if (ipRangeRegex.test(ip)) {
      continue;
    }
    // 检查是否为通配符格式
    if (ipWildcardRegex.test(ip)) {
      continue;
    }
    // 检查是否为单个IP格式
    if (ipRegex.test(ip)) {
      continue;
    }
    return Promise.reject(
      new Error(
        `IP地址或IP段格式不正确: ${ip}。支持格式：单个IP(192.168.1.1)、CIDR(192.168.1.0/24)、IP范围(192.168.1.1-192.168.1.100)、通配符(192.168.1.*)`,
      ),
    );
  }
  return Promise.resolve();
}

/**
 * 表单验证规则
 */
const formRules = {
  whitelistIps: [
    {
      validator: validateIps,
      trigger: 'blur',
    },
  ],
  idleTimeoutMinutes: [
    {
      required: true,
      message: '空闲超时时间不能为空',
      trigger: 'blur',
    },
    {
      type: 'number',
      min: 0,
      max: 1440,
      message: '空闲超时时间必须在 0-1440 分钟之间',
      trigger: 'blur',
    },
  ],
  passwordMinLength: [
    {
      required: true,
      message: '密码最小长度不能为空',
      trigger: 'blur',
    },
    {
      type: 'number',
      min: 4,
      max: 64,
      message: '密码最小长度必须在 4-64 之间',
      trigger: 'blur',
    },
  ],
  passwordRequireSpecial: [
    {
      required: true,
      message: '请选择是否要求特殊字符',
      trigger: 'change',
    },
  ],
};

async function fetchConfig() {
  loading.value = true;
  try {
    const data = await getSecurityConfig();
    formModel.whitelistIps = data.whitelistIps ?? '';
    formModel.idleTimeoutMinutes = data.idleTimeoutMinutes ?? 30;
    formModel.passwordMinLength = data.passwordMinLength ?? 8;
    // 后端返回0表示需要特殊字符，1表示不需要特殊字符
    // 前端Switch组件：true表示需要，false表示不需要
    // 所以：0 -> true, 1 -> false
    const requireSpecialValue = data.passwordRequireSpecial;
    if (requireSpecialValue !== undefined && requireSpecialValue !== null) {
      formModel.passwordRequireSpecial = requireSpecialValue === 0;
    }
  } catch (error) {
    console.error('获取安全配置失败:', error);
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  if (!formRef.value) return;
  try {
    // 表单验证
    await formRef.value.validate();
    saving.value = true;
    // 准备提交数据，确保数据类型正确
    // 前端Switch：true表示需要特殊字符，false表示不需要
    // 后端要求：0表示需要特殊字符，1表示不需要特殊字符
    // 转换逻辑：true -> 0, false -> 1
    const submitData = {
      whitelistIps: (formModel.whitelistIps?.trim() ?? '') || '',
      idleTimeoutMinutes:
        formModel.idleTimeoutMinutes !== null &&
        formModel.idleTimeoutMinutes !== undefined
          ? Number(formModel.idleTimeoutMinutes)
          : 0,
      passwordMinLength:
        formModel.passwordMinLength !== null &&
        formModel.passwordMinLength !== undefined
          ? Number(formModel.passwordMinLength)
          : 8,
      passwordRequireSpecial: formModel.passwordRequireSpecial ? 0 : 1,
    };
    // 调用更新接口，postWithMsg会自动显示成功消息
    await updateSecurityConfig(submitData);
    // 保存成功后重新获取最新配置
    await fetchConfig();
  } catch (error) {
    // 表单验证失败或接口调用失败
    console.error('保存安全配置失败:', error);
    // postWithMsg 会自动处理错误消息显示，这里不需要额外处理
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  if (isAdmin.value) {
    fetchConfig();
  }
});
</script>

<template>
  <Page v-if="isAdmin" :auto-content-height="true">
    <div class="p-4 max-w-3xl">
      <h2 class="text-xl font-semibold mb-2">安全管理</h2>
      <p class="text-gray-500 mb-4">
        通过以下配置，可以增强系统的网络访问、安全会话以及密码复杂度策略。
      </p>

      <Form
        ref="formRef"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 14 }"
        :model="formModel"
        :rules="formRules"
        layout="horizontal"
      >
        <!-- 白名单 IP 配置 -->
        <FormItem
          label="白名单 IP 段"
          name="whitelistIps"
          extra="支持单个IP、CIDR、IP范围、通配符格式，多个使用英文逗号分隔。例如：192.168.1.1,192.168.1.0/24,192.168.1.1-192.168.1.100,192.168.1.*；只有在白名单内的 IP 才能访问系统（具体以后端生效逻辑为准）。"
        >
          <Input.TextArea
            v-model:value="formModel.whitelistIps"
            :auto-size="{ minRows: 3, maxRows: 6 }"
            placeholder="请输入白名单 IP 或 IP 段，多个使用英文逗号分隔。支持格式：单个IP、CIDR(192.168.1.0/24)、IP范围(192.168.1.1-192.168.1.100)、通配符(192.168.1.*)"
            allow-clear
          />
        </FormItem>

        <!-- 空闲超时自动退出 -->
        <FormItem
          label="空闲超时时间"
          name="idleTimeoutMinutes"
          extra="用户在指定分钟数内无任何操作时，将自动退出登录。设置为 0 或负数时由后端自行决定是否禁用。"
        >
          <InputNumber
            v-model:value="formModel.idleTimeoutMinutes"
            :min="0"
            :max="1440"
            :step="5"
            style="width: 100%"
            placeholder="请输入空闲超时时间（分钟）"
          />
        </FormItem>

        <!-- 密码复杂度：最小长度 -->
        <FormItem
          label="密码最小长度"
          name="passwordMinLength"
          extra="用于注册/初始密码策略，建议不少于 8 位。"
        >
          <InputNumber
            v-model:value="formModel.passwordMinLength"
            :min="4"
            :max="64"
            style="width: 100%"
            placeholder="请输入密码最小长度"
          />
        </FormItem>

        <!-- 密码复杂度：特殊字符要求 -->
        <FormItem
          label="要求特殊字符"
          name="passwordRequireSpecial"
          extra="开启后，新注册或初始化密码需要至少包含一个特殊字符（例如：!@#$% 等），具体规则由后端校验逻辑决定。"
        >
          <Switch v-model:checked="formModel.passwordRequireSpecial" />
        </FormItem>

        <FormItem :wrapper-col="{ span: 14, offset: 6 }">
          <a-button
            type="primary"
            :loading="saving"
            :disabled="loading"
            @click="handleSubmit"
          >
            保存配置
          </a-button>
        </FormItem>
      </Form>
    </div>
  </Page>
  <Fallback
    v-else
    description="您没有安全管理的访问权限，仅租户管理员和超级管理员可访问。"
    status="403"
  />
</template>

