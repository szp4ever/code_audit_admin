<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';
import { onMounted, ref, reactive } from 'vue';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { message, DatePicker } from 'ant-design-vue';
import type { RangePickerProps } from 'ant-design-vue/es/date-picker';
import dayjs, { type Dayjs } from 'dayjs';
import { getCodeStandardPassRate } from '#/api/taskmanagement';

// 1. 通过率分类配置（通过/未通过，与后端返回字段映射）
const PASS_RATE_TYPES = [
  { value: 'passed', label: '通过', color: '#67C23A' },
  { value: 'failed', label: '未通过', color: '#F56C6C' }
];

// 2. 图表实例引用
const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

// 3. 日期选择器配置（仅选择年月，默认近6个月）
const dateRange = ref<[Dayjs, Dayjs] | null>([
  dayjs().subtract(6, 'month'),
  dayjs()
]);
const datePickerProps = reactive<RangePickerProps>({
  placeholder: ['开始年月', '结束年月'],
  format: 'YYYY-MM',
  picker: 'month',
  disabledDate: (date: Dayjs) => {
    return date.isAfter(dayjs(), 'month');
  },
  onChange: handleDateRangeChange
});

/**
 * 4. 日期范围变更处理
 */
async function handleDateRangeChange(range: [Dayjs, Dayjs] | null) {
  dateRange.value = range;
  if (range && range[0] && range[1]) {
    await fetchPassRateData(range[0], range[1]);
  }
}

/**
 * 5. 获取代码规范检查通过率数据
 */
async function fetchPassRateData(startDate: Dayjs, endDate: Dayjs) {
  try {
    // 调用接口获取通过率数据（通过/未通过数量）
    const res = await getCodeStandardPassRate({
      start: startDate.format('YYYY-MM'),
      end: endDate.format('YYYY-MM')
    });
    console.log("nfshjfo")
    console.log(res)

    // 格式化数据并渲染饼图
    const formattedData = formatPassRateData(res);
    renderPieChart(formattedData);
  } catch (error) {
    console.error('获取代码规范检查通过率失败:', error);
    message.error('加载代码规范检查通过率数据失败');
    // 渲染空图表
    renderPieChart([]);
  }
}

/**
 * 6. 数据格式化方法
 * @param rawData 接口返回的原始数据 { passed: number, failed: number }
 * @returns 饼图所需的格式化数据
 */
function formatPassRateData(rawData: { passed: number; failed: number }): any[] {
  // 计算总数和通过率
  const total = rawData.passed + rawData.failed;
  // 构建饼图数据项（补充百分比）
  return PASS_RATE_TYPES.map(type => {
    const value = rawData[type.value as 'passed' | 'failed'] || 0;
    const percent = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
    return {
      name: type.label,
      value,
      percent,
      color: type.color
    };
  });
}

/**
 * 7. 渲染饼图（展示通过/未通过占比 + 通过率）
 */
function renderPieChart(formattedData: any[]) {
  // 计算整体通过率
  const total = formattedData.reduce((sum, item) => sum + item.value, 0);
  const passRate = total > 0
    ? ((formattedData.find(item => item.name === '通过')?.value || 0) / total * 100).toFixed(2)
    : 0;

  renderEcharts({
    grid: {
      left: '10%',
      right: '10%',
      top: '15%',
      bottom: '10%',
      containLabel: true
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `
          <div>${params.name}</div>
          <div>数量：${params.value} 个</div>
          <div>占比：${params.percent}%</div>
        `;
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
      textStyle: {
        fontSize: 12
      },
      data: PASS_RATE_TYPES.map(type => type.label)
    },
    series: [
      {
        name: '代码规范检查结果',
        type: 'pie',
        radius: ['40%', '70%'], // 环形饼图
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'center',
          rich: {}
        },
        labelLine: {
          show: false
        },
        data: formattedData.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: item.color
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  });
}

// 8. 初始化加载数据
onMounted(async () => {
  if (dateRange.value) {
    await fetchPassRateData(dateRange.value[0], dateRange.value[1]);
  }
});
</script>

<template>
  <div class="code-standard-pass-rate-chart-container" style="padding: 5px;">
    <!-- 筛选栏：日期选择器 -->
    <div class="filter-wrapper" style="margin-bottom: 5px; align-items: center;">
      <DatePicker.RangePicker
        v-model="dateRange"
        v-bind="datePickerProps"
        style="width: 250px;"
      />
    </div>
    <!-- 饼图容器 -->
    <EchartsUI ref="chartRef" style="width: 100%; height: 450px;" />
  </div>
</template>
