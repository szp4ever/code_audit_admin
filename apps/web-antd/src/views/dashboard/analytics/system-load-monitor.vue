<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { message, Radio } from 'ant-design-vue';
import * as echarts from 'echarts';
import { getSystemLoad } from '#/api/taskmanagement';

const chartRef = ref<HTMLElement>();
const loading = ref(false);
const timeRange = ref<'1h' | '24h'>('1h');
let chart: echarts.ECharts | null = null;
let refreshInterval: number | null = null;

async function fetchSystemLoad() {
  loading.value = true;
  try {
    const data = await getSystemLoad({ timeRange: timeRange.value });
    renderChart(data);
  } catch (error) {
    console.error('获取系统负载数据失败:', error);
    message.error('加载系统负载数据失败');
    renderEmptyChart();
  } finally {
    loading.value = false;
  }
}

function renderChart(data: any[]) {
  if (chartRef.value) {
    if (!chart) {
      chart = echarts.init(chartRef.value);
    }
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data: ['CPU使用率', '内存使用率', 'GPU使用率'],
        top: 0,
        left: 'center'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map(item => {
          const date = new Date(item.timestamp);
          return timeRange.value === '1h' 
            ? `${date.getUTCHours()}:${String(date.getUTCMinutes()).padStart(2, '0')}`
            : `${date.getUTCMonth() + 1}/${date.getUTCDate()} ${date.getUTCHours()}:00`;
        })
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [
        {
          name: 'CPU使用率',
          type: 'line',
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(24, 144, 255, 0.7)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
            ])
          },
          emphasis: {
            focus: 'series'
          },
          data: data.map(item => item.cpuUsage),
          smooth: true
        },
        {
          name: '内存使用率',
          type: 'line',
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(82, 196, 26, 0.7)' },
              { offset: 1, color: 'rgba(82, 196, 26, 0.1)' }
            ])
          },
          emphasis: {
            focus: 'series'
          },
          data: data.map(item => item.memoryUsage),
          smooth: true
        },
        {
          name: 'GPU使用率',
          type: 'line',
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(250, 140, 22, 0.7)' },
              { offset: 1, color: 'rgba(250, 140, 22, 0.1)' }
            ])
          },
          emphasis: {
            focus: 'series'
          },
          data: data.map(item => item.gpuUsage || 0),
          smooth: true
        }
      ]
    };
    
    chart.setOption(option);
  }
}

function renderEmptyChart() {
  if (chartRef.value) {
    if (!chart) {
      chart = echarts.init(chartRef.value);
    }
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data: ['CPU使用率', '内存使用率', 'GPU使用率'],
        top: 0,
        left: 'center'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: []
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [
        {
          name: 'CPU使用率',
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: [],
          smooth: true
        },
        {
          name: '内存使用率',
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: [],
          smooth: true
        },
        {
          name: 'GPU使用率',
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: [],
          smooth: true
        }
      ]
    };
    
    chart.setOption(option);
  }
}

function handleTimeRangeChange(e: any) {
  timeRange.value = e.target.value;
  fetchSystemLoad();
}

onMounted(() => {
  fetchSystemLoad();
  
  // 每30秒刷新一次数据
  refreshInterval = window.setInterval(fetchSystemLoad, 30000);
  
  window.addEventListener('resize', () => {
    chart?.resize();
  });
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  if (chart) {
    chart.dispose();
  }
  window.removeEventListener('resize', () => {
    chart?.resize();
  });
});
</script>

<template>
  <div style="padding: 5px;">
    <!-- 时间范围选择 -->
    <div class="flex justify-start mb-3">
      <Radio.Group v-model="timeRange" @change="handleTimeRangeChange">
        <Radio.Button value="1h">1小时</Radio.Button>
        <Radio.Button value="24h">24小时</Radio.Button>
      </Radio.Group>
    </div>
    <!-- 系统负载监控图表 -->
    <div ref="chartRef" class="h-80" v-loading="loading"></div>
  </div>
</template>