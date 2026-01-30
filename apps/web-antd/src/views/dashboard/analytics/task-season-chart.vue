<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';
import { onMounted, ref, reactive } from 'vue';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { message, Select } from 'ant-design-vue';
import type { SelectProps } from 'ant-design-vue/es/select';
import dayjs from 'dayjs';
import { getQuarterlyTaskStats } from '#/api/taskmanagement'; // 需补充该接口

// 图表实例引用
const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

// 年份选择器配置
const currentYear = ref<string>(dayjs().format('YYYY'));
// 生成近5年的年份选项
const yearOptions = Array.from({ length: 10 }, (_, i) => {
  const year = dayjs().subtract(i, 'year').format('YYYY');
  return { label: `${year}年`, value: year };
});

const selectProps = reactive<SelectProps>({
  placeholder: '选择年份',
  options: yearOptions,
  onChange: handleYearChange
});

// 颜色配置
const totalColor = '#77b7e4'; // 总任务量
const successColor = '#99de77'; // 成功任务
const failColor = '#e17379'; // 失败任务

/**
 * 年份变更处理
 */
async function handleYearChange(year: string) {
  currentYear.value = year;
  await fetchQuarterlyTaskData(year);
}

/**
 * 获取季度任务统计数据
 * @param year 选择的年份
 */
async function fetchQuarterlyTaskData(year: string) {
  try {
    // 调用接口获取季度任务统计（需后端配合实现）
    const res = await getQuarterlyTaskStats({ year });
    // 接口返回格式示例：
    // [
    //   { quarter: 'Q1', total: 100, success: 80, fail: 20, successRate: 0.8, failRate: 0.2 },
    //   { quarter: 'Q2', total: 120, success: 90, fail: 30, successRate: 0.75, failRate: 0.25 },
    //   ...
    // ]

    // 处理数据：格式化X轴标签、提取各维度数据
    const xAxisLabels = res.map(item => `${year}年${item.quarter}`); // 如：2024年Q1
    const totalCounts = res.map(item => item.total);
    const successCounts = res.map(item => item.success);
    const failCounts = res.map(item => item.fail);
    const successRates = res.map(item => (item.successRate * 100).toFixed(1)); // 转为百分比
    const failRates = res.map(item => (item.failRate * 100).toFixed(1));

    // 渲染柱状图
    renderBarChart(xAxisLabels, totalCounts, successCounts, failCounts, successRates, failRates);
  } catch (error) {
    console.error('获取季度任务统计失败:', error);
    message.error('加载季度任务统计数据失败');
    // 渲染空图表
    renderBarChart([], [], [], [], [], []);
  }
}

/**
 * 渲染季度任务统计柱状图（堆叠柱状图，固定展示4列（Q1-Q4））
 * @param xAxisLabels X轴标签（年份+季度）
 * @param totalCounts 季度总任务量
 * @param successCounts 成功任务数
 * @param failCounts 失败任务数
 * @param successRates 成功率(百分比)
 * @param failRates 失败率(百分比)
 */
