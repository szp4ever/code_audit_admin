<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';
import { onMounted, ref, reactive, onUnmounted } from 'vue';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { message, Progress, Card, Statistic, Row, Col } from 'ant-design-vue';
import dayjs from 'dayjs';
import { getRealTimeTaskCount } from '#/api/taskmanagement';

// 1. 定义任务状态常量（与后端一致）
const TASK_STATUSES = [
  { value: 'in_progress', label: '执行中', color: '#1890ff', progressColor: '#1890ff' },
  { value: 'pending', label: '排队中', color: '#faad14', progressColor: '#faad14' },
  { value: 'complete', label: '已完成', color: '#52c41a', progressColor: '#52c41a' },
];
// 进度条总配置（总任务数 = 执行中 + 排队中 + 已完成）
const PROGRESS_CONFIG = {
  totalLabel: '任务完成率',
  height: 24,
  strokeWidth: 24,
};

// 2. 响应式数据
// 任务数量数据
const taskCountData = ref<Record<string, number>>({
  in_progress: 0,
  pending: 0,
  complete: 0,
  total: 0, // 总任务数
  completionRate: 0, // 完成率 = 已完成 / 总任务数
});
// 图表实例
const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);
// 轮询定时器（用于清除）
const pollTimer = ref<NodeJS.Timeout | null>(null);
// 轮询间隔（毫秒）
const POLL_INTERVAL = 5000; // 5秒刷新一次

/**
 * 3. 获取实时任务状态数量
 */
async function fetchRealTimeTaskData() {
  try {
    // 调用实时任务数量接口
    const res = await getRealTimeTaskCount();

    // 格式化数据：统计各状态数量、总数量、完成率
    formatTaskCountData(res);

    // 渲染实时数量图表（可选：柱状图展示各状态数量）
    renderTaskCountChart();
  } catch (error) {
    console.error('获取实时任务数量失败:', error);
    message.error('加载实时任务数量数据失败');
    // 重置数据
    resetTaskCountData();
  }
}

/**
 * 4. 格式化任务数量数据
 * @param rawData 接口返回的原始数据
 */
function formatTaskCountData(rawData: any) {
  // 初始化各状态数量
  let inProgress = 0;
  let pending = 0;
  let complete = 0;

  // 从接口数据中提取各状态数量（根据后端返回结构调整）
  if (rawData) {
    console.log(rawData)
    inProgress = rawData.inProgressCount || 0;
    pending = rawData.pendingCount || 0;
    complete = rawData.completeCount || 0;
  }

  // 计算总任务数和完成率
  const total = inProgress + pending + complete;
  const completionRate = total > 0 ? (complete / total) * 100 : 0;

  // 更新响应式数据
  taskCountData.value = {
    in_progress: inProgress,
    pending: pending,
    complete: complete,
    total: total,
    completionRate: Number(completionRate.toFixed(2)), // 保留2位小数
  };
}

/**
 * 5. 重置任务数量数据（异常时使用）
 */
function resetTaskCountData() {
  taskCountData.value = {
    in_progress: 0,
    pending: 0,
    complete: 0,
    total: 0,
    completionRate: 0,
  };
}

/**
 * 6. 渲染任务数量图表（柱状图）
 */
function renderTaskCountChart() {
  const { in_progress, pending, complete } = taskCountData.value;
  // 构建图表数据
  const xAxisData = TASK_STATUSES.map(item => item.label);
  const seriesData = [in_progress, pending, complete];
  const colors = TASK_STATUSES.map(item => item.color);

  renderEcharts({
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        interval: 0,
        fontSize: 12,
      },
      axisLine: {
        lineStyle: {
          color: '#A2A3A9',
        },
      },
    },
    yAxis: {
      type: 'value',
      name: '任务数量(个)',
      nameTextStyle: {
        fontSize: 12,
      },
      axisLine: {
        lineStyle: {
          color: '#A2A3A9',
        },
      },
      splitLine: {
        lineStyle: {
          color: '#A2A3A9',
        },
      },
      min: 0, // Y轴从0开始
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) => {
        return `<div>${params[0].name}：${params[0].value} 个</div>`;
      },
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      show: false,
    },
    series: [
      {
        name: '任务数量',
        type: 'bar',
        data: seriesData,
        itemStyle: {
          color: (params: any) => colors[params.dataIndex],
        },
        barWidth: '40%', // 柱子宽度
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.2)',
          },
        },
      },
    ],
  });
}

/**
 * 7. 启动轮询（实时更新数据）
 */
function startPolling() {
  // 立即执行一次
  fetchRealTimeTaskData();
  // 设置定时器，周期性执行
  pollTimer.value = setInterval(fetchRealTimeTaskData, POLL_INTERVAL);
}

/**
 * 8. 停止轮询（组件卸载时）
 */
function stopPolling() {
  if (pollTimer.value) {
    clearInterval(pollTimer.value);
    pollTimer.value = null;
  }
}

// 9. 生命周期
// 挂载时启动轮询
onMounted(() => {
  startPolling();
});
// 卸载时停止轮询，避免内存泄漏
onUnmounted(() => {
  stopPolling();
});
</script>

<template>
  <div class="real-time-task-container" style="padding: 10px;">
    <!-- 任务数量统计卡片 -->
    <!-- 用 div 包裹，使用 flex 布局实现三等分 -->
    <div style="display: flex; gap: 16px; margin-bottom: 10px; width: 100%;">
      <!-- 第一个卡片：执行中任务 -->
      <Card style="flex: 1; margin: 0;">
        <Statistic
          title="执行中任务"
          :value="taskCountData.in_progress"
          :valueStyle="{ color: TASK_STATUSES[0].color }"
        />
      </Card>
      <!-- 第二个卡片：排队中任务 -->
      <Card style="flex: 1; margin: 0;">
        <Statistic
          title="排队中任务"
          :value="taskCountData.pending"
          :valueStyle="{ color: TASK_STATUSES[1].color }"
        />
      </Card>
      <!-- 第三个卡片：已完成任务 -->
      <Card style="flex: 1; margin: 0;">
        <Statistic
          title="已完成任务"
          :value="taskCountData.complete"
          :valueStyle="{ color: TASK_STATUSES[2].color }"
        />
      </Card>
    </div>

    <!-- 任务完成率进度条 -->
    <Card title="任务完成率" style="margin-bottom: 10px;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <Progress
          type="line"
          :percent="taskCountData.completionRate"
          :strokeColor="PROGRESS_CONFIG.progressColor || '#52c41a'"
          :strokeWidth="PROGRESS_CONFIG.strokeWidth"
          :height="PROGRESS_CONFIG.height"
          status="normal"
          style="flex: 1;"
        />
        <span style="font-size: 14px; font-weight: 600;">
<!--          {{ taskCountData.completionRate }}%-->
        </span>
      </div>
      <div style="margin-top: 8px; font-size: 12px; color: #666;">
        总任务数：{{ taskCountData.total }} 个（已完成：{{ taskCountData.complete }} / 执行中：{{ taskCountData.in_progress }} / 排队中：{{ taskCountData.pending }}）
      </div>
    </Card>

<!--    &lt;!&ndash; 实时任务数量图表 &ndash;&gt;-->
<!--    <Card title="实时任务数量分布">-->
<!--      <EchartsUI ref="chartRef" style="width: 100%; height: 400px;" />-->
<!--    </Card>-->
  </div>
</template>

<style scoped>
.real-time-task-container {
  background: #fff;
  border-radius: 4px;
}
</style>
