<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { message } from 'ant-design-vue';

import { getUserOperationHeatmap } from '#/api/taskmanagement';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

// 功能模块中文映射
const moduleMap: Record<string, string> = {
  'workflow': '工作流',
  'taskmanagement': '任务管理',
  'chat': '对话',
  'knowledge': '知识库',
};

onMounted(async () => {
  try {
    console.log('🔍 [热力图] 开始请求数据...');
    const heatmapData = await getUserOperationHeatmap({
      timeRange: 'week',
    });

    console.log('🔍 [热力图] 接收到数据:', heatmapData);
    console.log('🔍 [热力图] 数据类型:', typeof heatmapData);
    console.log('🔍 [热力图] 是否为数组:', Array.isArray(heatmapData));
    if (Array.isArray(heatmapData)) {
      console.log('🔍 [热力图] 数据长度:', heatmapData.length);
      if (heatmapData.length > 0) {
        console.log('🔍 [热力图] 第一条数据示例:', heatmapData[0]);
        console.log('🔍 [热力图] 数据字段检查:', {
          hasModule: 'module' in heatmapData[0],
          hasTimeSlot: 'timeSlot' in heatmapData[0],
          hasCount: 'count' in heatmapData[0],
          moduleValue: heatmapData[0].module,
          timeSlotValue: heatmapData[0].timeSlot,
          countValue: heatmapData[0].count,
          countType: typeof heatmapData[0].count,
        });
      }
    }

    if (!heatmapData || heatmapData.length === 0) {
      console.warn('⚠️ [热力图] 数据为空，显示空图表');
      // 显示空图表
      renderEcharts({
        series: [
          {
            data: [],
            type: 'heatmap',
          },
        ],
      });
      return;
    }

    // 提取所有唯一的功能模块和时间段
    console.log('🔍 [热力图] 开始处理数据...');
    
    // 检查数据完整性
    const invalidData = heatmapData.filter(item => !item.module || !item.timeSlot);
    if (invalidData.length > 0) {
      console.warn('⚠️ [热力图] 发现无效数据（缺少 module 或 timeSlot）:', invalidData);
    }
    
    // 过滤掉 undefined、null 和空字符串
    const modules = Array.from(
      new Set(heatmapData.map(item => item.module).filter(m => m != null && m !== ''))
    );
    const timeSlots = Array.from(
      new Set(heatmapData.map(item => item.timeSlot).filter(t => t != null && t !== ''))
    ).sort();
    console.log('🔍 [热力图] 提取的模块:', modules);
    console.log('🔍 [热力图] 提取的时间段:', timeSlots);

    // 构建热力图数据格式：[x, y, value]
    // x: 模块索引, y: 时间段索引, value: 使用频次
    // 过滤掉 module 或 timeSlot 为空的数据
    const heatmapSeriesData = heatmapData
      .filter(item => item.module && item.timeSlot) // 过滤掉空值
      .map(item => [
        modules.indexOf(item.module),
        timeSlots.indexOf(item.timeSlot),
        item.count || 0, // 确保 count 有默认值
      ])
      .filter(item => item[0] >= 0 && item[1] >= 0); // 过滤掉索引为 -1 的数据（找不到对应项）
    
    console.log('🔍 [热力图] 热力图数据点数量:', heatmapSeriesData.length);

    // 计算最大值用于颜色映射
    const maxValue = Math.max(...heatmapData.map(item => item.count || 0), 1);
    console.log('🔍 [热力图] 最大值:', maxValue);
    console.log('🔍 [热力图] 数据值范围:', {
      min: Math.min(...heatmapData.map(item => item.count || 0)),
      max: maxValue,
      values: heatmapData.map(item => item.count || 0).slice(0, 10),
    });

    // 格式化时间段显示（如果是日期格式，只显示日期部分）
    const formattedTimeSlots = timeSlots.map(slot => {
      // 安全检查：确保 slot 不是 undefined 或 null
      if (!slot || typeof slot !== 'string') {
        return '';
      }
      // 如果是日期时间格式，只取日期部分
      if (slot.includes(' ')) {
        return slot.split(' ')[0];
      }
      return slot;
    });

    // 格式化模块名称显示（确保所有模块都显示为中文）
    const formattedModules = modules.map(module => {
      // 安全检查：确保 module 不是 undefined 或 null
      if (!module || typeof module !== 'string') {
        return '未知模块';
      }
      // 直接使用映射表获取中文名称
      if (moduleMap[module]) {
        return moduleMap[module];
      }
      // 如果映射表中没有，尝试不区分大小写的匹配
      const matchedKey = Object.keys(moduleMap).find(key => 
        key.toLowerCase() === module.toLowerCase()
      );
      if (matchedKey) {
        return moduleMap[matchedKey];
      }
      // 如果还是没有匹配，返回原值
      return module;
    });

    console.log('🔍 [热力图] 准备渲染图表，配置:', {
      dataPoints: heatmapSeriesData.length,
      maxValue,
      visualMapRange: { min: 0, max: maxValue },
      sampleData: heatmapSeriesData.slice(0, 5),
    });

    renderEcharts({
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          const moduleName = formattedModules[params.data[0]];
          const timeSlot = formattedTimeSlots[params.data[1]];
          const count = params.data[2];
          return `${moduleName}<br/>${timeSlot}<br/>使用频次: ${count}`;
        },
      },
      grid: {
        height: '60%',
        top: '10%',
        left: '15%',
        right: '5%',
      },
      xAxis: {
        type: 'category',
        data: formattedModules,
        splitArea: {
          show: true,
        },
        axisLabel: {
          rotate: 45,
          interval: 0,
          fontSize: 10,
        },
      },
      yAxis: {
        type: 'category',
        data: formattedTimeSlots,
        splitArea: {
          show: true,
        },
        axisLabel: {
          fontSize: 10,
        },
      },
      visualMap: {
        type: 'continuous',
        min: 0,
        max: maxValue,
        calculable: true,
        realtime: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '5%',
        // 对于热力图，visualMap 会自动识别数据格式 [x, y, value] 中的 value
        // 明确指定维度，确保颜色映射正确
        dimension: 2,
        inRange: {
          // 从明显的蓝色开始，逐渐过渡到红色，确保最低频率也有明显颜色
          // 第一个颜色对应最小值（0），最后一个颜色对应最大值
          color: ['#42a5f5', '#1e88e5', '#1565c0', '#0d47a1', '#f44336', '#d32f2f', '#c62828'],
        },
        outOfRange: {
          // 对于超出范围的值，使用最低颜色
          color: ['#42a5f5'],
        },
        text: ['高', '低'],
        textStyle: {
          color: '#000',
        },
        // 确保 visualMap 应用到正确的 series
        seriesIndex: [0],
        // visualMap 组件尺寸
        itemWidth: 15,
        itemHeight: 150,
        // 确保 visualMap 正确映射到热力图数据
        precision: 0,
      },
      series: [
        {
          name: '用户操作频次',
          type: 'heatmap',
          data: heatmapSeriesData,
          itemStyle: {
            // 确保每个数据点都有颜色，即使值为0
            borderColor: '#fff',
            borderWidth: 1,
            // 不在这里设置 color，让 visualMap 控制颜色
          },
          label: {
            show: true,
            formatter: (params: any) => {
              const value = params.data[2];
              return value > 0 ? value : '';
            },
            fontSize: 10,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    });
    console.log('✅ [热力图] 图表渲染完成');
  } catch (error) {
    console.error('❌ [热力图] 获取用户操作热力图数据失败:', error);
    console.error('❌ [热力图] 错误详情:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    message.error('加载用户操作热力图数据失败');

    // 显示空图表
    renderEcharts({
      series: [
        {
          data: [],
          type: 'heatmap',
        },
      ],
    });
  }
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
