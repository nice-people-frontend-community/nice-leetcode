import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', redirect: '/daily' },
  { path: '/daily', meta: { title: '日报' }, component: () => import('../views/Daily.vue') },
  { path: '/weekly', meta: { title: '周报' }, component: () => import('../views/Weekly.vue') },
  { path: '/first-class', meta: { title: '头等舱' }, component: () => import('../views/first-class/FirstClass.vue') },
  { path: '/ranking', meta: { title: '总榜' }, component: () => import('../views/Ranking.vue') },
  { path: '/:routeKey(.*)', redirect: '/daily' }, // 兜底跳转
];

const router = createRouter({
  // 不太清楚以后会不会有锚点跳转的需求，所以先用了 history 模式
  history: createWebHistory(),
  routes,
});

export default router;
