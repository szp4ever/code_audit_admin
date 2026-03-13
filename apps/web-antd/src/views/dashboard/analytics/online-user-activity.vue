<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import ActiveUserDistribution from './active-user-distribution.vue';
import PeakTimeAnalysis from './peak-time-analysis.vue';
import { getOnlineUserCount } from '#/api/taskmanagement';

const onlineUserCount = ref(0);
const loading = ref(false);

async function fetchOnlineUserCount() {
  loading.value = true;
  try {
    const res = await getOnlineUserCount();
    onlineUserCount.value = res.count;
  } catch (error) {
    console.error('获取在线用户数量失败:', error);
    message.error('加载在线用户数量失败');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchOnlineUserCount();
  // 每30秒刷新一次在线用户数量
  setInterval(fetchOnlineUserCount, 30000);
});
</script>

<template>
  <div class="p-4">
    <div class="flex flex-col md:flex-row gap-6">
      <!-- 当前在线用户 -->
      <div class="md:w-1/5 flex flex-col items-center justify-center">
        <h3 class="text-lg font-semibold text-gray-700">当前在线用户</h3>
        <div class="text-4xl font-bold text-blue-600 mt-2" v-loading="loading">
          {{ onlineUserCount }}
        </div>
        <p class="text-gray-500 mt-1">人</p>
      </div>
      
      <!-- 活跃用户分布图 -->
      <div class="md:w-2/5">
        <h4 class="text-sm font-medium text-gray-600 mb-3">活跃用户分布图</h4>
        <ActiveUserDistribution />
      </div>
      
      <!-- 峰值时段分析 -->
      <div class="md:w-2/5">
        <h4 class="text-sm font-medium text-gray-600 mb-3">峰值时段分析</h4>
        <PeakTimeAnalysis />
      </div>
    </div>
  </div>
</template>