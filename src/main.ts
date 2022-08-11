import './utils/axios';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import HighchartsVue from 'highcharts-vue';
import type { QuestionMap } from '@@/scripts/typings';

const app = createApp(App);

const { data: quertionMapRes } = await axios.get<QuestionMap>(`/data/common/all_questions_map.json?v=${+new Date()}`);
app.config.globalProperties.$quertionMap = quertionMapRes;

app.use(router);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
app.use(HighchartsVue);

app.mount('#app');
