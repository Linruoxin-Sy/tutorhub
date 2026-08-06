/**
 * vue-i18n 类型增强：让 $t / t 的 key 与 en 消息结构强绑定（TS 安全）。
 * 参考：https://vue-i18n.intlify.dev/guide/advanced/typescript.html
 */
import en from './en';

type MessageSchema = typeof en;

declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
}
