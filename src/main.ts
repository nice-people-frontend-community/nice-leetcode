import type { QuestionMap } from '@@/scripts/typings';
import HighchartsVue from 'highcharts-vue';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './utils/axios';

const app = createApp(App);

// 记录到 storage 中缓存起来
const localQuertionMap: string | null = window.localStorage.getItem('leetcode_questions');
if (localQuertionMap) {
  app.config.globalProperties.$quertionMap = JSON.parse(localQuertionMap);
} else {
  (async () => {
    const { data: quertionMapRes } = await axios.get<QuestionMap>(`/data/common/all_questions_map.json`);
    app.config.globalProperties.$quertionMap = quertionMapRes;
    window.localStorage.setItem('leetcode_questions', JSON.stringify(quertionMapRes));
  })();
}

app.use(router);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
app.use(HighchartsVue);

app.mount('#app');
