import { VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
import { i18n } from './locales';
import { applyLocale } from './locales/applier';
import router from './router';
import { registerGlobalErrorHandlers } from './utils/global-error-handler.ts';
import { queryClient } from './utils/query.ts';

import './index.css';

// 启动时应用持久化的语言（同步 <html lang> / dayjs / document.title）
applyLocale();

const app = createApp(App);

app.use(createPinia());
app.use(i18n);
app.use(VueQueryPlugin, { queryClient });
app.use(router);

registerGlobalErrorHandlers(app);

app.mount('#app');
