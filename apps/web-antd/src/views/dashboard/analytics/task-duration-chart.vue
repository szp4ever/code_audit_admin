<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { message } from 'ant-design-vue';

import { getTaskDurationStats } from '#/api/taskmanagement';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

onMounted(async () => {
  try {
    const stats = await getTaskDurationStats('day');
    
    if (!stats || stats.length === 0) {
      // 如果没有数据，显示空图表
      renderEcharts({
        series: [
          {
            data: [],
            type: 'line',
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
      return;
    }

    // 将统计数据转换为时间轴图所需格式
    const dates = stats.map((item) => item.date);
    const avgDurations = stats.map((item) => item.avgDuration);
    const counts = stats.map((item) => item.count);
    
    // 计算最大值，用于设置y轴范围
    const maxDuration = Math.max(...avgDurations, 0);
    const maxCount = Math.max(...counts, 0);
    const yAxisMax = Math.max(maxDuration, maxCount) > 0 
      ? Math.ceil(Math.max(maxDuration, maxCount) * 1.2) 
      : 100;

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
          areaStyle: {},
          data: avgDurations,
          itemStyle: {
            color: '#5ab1ef',
          },
          name: '平均耗时（秒）',
          smooth: true,
          type: 'line',
        },
        {
          areaStyle: {},
          data: counts,
          itemStyle: {
            color: '#019680',
          },
          name: '任务数量',
          smooth: true,
          type: 'line',
        },
      ],
      tooltip: {
        axisPointer: {
          lineStyle: {
            color: '#019680',
            width: 1,
          },
        },
        trigger: 'axis',
        formatter: (params: any) => {
          let result = `${params[0].axisValue}<br/>`;
          params.forEach((param: any) => {
            result += `${param.seriesName}: ${param.value}<br/>`;
          });
          return result;
        },
      },
      legend: {
        data: ['平均耗时（秒）', '任务数量'],
        bottom: 0,
      },
      xAxis: {
        axisTick: {
          show: false,
        },
        boundaryGap: false,
        data: dates,
        splitLine: {
          lineStyle: {
            type: 'solid',
            width: 1,
          },
          show: true,
        },
        type: 'category',
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: [
        {
          axisTick: {
            show: false,
          },
          max: yAxisMax,
          splitArea: {
            show: true,
          },
          splitNumber: 4,
          type: 'value',
        },
      ],
    });
  } catch (error) {
    console.error('获取任务耗时统计失败:', error);
    message.error('加载任务耗时统计数据失败');
    
    // 显示空图表
    renderEcharts({
      series: [
        {
          data: [],
          type: 'line',
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

