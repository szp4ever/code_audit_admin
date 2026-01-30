<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';
import { onMounted, ref, reactive } from 'vue';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { message, DatePicker } from 'ant-design-vue';
import type { RangePickerProps } from 'ant-design-vue/es/date-picker';
import dayjs, { type Dayjs } from 'dayjs';
import { getMonthlyTaskCount } from '#/api/taskmanagement';

// 1. 固定定义5种任务类型（与后端一致，无需选择器）
const TASK_TYPES = [
  { value: 'code_standard_check', label: '代码规范检查', color: '#e193ec' },
  { value: 'data_security_audit', label: '数据安全审计', color: '#a0d687' },
  { value: 'dependency_analysis', label: '依赖分析', color: '#a287de' },
  { value: 'compliance_audit', label: '合规审计', color: '#d6947d' },
  { value: 'other', label: '其他任务', color: '#909696' }
];
// 总数的样式配置
const TOTAL_CONFIG = { label: '总任务量', color: '#64b6f1' };

// 2. 图表实例引用
const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

// 3. 日期选择器配置（保留，移除任务类型选择器）
const dateRange = ref<[Dayjs, Dayjs] | null>([
  dayjs().subtract(6, 'month'), // 默认近6个月
  dayjs()
]);
const datePickerProps = reactive<RangePickerProps>({
  placeholder: ['开始年月', '结束年月'],
  format: 'YYYY-MM',
  picker: 'month', // 仅选择年月
  disabledDate: (date: Dayjs) => {
    return date.isAfter(dayjs(), 'month'); // 禁用未来日期
  },
  onChange: handleDateRangeChange
});

/**
 * 4. 日期范围变更处理（无需类型切换，直接重新请求所有类型数据）
 */
async function handleDateRangeChange(range: [Dayjs, Dayjs] | null) {
  dateRange.value = range;
  if (range && range[0] && range[1]) {
    await fetchMonthlyTaskData(range[0], range[1]);
  }
}

/**
 * 5. 获取所有任务类型的月度数据（无需传递单个type，请求全量数据）
 */
async function fetchMonthlyTaskData(startDate: Dayjs, endDate: Dayjs) {
  try {
    // 调用接口：若后端已支持返回所有类型数据，无需传type；若需批量请求，可在此循环请求5种类型
    const res = await getMonthlyTaskCount({
      start: startDate.format('YYYY-MM'),
      end: endDate.format('YYYY-MM')
      // 移除单个type参数，后端返回所有任务类型的月度数据
    });

    // 格式化数据：整理为图表所需格式（去重月度、映射各类型数据、计算总数）
    const formattedData = formatTaskData(res);

    // 渲染折线图（传递格式化后的完整数据）
    renderLineChart(formattedData);
  } catch (error) {
    console.error('获取月度任务数量失败:', error);
    message.error('加载月度任务数量数据失败');
    // 渲染空图表
    renderLineChart({ monthList: [], typeDataMap: {}, totalData: [] });
  }
}

/**
 * 6. 数据格式化核心方法（处理全量数据，为渲染做准备）
 * @param rawData 接口返回的原始多类型数据
 * @returns 格式化后的图表数据
 */
function formatTaskData(rawData: TaskMonthlyCount): FormattedTaskData {
  // 6.1 提取所有不重复的月度标签（按时间排序）
  const monthSet = new Set(rawData.map(item => item.month));
  const monthList = Array.from(monthSet).sort((a, b) => a.localeCompare(b));

  // 6.2 构建「任务类型 -> 月度数量」映射（缺失月度填充0）
  const typeDataMap: Record<string, number[]> = {};
  TASK_TYPES.forEach(taskType => {
    const typeData = monthList.map(month => {
      const matchItem = rawData.find(item => item.month === month && item.type === taskType.value);
      return matchItem?.count || 0;
    });
    typeDataMap[taskType.value] = typeData;
  });

  // 6.3 计算各月度的总任务量（5种类型数量求和）
  const totalData: number[] = monthList.map((_, index) => {
    return TASK_TYPES.reduce((sum, taskType) => {
      return sum + (typeDataMap[taskType.value][index] || 0);
    }, 0);
  });

  // 6.4 返回格式化后的完整数据
  return { monthList, typeDataMap, totalData };
}

