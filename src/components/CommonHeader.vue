<template>
  <div class="header">
    <div class="title">
      <img class="logo" src="https://leetcode.com/static/images/LeetCode_logo_rvs.png" alt="leetcode" srcset="" />
      <i>Nice-Leetcode</i>
    </div>
    <header-menu />
    <a href="https://github.com/nice-people-frontend-community/nice-leetcode">
      <github />
    </a>
  </div>
</template>

<style scoped lang="scss">
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 55px;
  padding: 0 100px;
  background: linear-gradient(-150deg, #51545d 15%, #2f2f2f 70%, #222 94%);
  box-shadow: 0 4px 10px rgb(0 0 0 / 20%);
  user-select: none;

  .title {
    display: flex;
    align-items: center;
    color: #fff;
    font-size: 22px;

    .logo {
      width: 50px;
      height: 50px;
    }
  }
}
</style>
