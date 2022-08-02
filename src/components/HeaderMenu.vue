<script setup lang="ts">
const router = useRouter();
const allRoutes = router.getRoutes().filter((page) => page.meta?.title);
</script>

<template>
  <div class="menu-wrap">
    <div class="menu-item" v-for="page in allRoutes" :key="page.path">
      <router-link :to="{ name: page.name }">{{ page.meta.title }}</router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.menu-wrap {
  display: flex;
  align-items: center;
  height: 70%;
  color: #fff;
  font-size: 18px;

  .menu-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100%;
    transition: all 0.3s;
    cursor: pointer;

    a {
      color: #fff;
      text-decoration: none;
    }

    &:hover {
      border-radius: 1024px;
      background-color: #fff;
      box-shadow: 0 15px 30px 0 rgb(0 0 0 / 15%);
      color: #000;

      & > a {
        color: #000;
      }
    }
  }
}
</style>