/**
 * 7. 渲染折线图（生成6条折线：5种类型 + 1条总数）
 * @param formattedData 格式化后的图表数据
 */
function renderLineChart(formattedData: FormattedTaskData) {
  const { monthList, typeDataMap, totalData } = formattedData;

  // 7.1 构建系列数据（5种任务类型 + 1条总数，共6条线）
  const series = [
    // 先添加5种任务类型的折线
    ...TASK_TYPES.map(taskType => ({
      name: taskType.label,
      type: 'line',
      data: typeDataMap[taskType.value] || [],
      smooth: true, // 平滑曲线
      symbol: 'circle', // 拐点为圆形
      symbolSize: 5, // 拐点大小（略小，避免拥挤）
      lineStyle: {
        color: taskType.color,
        width: 2
      },
      itemStyle: {
        color: taskType.color
      },
      emphasis: {
        itemStyle: {
          color: taskType.color,
          borderColor: '#fff',
          borderWidth: 2
        },
        symbolSize: 7
      }
    })),
    // 再添加总任务量折线（样式突出，区分于各类型）
    {
      name: TOTAL_CONFIG.label,
      type: 'line',
      data: totalData,
      smooth: true,
      symbol: 'diamond', // 菱形拐点，区分于各类型
      symbolSize: 6,
      lineStyle: {
        color: TOTAL_CONFIG.color,
        width: 3, // 线更粗，突出总数
        type: 'dashed' // 虚线样式，进一步区分
      },
      itemStyle: {
        color: TOTAL_CONFIG.color
      },
      emphasis: {
        itemStyle: {
          color: TOTAL_CONFIG.color,
          borderColor: '#fff',
          borderWidth: 2
        },
        symbolSize: 8
      }
    }
  ];

  // 7.2 渲染Echarts图表
  renderEcharts({
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: monthList,
      axisLabel: {
        interval: 0,
        fontSize: 12
      },
      axisLine: {
        lineStyle: {
          color: '#A2A3A9'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '任务数量(个)',
      nameTextStyle: {
        fontSize: 12
      },
      axisLine: {
        lineStyle: {
          color: '#A2A3A9'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#A2A3A9'
        }
      },
      min: 0 // Y轴从0开始
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) => {
        // 格式化Tooltip，展示当前月度所有类型数据和总数
        let tooltipHtml = `<div>${params[0].name}</div>`;
        params.forEach(param => {
          tooltipHtml += `<div>${param.seriesName}：${param.value} 个</div>`;
        });
        return tooltipHtml;
      },
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      // 图例：显示所有类型和总数（自动从series中提取name）
      data: [...TASK_TYPES.map(t => t.label), TOTAL_CONFIG.label],
      top: 0,
      left: 'center',
      textStyle: {
        fontSize: 12
      }
    },
    series: series
  });
}

// 8. 初始化加载数据
onMounted(async () => {
  if (dateRange.value) {
    await fetchMonthlyTaskData(dateRange.value[0], dateRange.value[1]);
  }
});
</script>

<template>
  <div class="task-monthly-chart-container" style="padding: 5px;">
    <!-- 筛选栏：仅保留日期选择器，移除任务类型选择器 -->
    <div class="filter-wrapper" style="margin-bottom: 5px; align-items: center;">
      <DatePicker.RangePicker
        v-model="dateRange"
        v-bind="datePickerProps"
        style="width: 250px;"
      />
    </div>
    <!-- 折线图容器（展示6条线） -->
    <EchartsUI ref="chartRef" style="width: 100%; height: 450px;" />
  </div>
</template>
