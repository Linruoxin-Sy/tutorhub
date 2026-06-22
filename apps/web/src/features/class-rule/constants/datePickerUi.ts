import type { UIConfig } from '@vuepic/vue-datepicker';

/** VueDatePicker SVG 图标颜色：与当前表单文字色一致 */
const iconColor = 'text-gray-500 dark:text-gray-400';

/** 与表单输入框风格统一的 VueDatePicker UI 配置 */
export const datePickerUi: Partial<UIConfig> = {
  input:
    '!rounded-xl !border !border-gray-200 !bg-white !px-4 !py-3 !text-sm !text-gray-900 !transition-all outline-none focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-500/20 dark:!border-[#3a3a3a] dark:!bg-[#202020] dark:!text-white',
  menu: `!rounded-2xl !border !border-gray-200 !bg-white !shadow-sm dark:!border-[#2f2f2f] dark:!bg-[#2c2c2c] ${iconColor}`,
};
