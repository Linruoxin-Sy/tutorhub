import type { App } from 'vue';
import { toast } from 'vue-sonner';

import { extractApiError, HTTP_STATUS_MESSAGES } from './api-error';

/**
 * 注册 Vue 运行时 + 浏览器全局的错误处理器。
 *
 * 覆盖三个维度：
 * 1. app.config.errorHandler       — Vue 组件渲染 / 生命周期中的同步/异步错误
 * 2. window.onerror                — 未被捕获的同步运行时错误
 * 3. window.onunhandledrejection   — 未被 catch 的 Promise reject
 *
 * 所有处理器只做通知和记录，不吞掉错误，保证开发工具仍能正常显示。
 */
export function registerGlobalErrorHandlers(app: App): void {
  // ── 1. Vue 运行时错误 ──
  app.config.errorHandler = (error, instance, info) => {
    const normalized = extractApiError(error);
    const fallbackMessage = normalized.status ? HTTP_STATUS_MESSAGES[normalized.status] : undefined;

    toast.error(fallbackMessage ?? normalized.message);
    console.error(`[Vue errorHandler] ${normalized.code}: ${normalized.message}`, {
      info,
      normalized,
      component: instance?.$options?.name ?? instance?.$options?.__name,
    });
  };

  // ── 2. 浏览器全局同步错误 ──
  window.onerror = (event, source, line, col, error) => {
    const normalized = extractApiError(error ?? event);
    toast.error(normalized.message);
    console.error(`[window.onerror] ${normalized.code}: ${normalized.message}`, {
      source,
      line,
      col,
      normalized,
    });
    // 返回 false 让浏览器默认处理继续（控制台显示红色错误）
    return false;
  };

  // ── 3. 未捕获的 Promise reject ──
  window.onunhandledrejection = (event) => {
    const normalized = extractApiError(event.reason);
    toast.error(normalized.message);
    console.error(`[unhandledrejection] ${normalized.code}: ${normalized.message}`, { normalized });
    // 不调用 preventDefault()，保持浏览器默认行为（控制台警告）
  };
}
