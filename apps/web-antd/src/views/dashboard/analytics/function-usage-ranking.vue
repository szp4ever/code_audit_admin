<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import { message, Spin } from 'ant-design-vue';

import { getUserOperationHeatmap } from '#/api/taskmanagement';

// 功能模块中文映射
const moduleMap: Record<string, string> = {
  'workflow': '工作流',
  'taskmanagement': '任务管理',
  'chat': '对话',
  'knowledge': '知识库',
  'system:user': '用户管理',
  'system:role': '角色管理',
  'system:menu': '菜单管理',
  'system:dept': '部门管理',
  'system:post': '岗位管理',
  'system:dict': '字典管理',
  'system:config': '参数配置',
  'system:notice': '通知公告',
  'system:log:operation': '操作日志',
  'system:log:login': '登录日志',
  'monitor:online': '在线用户',
  'monitor:cache': '缓存监控',
  'monitor:admin': '服务监控',
  'monitor:job': '定时任务',
  'workflow:category': '流程分类',
  'workflow:model': '流程模型',
  'workflow:define': '流程定义',
  'workflow:monitor': '流程监控',
  'workflow:form': '流程表单',
  'task:apply': '任务申请',
  'task:todo': '待办任务',
  'task:done': '已办任务',
  'task:cc': '抄送任务',
  'graph:instance': '图谱实例',
  'graph:visualization': '图谱可视化',
  'graph:rag': '图谱RAG',
  'dashboard:analytics': '数据分析',
};

interface RankingItem {
  module: string;
  moduleName: string;
  totalCount: number;
  rank: number;
}

const rankingList = ref<RankingItem[]>([]);
const loading = ref(false);

// 获取模块中文名称
const getModuleName = (module: string): string => {
  if (!module || typeof module !== 'string') {
    return '未知模块';
  }
  if (moduleMap[module]) {
    return moduleMap[module];
  }
  // 尝试不区分大小写的匹配
  const matchedKey = Object.keys(moduleMap).find(key => 
    key.toLowerCase() === module.toLowerCase()
  );
  if (matchedKey) {
    return moduleMap[matchedKey];
  }
  return module;
};

// 加载统计数据
const loadRankingData = async () => {
  loading.value = true;
  try {
    const heatmapData = await getUserOperationHeatmap({
      timeRange: 'week',
    });

    if (!heatmapData || heatmapData.length === 0) {
      rankingList.value = [];
      return;
    }

    // 按模块统计总使用次数
    const moduleStats = new Map<string, number>();
    
    heatmapData.forEach((item: any) => {
      if (item.module && item.count) {
        const currentCount = moduleStats.get(item.module) || 0;
        moduleStats.set(item.module, currentCount + (item.count || 0));
      }
    });

    // 转换为排行列表并排序
    const ranking: RankingItem[] = Array.from(moduleStats.entries())
      .map(([module, totalCount]) => ({
        module,
        moduleName: getModuleName(module),
        totalCount,
        rank: 0, // 稍后设置
      }))
      .sort((a, b) => b.totalCount - a.totalCount)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

    rankingList.value = ranking;
  } catch (error) {
    console.error('❌ [功能排行] 获取统计数据失败:', error);
    message.error('加载功能使用统计排行失败');
    rankingList.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadRankingData();
});

// 获取排名图标颜色
const getRankColor = (rank: number): string => {
  if (rank === 1) return '#ff6b6b'; // 红色 - 第一名
  if (rank === 2) return '#4ecdc4'; // 青色 - 第二名
  if (rank === 3) return '#45b7d1'; // 蓝色 - 第三名
  return '#95a5a6'; // 灰色 - 其他
};

// 获取排名图标
const getRankIcon = (rank: number): string => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `${rank}`;
};
</script>

<template>
  <div class="function-usage-ranking">
    <div v-if="loading" class="flex items-center justify-center h-64">
      <Spin size="large" tip="加载中..." />
    </div>
    <div v-else-if="rankingList.length === 0" class="flex items-center justify-center h-64 text-gray-400">
      暂无数据
    </div>
    <div v-else class="ranking-list">
      <div
        v-for="item in rankingList"
        :key="item.module"
        class="ranking-item"
      >
        <div class="rank-badge" :style="{ color: getRankColor(item.rank) }">
          {{ getRankIcon(item.rank) }}
        </div>
        <div class="module-info">
          <div class="module-name">{{ item.moduleName }}</div>
          <div class="module-count">{{ item.totalCount }} 次</div>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{
              width: `${(item.totalCount / rankingList[0].totalCount) * 100}%`,
              backgroundColor: getRankColor(item.rank),
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.function-usage-ranking {
  height: 100%;
  min-height: 400px;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.3s ease;

  &:hover {
    background: #e9ecef;
    transform: translateX(4px);
  }
}

.rank-badge {
  font-size: 24px;
  font-weight: bold;
  min-width: 40px;
  text-align: center;
  flex-shrink: 0;
}

.module-info {
  flex: 1;
  min-width: 0;
}

.module-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.module-count {
  font-size: 12px;
  color: #666;
}

.progress-bar {
  width: 100px;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  flex-shrink: 0;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}
</style>
