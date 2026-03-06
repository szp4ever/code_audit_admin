<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';
import { onMounted, ref, reactive } from 'vue';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { message, DatePicker } from 'ant-design-vue';
import type { RangePickerProps } from 'ant-design-vue/es/date-picker';
import dayjs, { type Dayjs } from 'dayjs';
// 注意：建议后端接口调整为年度统计接口，这里先保留原接口名，你可根据实际情况修改
import {getMonthlyTaskCount, getYearlyTaskCount} from '#/api/taskmanagement';

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

// 3. 日期选择器配置（修改为年度选择）
const dateRange = ref<[Dayjs, Dayjs] | null>([
  dayjs().subtract(5, 'year'), // 默认近5年
  dayjs()
]);
const datePickerProps = reactive<RangePickerProps>({
  placeholder: ['开始年份', '结束年份'],
  format: 'YYYY', // 仅显示年份
  picker: 'year', // 选择器类型改为年
  disabledDate: (date: Dayjs) => {
    return date.isAfter(dayjs(), 'year'); // 禁用未来年份
  },
  onChange: handleDateRangeChange
});

/**
 * 4. 日期范围变更处理（年度维度）
 */
async function handleDateRangeChange(range: [Dayjs, Dayjs] | null) {
  dateRange.value = range;
  if (range && range[0] && range[1]) {
    await fetchYearlyTaskData(range[0], range[1]);
  }
}

/**
 * 5. 获取所有任务类型的年度数据（修改为年度请求）
 */
async function fetchYearlyTaskData(startDate: Dayjs, endDate: Dayjs) {
  try {
    // 调用接口：传递年度参数（需确保后端接口支持按年查询）
    const res = await getYearlyTaskCount({
      start: startDate.format('YYYY'), // 仅传年份
      end: endDate.format('YYYY')     // 仅传年份
      // 若后端接口需要调整，这里需对应修改参数名，比如改为 startYear/endYear
    });

    // 格式化年度数据
    const formattedData = formatTaskData(res);

    // 渲染折线图
    renderLineChart(formattedData);
  } catch (error) {
    console.error('获取年度任务数量失败:', error);
    message.error('加载年度任务数量数据失败');
    // 渲染空图表
    renderLineChart({ yearList: [], typeDataMap: {}, totalData: [] });
  }
}

/**
 * 6. 数据格式化核心方法（适配年度数据）
 * @param rawData 接口返回的原始多年度数据
 * @returns 格式化后的图表数据
 */
function formatTaskData(rawData: any): FormattedTaskData {
  // 6.1 提取所有不重复的年度标签（按时间排序）
  const yearSet = new Set(rawData.map(item => item.year)); // 假设后端返回字段为year
  const yearList = Array.from(yearSet).sort((a, b) => a.localeCompare(b));

  // 6.2 构建「任务类型 -> 年度数量」映射（缺失年度填充0）
  const typeDataMap: Record<string, number[]> = {};
  TASK_TYPES.forEach(taskType => {
    const typeData = yearList.map(year => {
      const matchItem = rawData.find(item => item.year === year && item.type === taskType.value);
      return matchItem?.count || 0;
    });
    typeDataMap[taskType.value] = typeData;
  });

  // 6.3 计算各年度的总任务量（5种类型数量求和）
  const totalData: number[] = yearList.map((_, index) => {
    return TASK_TYPES.reduce((sum, taskType) => {
      return sum + (typeDataMap[taskType.value][index] || 0);
    }, 0);
  });

  // 返回格式化后的完整数据
  return { yearList, typeDataMap, totalData };
}

/**
 * 7. 类型定义（适配年度数据）
 */
interface FormattedTaskData {
  yearList: string[];      // 年度列表（如 ['2021', '2022', '2023']）
  typeDataMap: Record<string, number[]>; // 各类型年度数据
  totalData: number[];     // 各年度总任务量
}

/**
 * 8. 渲染折线图（修改为年度展示）
 * @param formattedData 格式化后的年度数据
 */
function renderLineChart(formattedData: FormattedTaskData) {
  const { yearList, typeDataMap, totalData } = formattedData;

  // 8.1 构建系列数据（5种任务类型 + 1条总数）
  const series = [
    // 5种任务类型的折线
    ...TASK_TYPES.map(taskType => ({
      name: taskType.label,
      type: 'line',
      data: typeDataMap[taskType.value] || [],
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
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
    // 总任务量折线
    {
      name: TOTAL_CONFIG.label,
      type: 'line',
      data: totalData,
      smooth: true,
      symbol: 'diamond',
      symbolSize: 6,
      lineStyle: {
        color: TOTAL_CONFIG.color,
        width: 3,
        type: 'dashed'
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

  // 8.2 渲染Echarts图表
  renderEcharts({
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: yearList, // X轴改为年度列表
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
        // Tooltip展示年度数据
        let tooltipHtml = `<div>${params[0].name}年</div>`; // 增加"年"字更直观
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

// 9. 初始化加载数据
onMounted(async () => {
  if (dateRange.value) {
    await fetchYearlyTaskData(dateRange.value[0], dateRange.value[1]);
  }
});
</script>

<template>
  <div class="task-yearly-chart-container" style="padding: 5px;">
    <!-- 筛选栏：年度选择器 -->
    <div class="filter-wrapper" style="margin-bottom: 5px; align-items: center;">
      <DatePicker.RangePicker
        v-model="dateRange"
        v-bind="datePickerProps"
        style="width: 250px;"
      />
    </div>
    <!-- 折线图容器（年度统计） -->
    <EchartsUI ref="chartRef" style="width: 100%; height: 450px;" />
  </div>
</template>
