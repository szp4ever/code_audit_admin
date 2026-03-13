<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { message, DatePicker } from 'ant-design-vue';
import type { DatePickerProps } from 'ant-design-vue/es/date-picker';
import dayjs, { type Dayjs } from 'dayjs';
import * as echarts from 'echarts';
import { getPeakTimeAnalysis } from '#/api/taskmanagement';

const chartRef = ref<HTMLElement>();
const loading = ref(false);
const selectedDate = ref<Dayjs | null>(dayjs());
let chart: echarts.ECharts | null = null;

const datePickerProps = ref<DatePickerProps>({
  placeholder: '选择日期',
  format: 'YYYY-MM-DD',
  disabledDate: (date: Dayjs) => {
    return date.isAfter(dayjs(), 'day'); // 禁用未来日期
  },
  onChange: handleDateChange
});

async function handleDateChange(date: Dayjs | null) {
  selectedDate.value = date;
  if (date) {
    await fetchPeakTimeAnalysis(date.format('YYYY-MM-DD'));
  }
}

async function fetchPeakTimeAnalysis(date: string) {
  loading.value = true;
  try {
    const data = await getPeakTimeAnalysis({ date });
    renderChart(data);
  } catch (error) {
    console.error('获取峰值时段分析失败:', error);
    message.error('加载峰值时段分析数据失败');
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
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.hour + ':00')
      },
      yAxis: {
        type: 'value',
        beginAtZero: true
      },
      series: [
        {
          name: '用户数量',
          type: 'line',
          data: data.map(item => item.count),
          smooth: true,
          itemStyle: {
            color: '#3b82f6'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(59, 130, 246, 0.5)'
              },
              {
                offset: 1,
                color: 'rgba(59, 130, 246, 0.1)'
              }
            ])
          }
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
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: []
      },
      yAxis: {
        type: 'value',
        beginAtZero: true
      },
      series: [
        {
          name: '用户数量',
          type: 'line',
          data: [],
          smooth: true,
          itemStyle: {
            color: '#3b82f6'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(59, 130, 246, 0.5)'
              },
              {
                offset: 1,
                color: 'rgba(59, 130, 246, 0.1)'
              }
            ])
          }
        }
      ]
    };
    
    chart.setOption(option);
  }
}

onMounted(() => {
  if (selectedDate.value) {
    fetchPeakTimeAnalysis(selectedDate.value.format('YYYY-MM-DD'));
  }
  
  window.addEventListener('resize', () => {
    chart?.resize();
  });
});

onUnmounted(() => {
  if (chart) {
    chart.dispose();
  }
  window.removeEventListener('resize', () => {
    chart?.resize();
  });
});
</script>

<template>
  <div>
    <div class="flex justify-start mb-3">
      <DatePicker
        v-model="selectedDate"
        v-bind="datePickerProps"
        style="width: 150px;"
      />
    </div>
    <div ref="chartRef" class="h-64" v-loading="loading"></div>
  </div>
</template>