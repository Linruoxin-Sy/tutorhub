import { VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
import router from './router';
import { registerGlobalErrorHandlers } from './utils/global-error-handler.ts';
import { queryClient } from './utils/query.ts';

import './index.css';

const app = createApp(App);

app.use(createPinia());
app.use(VueQueryPlugin, { queryClient });
app.use(router);

registerGlobalErrorHandlers(app);

app.mount('#app');
