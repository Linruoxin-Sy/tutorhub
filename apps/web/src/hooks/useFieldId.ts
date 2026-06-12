/**
 * 为表单字段生成全局唯一的 `id`，避免同一页面多个表单实例时 `id` 冲突。
 *
 * 利用 `getCurrentInstance()?.uid`（每个 Vue 组件实例唯一）作前缀，
 * 确保同一个组件内多次调用也生成不同的 id。
 *
 * @example
 * ```ts
 * const { fieldId } = useFieldId('student-form');
 * // 在模板中：
 * // <label :for="fieldId('name')">Name</label>
 * // <input :id="fieldId('name')" />
 * ```
 */
export function useFieldId(prefix: string) {
  const uid = getCurrentInstance()?.uid ?? 0;

  function fieldId(name: string): string {
    return `${prefix}-${uid}-${name}`;
  }

  return { fieldId };
}
