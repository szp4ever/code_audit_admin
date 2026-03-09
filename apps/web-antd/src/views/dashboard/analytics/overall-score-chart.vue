<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';
import { onMounted, ref, reactive } from 'vue';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { message, DatePicker } from 'ant-design-vue';
import type { RangePickerProps, PickerProps } from 'ant-design-vue/es/date-picker';
import dayjs, { type Dayjs } from 'dayjs';
import { getMonthlyCodeQuality, getYearlyCodeQuality } from  '#/api/taskmanagement';

// 评分样式配置
const SCORE_CONFIG = {
  label: '代码质量综合评分',
  color: '#64b6f1',
  min: 0,
  max: 100 // 综合评分范围 0-100
};

// 1. 图表实例引用（月度+年度）
const monthChartRef = ref<EchartsUIType>();
const yearChartRef = ref<EchartsUIType>();
const { renderEcharts: renderMonthEcharts } = useEcharts(monthChartRef);
const { renderEcharts: renderYearEcharts } = useEcharts(yearChartRef);

// 2. 日期选择器配置
// 月度日期范围（默认近6个月）
const monthDateRange = ref<[Dayjs, Dayjs] | null>([
  dayjs().subtract(6, 'month'),
  dayjs()
]);
// 年度选择（默认近3年）
const yearDate = ref<Dayjs[] | null>([
  dayjs().subtract(3, 'year'),
  dayjs()
]);

// 月度日期选择器Props
const monthDatePickerProps = reactive<RangePickerProps>({
  placeholder: ['开始年月', '结束年月'],
  format: 'YYYY-MM',
  picker: 'month',
  disabledDate: (date: Dayjs) => date.isAfter(dayjs(), 'month'),
  onChange: handleMonthDateChange
});

// 年度日期选择器Props
const yearDatePickerProps = reactive<PickerProps>({
  placeholder: ['开始年份', '结束年份'],
  format: 'YYYY',
  picker: 'year',
  disabledDate: (date: Dayjs) => date.isAfter(dayjs(), 'year'),
  onChange: handleYearDateChange
});

/**
 * 月度日期变更处理
 */
async function handleMonthDateChange(range: [Dayjs, Dayjs] | null) {
  monthDateRange.value = range;
  if (range && range[0] && range[1]) {
    await fetchMonthlyScoreData(range[0], range[1]);
  }
}

/**
 * 年度日期变更处理
 */
async function handleYearDateChange(range: Dayjs[] | null) {
  yearDate.value = range;
  if (range && range[0] && range[1]) {
    await fetchYearlyScoreData(range[0], range[1]);
  }
}

/**
 * 获取月度代码质量评分数据
 */
async function fetchMonthlyScoreData(startDate: Dayjs, endDate: Dayjs) {
  try {
    const res = await getMonthlyCodeQuality({
      start: startDate.format('YYYY-MM'),
      end: endDate.format('YYYY-MM')
    });
    const formattedData = formatMonthlyScoreData(res);
    renderMonthLineChart(formattedData);
  } catch (error) {
    console.error('获取月度代码质量评分失败:', error);
    message.error('加载月度代码质量评分数据失败');
    renderMonthLineChart({ monthList: [], scoreData: [] });
  }
}

/**
 * 获取年度代码质量评分数据
 */
async function fetchYearlyScoreData(startDate: Dayjs, endDate: Dayjs) {
  try {
    const res = await getYearlyCodeQuality({
      start: startDate.format('YYYY'),
      end: endDate.format('YYYY')
    });
    const formattedData = formatYearlyScoreData(res);
    renderYearLineChart(formattedData);
  } catch (error) {
    console.error('获取年度代码质量评分失败:', error);
    message.error('加载年度代码质量评分数据失败');
    renderYearLineChart({ yearList: [], scoreData: [] });
  }
}

/**
 * 格式化月度评分数据
 */
function formatMonthlyScoreData(rawData: MonthlyCodeQuality[]): FormattedMonthlyScore {
  // 提取不重复月度并排序
  const monthSet = new Set(rawData.map(item => item.month));
  const monthList = Array.from(monthSet).sort((a, b) => a.localeCompare(b));
  // 映射月度评分（缺失填充0）
  const scoreData = monthList.map(month => {
    const matchItem = rawData.find(item => item.month === month);
    return matchItem?.overallScore || 0;
  });
  return { monthList, scoreData };
}

/**
 * 格式化年度评分数据
 */
function formatYearlyScoreData(rawData: YearlyCodeQuality[]): FormattedYearlyScore {
  // 提取不重复年度并排序
  const yearSet = new Set(rawData.map(item => item.year));
  const yearList = Array.from(yearSet).sort((a, b) => a.localeCompare(b));
  // 映射年度评分（缺失填充0）
  const scoreData = yearList.map(year => {
    const matchItem = rawData.find(item => item.year === year);
    return matchItem?.overallScore || 0;
  });
  return { yearList, scoreData };
}

