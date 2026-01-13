<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { message } from 'ant-design-vue';

import { getTaskStatusStats } from '#/api/taskmanagement';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

// 状态中文映射
const statusMap: Record<string, string> = {
  pending: '待处理',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
};

// 颜色配置
const colors = ['#5ab1ef', '#b6a2de', '#67e0e3', '#2ec7c9', '#ffb347', '#ff6b6b'];

onMounted(async () => {
  try {
    const stats = await getTaskStatusStats();
    
    // 将统计数据转换为饼状图所需格式
    const chartData = Object.entries(stats).map(([status, value], index) => ({
      name: statusMap[status] || status,
      value,
      itemStyle: {
        color: colors[index % colors.length],
      },
    }));

    renderEcharts({
      legend: {
        bottom: '2%',
        left: 'center',
      },
      series: [
        {
          animationDelay() {
            return Math.random() * 100;
          },
          animationEasing: 'exponentialInOut',
          animationType: 'scale',
          avoidLabelOverlap: false,
          data: chartData,
          emphasis: {
            label: {
              fontSize: '12',
              fontWeight: 'bold',
              show: true,
            },
          },
          itemStyle: {
            borderRadius: 10,
            borderWidth: 2,
          },
          label: {
            position: 'center',
            show: false,
          },
          labelLine: {
            show: false,
          },
          name: '任务状态',
          radius: ['40%', '65%'],
          type: 'pie',
        },
      ],
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
    });
  } catch (error) {
    console.error('获取任务状态统计失败:', error);
    message.error('加载任务状态统计数据失败');
    
    // 显示空图表
    renderEcharts({
      series: [
        {
          data: [],
          type: 'pie',
        },
      ],
    });
  }
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>

