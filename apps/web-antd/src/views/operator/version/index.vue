<script setup lang="ts">
import { ref } from 'vue';

import { Page } from '@vben/common-ui';
import { message, Popconfirm } from 'ant-design-vue';

interface ModelVersion {
  id: string;
  version: string;
  modelName: string;
  description: string;
  createTime: string;
}

function formatDateYYYYMMDD(date: Date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function makeModelVersion(id: string, version: string, dayOffset: number = 0): ModelVersion {
  // 26-01 的创建时间为 2025-12-01，之后每个版本加7天
  const baseDate = Date.UTC(2025, 11, 1); // 2025-12-01
  const dayMs = 24 * 60 * 60 * 1000;
  const createdDate = new Date(baseDate + dayOffset * 7 * dayMs);
  const dateStr = formatDateYYYYMMDD(createdDate);
  return {
    id,
    version,
    modelName: dateStr, // 项目/模型名称与创建日期对应
    description: `模型版本 ${version}`,
    createTime: dateStr,
  };
}

// 假数据：模型版本列表
const versionList = ref<ModelVersion[]>([
  makeModelVersion('1', '26-01', 0), // 2025-12-01
  makeModelVersion('2', '26-02', 1), // 2025-12-08
  makeModelVersion('3', '26-03', 2), // 2025-12-15
  makeModelVersion('4', '26-04', 3), // 2025-12-22
  makeModelVersion('5', '26-05', 4), // 2025-12-29
  makeModelVersion('6', '26-06', 5), // 2026-01-05
]);

const selectedVersion = ref<string>('');

// 选择版本
function handleSelectVersion(version: ModelVersion) {
  selectedVersion.value = version.version;
  message.success(`已选择模型版本：${version.version}`);
}

function handleDeleteVersion(version: ModelVersion) {
  versionList.value = versionList.value.filter((v) => v.id !== version.id);
  if (selectedVersion.value === version.version) {
    selectedVersion.value = '';
  }
  message.success(`已删除模型版本：${version.version}`);
}
</script>

<template>
  <Page :auto-content-height="true">
    <div class="version-container">
      <div class="version-header">
        <h2 class="version-title">模型版本管理</h2>
        <div v-if="selectedVersion" class="selected-info">
          当前选择：<span class="selected-version">{{ selectedVersion }}</span>
        </div>
      </div>

      <div class="version-list">
        <div
          v-for="item in versionList"
          :key="item.id"
          class="version-card"
          :class="{ 'selected': selectedVersion === item.version }"
        >
          <div class="version-card-header">
            <div class="version-info">
              <h3 class="version-name">{{ item.version }}</h3>
            </div>
          </div>
          <div class="version-card-body">
            <p class="version-description">{{ item.description }}</p>
            <p class="version-time">模型名称：{{ item.modelName }}</p>
          </div>
          <div class="version-card-footer">
            <a-button
              type="primary"
              :disabled="selectedVersion === item.version"
              @click="handleSelectVersion(item)"
            >
              {{ selectedVersion === item.version ? '已选择' : '选择此版本' }}
            </a-button>
            <Popconfirm
              title="确定要删除该版本吗？"
              ok-text="删除"
              cancel-text="取消"
              @confirm="handleDeleteVersion(item)"
            >
              <a-button danger class="delete-btn">删除</a-button>
            </Popconfirm>
          </div>
        </div>
      </div>
    </div>
  </Page>
</template>

<style scoped lang="scss">
.version-container {
  padding: 24px;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.version-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.selected-info {
  font-size: 14px;
  color: #666;

  .selected-version {
    font-weight: 600;
    color: #1890ff;
  }
}

.version-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.version-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #1890ff;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
    transform: translateY(-2px);
  }

  &.selected {
    border-color: #1890ff;
    background: #f0f7ff;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
  }
}

.version-card-header {
  margin-bottom: 16px;
}

.version-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.version-card-body {
  margin-bottom: 16px;
}

.version-description {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
}

.version-time {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.version-card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.delete-btn {
  // 让删除按钮与主按钮视觉间距更舒服
}
</style>
