import { useId } from 'vue';

/**
 * 为表单字段生成全局唯一的 `id`，避免同一页面多个表单实例时 `id` 冲突。
 *
 * 基于 Vue 内置的 `useId()`，支持按需按名称生成任意字段 ID。
 *
 * @example
 * ```ts
 * const field = useField();
 * // 在模板中：
 * // <label :for="field.id('name')">Name</label>
 * // <input :id="field.id('name')" />
 * // <p :id="field.id('error')">Error message</p>
 * ```
 */
export function useField() {
  const baseId = useId();

  return {
    id(name: string) {
      return `${baseId}-${name}`;
    },
  };
}
