/**
 * 关键词搜索历史工具
 *
 * 基于 localStorage 简单实现：
 * - 记录最近使用的若干关键词
 * - 去重、最近使用的排在最前
 * - 主要配合 antd AutoComplete 的 options 使用
 */

export interface KeywordHistoryOption {
  value: string;
}

export interface KeywordHistory {
  /**
   * 下拉选项数组，直接绑定给 AutoComplete 的 options
   */
  options: KeywordHistoryOption[];
  /**
   * 将关键词写入历史，并同步更新 options
   */
  add: (keyword: string) => void;
  /**
   * 从 localStorage 重新同步 options（适合在组件聚焦时调用）
   */
  syncFromStorage: () => void;
}

const MAX_HISTORY = 10;

function loadKeywords(storageKey: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => typeof item === 'string');
  } catch {
    return [];
  }
}

function saveKeywords(storageKey: string, list: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(list));
  } catch {
    // 忽略存储异常（例如隐身模式下的 quota 问题）
  }
}

/**
 * 创建一个关键词历史管理器
 *
 * @param storageKey localStorage 使用的 key
 */
export function createKeywordHistory(storageKey: string): KeywordHistory {
  const options: KeywordHistoryOption[] = [];

  const syncFromStorage = () => {
    const list = loadKeywords(storageKey);
    options.length = 0;
    list.forEach((value) => {
      options.push({ value });
    });
  };

  const add = (keyword: string) => {
    const k = keyword.trim();
    if (!k) return;

    const list = loadKeywords(storageKey);
    // 去重，最近使用的排在最前
    const filtered = list.filter((item) => item !== k);
    filtered.unshift(k);

    const limited = filtered.slice(0, MAX_HISTORY);
    saveKeywords(storageKey, limited);

    options.length = 0;
    limited.forEach((value) => {
      options.push({ value });
    });
  };

  // 初始同步一次
  syncFromStorage();

  return {
    options,
    add,
    syncFromStorage,
  };
}

