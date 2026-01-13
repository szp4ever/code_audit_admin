<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { message } from 'ant-design-vue';

import { getTaskTypeStats } from '#/api/taskmanagement';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

// 任务类型中文映射
const taskTypeMap: Record<string, string> = {
  code_standard_check: '代码规范检查',
  data_security_audit: '数据安全审计',
  other: '其他',
};

onMounted(async () => {
  try {
    const stats = await getTaskTypeStats();
    
    // 将统计数据转换为柱状图所需格式
    const categories = Object.keys(stats);
    const data = Object.values(stats);
    
    // 计算最大值，用于设置y轴范围
    const maxValue = Math.max(...data, 0);
    const yAxisMax = maxValue > 0 ? Math.ceil(maxValue * 1.2) : 10;

    renderEcharts({
      grid: {
        bottom: 0,
        containLabel: true,
        left: '1%',
        right: '1%',
        top: '2%',
      },
      series: [
        {
          barMaxWidth: 80,
          data,
          type: 'bar',
          itemStyle: {
            color: '#5ab1ef',
          },
        },
      ],
      tooltip: {
        axisPointer: {
          lineStyle: {
            width: 1,
          },
        },
        trigger: 'axis',
        formatter: (params: any) => {
          const param = params[0];
          const typeName = taskTypeMap[param.name] || param.name;
          return `${typeName}: ${param.value}`;
        },
      },
      xAxis: {
        data: categories.map((type) => taskTypeMap[type] || type),
        type: 'category',
        axisLabel: {
          rotate: 0,
          interval: 0,
        },
      },
      yAxis: {
        max: yAxisMax,
        splitNumber: 4,
        type: 'value',
      },
    });
  } catch (error) {
    console.error('获取任务类型统计失败:', error);
    message.error('加载任务类型统计数据失败');
    
    // 显示空图表
    renderEcharts({
      series: [
        {
          data: [],
          type: 'bar',
        },
      ],
      xAxis: {
        data: [],
        type: 'category',
      },
      yAxis: {
        type: 'value',
      },
    });
  }
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>