function renderBarChart(
  xAxisLabels: string[],
  totalCounts: number[],
  successCounts: number[],
  failCounts: number[],
  successRates: string[],
  failRates: string[]
) {
  // 关键步骤1：定义固定4个季度，确保X轴始终4列
  const fixedQuarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const currentYear = xAxisLabels[0]?.split('年')[0] || dayjs().format('YYYY'); // 提取当前选中年份
  // 固定X轴标签（年份+季度，始终4个）
  const fixedXAxisLabels = fixedQuarters.map(quarter => `${currentYear}年${quarter}`);

  // 关键步骤2：将接口返回的数据映射到固定4个季度，缺失补0，多余截断
  // 先将返回数据转为 季度->数据 的映射对象（方便匹配）
  const quarterDataMap = new Map();
  fixedQuarters.forEach((quarter, index) => {
    quarterDataMap.set(quarter, {
      total: totalCounts[index] || 0,
      success: successCounts[index] || 0,
      fail: failCounts[index] || 0,
      successRate: successRates[index] || '0.0',
      failRate: failRates[index] || '0.0'
    });
  });
  // 提取固定4个季度的对应数据（始终4条）
  const fixedTotalCounts = fixedQuarters.map(q => quarterDataMap.get(q).total);
  const fixedSuccessCounts = fixedQuarters.map(q => quarterDataMap.get(q).success);
  const fixedFailCounts = fixedQuarters.map(q => quarterDataMap.get(q).fail);
  const fixedSuccessRates = fixedQuarters.map(q => quarterDataMap.get(q).successRate);
  const fixedFailRates = fixedQuarters.map(q => quarterDataMap.get(q).failRate);

  // 后续绘图逻辑不变，仅将原有数据替换为固定长度的4列数据
  renderEcharts({
    grid: {
      left: '5%',
      right: '8%',
      bottom: '8%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: fixedXAxisLabels, // 使用固定4列的X轴标签
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
    yAxis: [
      {
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
        min: 0
      },
      {
        type: 'value',
        name: '比率(%)',
        nameTextStyle: {
          fontSize: 12
        },
        axisLine: {
          lineStyle: {
            color: '#A2A3A9'
          }
        },
        splitLine: {
          show: false
        },
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%'
        }
      }
    ],
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) => {
        const quarter = params[0].name;
        const success = params[0].value;
        const fail = params[1].value;
        const total = success + fail;
        const successRate = params[2].value;
        const failRate = params[3].value;
        return `
          <div>${quarter}</div>
          <div>总任务量：${total} 个</div>
          <div>成功任务：${success} 个 (${successRate}%)</div>
          <div>失败任务：${fail} 个 (${failRate}%)</div>
        `;
      }
    },
    legend: {
      data: ['成功任务数', '失败任务数', '成功率(%)', '失败率(%)'],
      top: 0,
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '成功任务数',
        type: 'bar',
        yAxisIndex: 0,
        stack: 'totalTask',
        data: fixedSuccessCounts, // 使用固定4列的成功任务数
        itemStyle: {
          color: successColor
        },
        emphasis: {
          itemStyle: {
            color: successColor,
            borderColor: '#fff',
            borderWidth: 1
          }
        }
      },
      {
        name: '失败任务数',
        type: 'bar',
        yAxisIndex: 0,
        stack: 'totalTask',
        data: fixedFailCounts, // 使用固定4列的失败任务数
        itemStyle: {
          color: failColor
        },
        emphasis: {
          itemStyle: {
            color: failColor,
            borderColor: '#fff',
            borderWidth: 1
          }
        }
      },
      {
        name: '成功率(%)',
        type: 'line',
        yAxisIndex: 1,
        data: fixedSuccessRates, // 使用固定4列的成功率
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: '#328308',
          width: 2
        },
        itemStyle: {
          color: '#328308'
        },
        emphasis: {
          symbolSize: 8
        }
      },
      {
        name: '失败率(%)',
        type: 'line',
        yAxisIndex: 1,
        data: fixedFailRates, // 使用固定4列的失败率
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: '#a7272e',
          width: 2
        },
        itemStyle: {
          color: '#a7272e'
        },
        emphasis: {
          symbolSize: 8
        }
      }
    ]
  });
}


// 初始化加载数据
onMounted(async () => {
  await fetchQuarterlyTaskData(currentYear.value);
});
</script>

<template>
  <div class="task-quarterly-chart-container" style="padding: 5px;">
    <!-- 年份选择器 -->
    <div class="year-select-wrapper" style="margin-bottom: 5px;">
      <Select
        v-model:value="currentYear"
        v-bind="selectProps"
        style="width: 150px;"
      />
    </div>
    <!-- 柱状图容器 -->
    <EchartsUI ref="chartRef" style="width: 100%; height: 450px;" />
  </div>
</template>
