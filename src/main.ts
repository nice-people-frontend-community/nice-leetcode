import './utils/axios';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import type { QuestionMap } from '@@/scripts/typings';

const app = createApp(App);

const { data: quertionMapRes } = await axios.get<QuestionMap>(`/data/common/all_questions_map.json?v=${+new Date()}`);
app.config.globalProperties.$quertionMap = quertionMapRes;

app.use(router);

app.mount('#app');
