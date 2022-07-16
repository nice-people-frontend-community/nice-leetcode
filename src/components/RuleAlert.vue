<script lang="ts">
export default {
  props: {
    title: {
      type: String,
      default: '不要忘记在群里截图打卡哦~',
      required: false,
    },
    description: {
      type: String,
      default:
        '本周内做题超过 14 题并且没有在微信群截图打卡的同学将会获得『偷学大师』的称号；连续两周获取此称号的同学将不再参与排名统计',
      required: false,
    },
  },
};
</script>

<template>
  <el-alert class="alert" :title="title" :description="description" type="error" :closable="false" />
</template>

<style scoped>
.alert {
  position: sticky;
  z-index: 999;
  top: 0;
  margin-bottom: 10px;
}
</style>
