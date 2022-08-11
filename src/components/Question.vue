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
    questionId: {
      type: String,
      required: true,
    },
    lcus: {
      type: Boolean,
      required: true,
    },
  },
};
</script>

<template>
  <a
    v-if="question.frontend_question_id"
    :class="{ link: true, easy: question.level === 1, medium: question.level === 2, hard: question.level === 3 }"
    type="primary"
    target="_blank"
    :underline="false"
    :href="'https://leetcode.cn/problems/' + question.question__title_slug"
  >
    [{{ lcus ? question?.question__title_slug : question?.frontend_question_id }}]
  </a>
  <span v-else>[{{ questionId }}]</span>
</template>

<style scoped>
.link {
  color: #409eff;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.easy {
  color: var(--q-easy-color);
}

.medium {
  color: var(--q-medium-color);
}

.hard {
  color: var(--q-hard-color);
}
</style>
