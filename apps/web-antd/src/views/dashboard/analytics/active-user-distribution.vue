<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { message, DatePicker } from 'ant-design-vue';
import type { DatePickerProps } from 'ant-design-vue/es/date-picker';
import dayjs, { type Dayjs } from 'dayjs';
import * as echarts from 'echarts';
import { getActiveUserDistribution } from '#/api/taskmanagement';

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
    await fetchActiveUserDistribution(date.format('YYYY-MM-DD'));
  }
}

async function fetchActiveUserDistribution(date: string) {
  loading.value = true;
  try {
    const data = await getActiveUserDistribution({ date });
    renderChart(data);
  } catch (error) {
    console.error('获取活跃用户分布失败:', error);
    message.error('加载活跃用户分布数据失败');
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
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.timeSlot)
      },
      yAxis: {
        type: 'value',
        beginAtZero: true
      },
      series: [
        {
          name: '活跃用户数',
          type: 'bar',
          data: data.map(item => item.count),
          itemStyle: {
            color: '#3b82f6'
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
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
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
          name: '活跃用户数',
          type: 'bar',
          data: [],
          itemStyle: {
            color: '#3b82f6'
          }
        }
      ]
    };
    
    chart.setOption(option);
  }
}

onMounted(() => {
  if (selectedDate.value) {
    fetchActiveUserDistribution(selectedDate.value.format('YYYY-MM-DD'));
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