/**
 * 渲染月度折线图
 */
function renderMonthLineChart(formattedData: FormattedMonthlyScore) {
  const { monthList, scoreData } = formattedData;
  renderMonthEcharts({
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: monthList,
      axisLabel: { interval: 0, fontSize: 12 },
      axisLine: { lineStyle: { color: '#A2A3A9' } }
    },
    yAxis: {
      type: 'value',
      name: '综合评分(分)',
      nameTextStyle: { fontSize: 12 },
      axisLine: { lineStyle: { color: '#A2A3A9' } },
      splitLine: { lineStyle: { color: '#A2A3A9' } },
      min: SCORE_CONFIG.min,
      max: SCORE_CONFIG.max
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) => `<div>${params[0].name}</div><div>${params[0].seriesName}：${params[0].value} 分</div>`,
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: [SCORE_CONFIG.label],
      top: 0,
      left: 'center',
      textStyle: { fontSize: 12 }
    },
    series: [{
      name: SCORE_CONFIG.label,
      type: 'line',
      data: scoreData,
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      lineStyle: { color: SCORE_CONFIG.color, width: 2 },
      itemStyle: { color: SCORE_CONFIG.color },
      emphasis: {
        itemStyle: { color: SCORE_CONFIG.color, borderColor: '#fff', borderWidth: 2 },
        symbolSize: 7
      }
    }]
  });
}

/**
 * 渲染年度折线图
 */
function renderYearLineChart(formattedData: FormattedYearlyScore) {
  const { yearList, scoreData } = formattedData;
  renderYearEcharts({
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: yearList,
      axisLabel: { interval: 0, fontSize: 12 },
      axisLine: { lineStyle: { color: '#A2A3A9' } }
    },
    yAxis: {
      type: 'value',
      name: '综合评分(分)',
      nameTextStyle: { fontSize: 12 },
      axisLine: { lineStyle: { color: '#A2A3A9' } },
      splitLine: { lineStyle: { color: '#A2A3A9' } },
      min: SCORE_CONFIG.min,
      max: SCORE_CONFIG.max
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) => `<div>${params[0].name}</div><div>${params[0].seriesName}：${params[0].value} 分</div>`,
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: [SCORE_CONFIG.label],
      top: 0,
      left: 'center',
      textStyle: { fontSize: 12 }
    },
    series: [{
      name: SCORE_CONFIG.label,
      type: 'line',
      data: scoreData,
      smooth: true,
      symbol: 'diamond',
      symbolSize: 6,
      lineStyle: { color: SCORE_CONFIG.color, width: 3, type: 'dashed' },
      itemStyle: { color: SCORE_CONFIG.color },
      emphasis: {
        itemStyle: { color: SCORE_CONFIG.color, borderColor: '#fff', borderWidth: 2 },
        symbolSize: 8
      }
    }]
  });
}

// 初始化加载数据
onMounted(async () => {
  // 加载月度数据
  if (monthDateRange.value) {
    await fetchMonthlyScoreData(monthDateRange.value[0], monthDateRange.value[1]);
  }
  // 加载年度数据
  if (yearDate.value) {
    await fetchYearlyScoreData(yearDate.value[0], yearDate.value[1]);
  }
});

// 类型定义
interface MonthlyCodeQuality {
  month: string; // 格式 YYYY-MM
  overallScore: number; // 综合评分 0-100
}

interface YearlyCodeQuality {
  year: string; // 格式 YYYY
  overallScore: number; // 综合评分 0-100
}

interface FormattedMonthlyScore {
  monthList: string[];
  scoreData: number[];
}

interface FormattedYearlyScore {
  yearList: string[];
  scoreData: number[];
}
</script>

<template>
  <div class="code-quality-chart-container" style="padding: 10px;">
    <!-- 月度评分模块 -->
    <div class="month-chart-wrapper" style="margin-bottom: 20px;">
      <div class="filter-wrapper" style="margin-bottom: 5px; align-items: center;">
        <span style="margin-right: 10px; font-size: 14px; font-weight: 500;">月度代码质量评分：</span>
        <DatePicker.RangePicker
          v-model="monthDateRange"
          v-bind="monthDatePickerProps"
          style="width: 250px;"
        />
      </div>
      <EchartsUI ref="monthChartRef" style="width: 100%; height: 400px;" />
    </div>

    <!-- 年度评分模块 -->
    <div class="year-chart-wrapper">
      <div class="filter-wrapper" style="margin-bottom: 5px; align-items: center;">
        <span style="margin-right: 10px; font-size: 14px; font-weight: 500;">年度代码质量评分：</span>
        <DatePicker.RangePicker
          v-model="yearDate"
          v-bind="yearDatePickerProps"
          style="width: 250px;"
        />
      </div>
      <EchartsUI ref="yearChartRef" style="width: 100%; height: 400px;" />
    </div>
  </div>
</template>
