import { createRouter, createWebHashHistory } from 'vue-router';
import { pending } from '@/utils/loading';

const routes = [
  { path: '/', redirect: '/daily' },
  {
    path: '/daily/:userId?',
    name: 'daily',
    meta: { title: '日报' },
    component: () => pending(import('../views/Daily.vue')),
  },
  { path: '/weekly', name: 'weekly', meta: { title: '周报' }, component: () => pending(import('../views/Weekly.vue')) },
  {
    path: '/first-class',
    name: 'first-class',
    meta: { title: '头等舱' },
    component: () => pending(import('../views/first-class/FirstClass.vue')),
  },
  {
    path: '/ranking',
    name: 'ranking',
    meta: { title: '总榜' },
    component: () => pending(import('../views/Ranking.vue')),
  },
  { path: '/:routeKey(.*)', redirect: '/daily' }, // 兜底跳转
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.PROD ? '/nice-leetcode/docs' : ''),
  routes,
});

export default router;
