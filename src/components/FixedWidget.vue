<script setup lang="ts">
const router = useRouter();
const allRoutes = router
  .getRoutes()
  .filter((page) => page.meta?.title)
  .map((page) => {
    return { ...page, path: page.path.replace(/\/:.*?\??$/, '') };
  });
const context = import.meta.env.PROD ? '/nice-leetcode/docs/#' : '#';
</script>

<template>
  <div class="fixed-widget" :style="{ height: allRoutes.length * 22 + 'px' }">
    <div class="fixed-widget__item" v-for="page in allRoutes" :key="page.path">
      <el-link type="info" :href="context + page.path">{{ page.meta.title }}</el-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fixed-widget {
  position: fixed;
  z-index: 10000;
  top: 50%;
  right: 20px;
  height: 200px;
  padding: 20px 10px;
  transform: translate(0, -50%);
  background: #fff;
  box-shadow: 1px 0 8px 0 #e6e6e6;
}
</style>
