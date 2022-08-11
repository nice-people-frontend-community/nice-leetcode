<script lang="ts" setup>
import { ref } from 'vue';

type Level = { label: string; className: string };

const difficultyLevel = ref<Array<Level>>([
  { label: '简单', className: 'easy' },
  { label: '中等', className: 'medium' },
  { label: '困难', className: 'hard' },
  { label: 'VIP', className: 'vip' },
]);
</script>

<template>
  <div class="legend">
    <el-tag
      v-for="item in difficultyLevel"
      :key="item.label"
      :class="{ [item.className]: true, tag: true }"
      effect="plain"
      round
    >
      {{ item.label }}
    </el-tag>
  </div>
</template>

<style lang="scss" scoped>
.legend {
  margin-right: 20px;

  .tag {
    margin-left: 6px;
    border: none;
    color: #fff;
  }

  .easy {
    background-color: var(--q-easy-color);
  }

  .medium {
    background-color: var(--q-medium-color);
  }

  .hard {
    background-color: var(--q-hard-color);
  }

  .vip {
    background-color: #bfbfbf;
  }
}
</style>
