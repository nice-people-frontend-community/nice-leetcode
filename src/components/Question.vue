<script lang="ts">
import type { IQuestion } from '@@/scripts/typings';
import type { PropType } from 'vue';

export default {
  props: {
    question: {
      type: Object as PropType<IQuestion>,
      required: true,
      default: () => ({
        frontend_question_id: '',
        question__title_slug: '',
      }),
    },
    lcus: {
      type: Boolean,
      required: true,
    },
  },
};
</script>

<template>
  <el-link
    type="primary"
    target="_blank"
    :underline="false"
    :href="(lcus ? 'https://leetcode.com/problems/' : 'https://leetcode.cn/problems/') + question.question__title_slug"
  >
    [{{ lcus ? question?.question__title_slug : question?.frontend_question_id }}]
  </el-link>
</template>
