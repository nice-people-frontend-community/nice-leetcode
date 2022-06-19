import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', redirect: '/daily' },
  { path: '/daily', component: () => import('../views/Daily.vue') },
  { path: '/weekly', component: () => import('../views/Weekly.vue') },
  { path: '/first-class', component: () => import('../views/FirstClass.vue') },
  { path: '/ranking', component: () => import('../views/Ranking.vue') },
  { path: '/:routeKey(.*)', redirect: '/daily' }, // 兜底跳转
];

const router = createRouter({
  // 不太清楚以后会不会有锚点跳转的需求，所以先用了 history 模式
  history: createWebHistory(),
  routes,
});

export default router;
