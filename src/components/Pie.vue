<template>
  <Chart :options="chartOptions" ref="chart" />
</template>

<script lang="ts">
import useGlobalProperties from '@/hooks/useGlobalProperties';
import { getFrontendQuestionIds } from '@/utils';
import type { QuestionMap } from '@@/scripts/typings';
import { Chart } from 'highcharts-vue';
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    questions: {
      type: String,
      default: () => {
        // 例如 [1][2][3][4]
        return '';
      },
      required: true,
    },
  },
  components: {
    Chart,
  },
  created() {
    // 所有题目集合
    this.questionsMap = useGlobalProperties().$quertionMap;
    this.updateChart();
  },
  methods: {
    updateChart() {
      const questionIds = getFrontendQuestionIds(this.questions);
      // 遍历题目，获取题目的难题程度
      let easyCount = 0;
      let mediumCount = 0;
      let hardCount = 0;
      let vipCount = 0;
      questionIds.forEach((id) => {
        const question = this.questionsMap[id];
        if (!question) {
          vipCount++;
        } else if (question.level === 1) {
          easyCount++;
        } else if (question.level === 2) {
          mediumCount++;
        } else if (question.level === 3) {
          hardCount++;
        }
      });

      this.chartOptions.series = [
        {
          name: '占比',
          data: [
            ['简单', easyCount],
            ['中等', mediumCount],
            ['困难', hardCount],
            ['VIP', vipCount],
          ],
        },
      ] as any;
    },
  },
  watch: {
    questions(newVals) {
      this.updateChart();
    },
  },
  data() {
    return {
      questionsMap: {} as QuestionMap,
      chartOptions: {
        chart: {
          height: 100,
          type: 'pie',
          margin: [0, 0, 0, 0],
          backgroundColor: 'transparent',
        },
        title: {
          text: null,
        },
        exporting: {
          enabled: false,
        },
        credits: {
          enabled: false,
        },
        tooltip: {
          useHTML: true,
          confine: true,
          outside: true,
          headerFormat: null,
          pointFormat: '{point.name}<br/>数量: <b>{point.y}<br/>占比: {point.percentage:.1f}%</b>',
        },
        plotOptions: {
          pie: {
            innerSize: 20,
            dataLabels: {
              enabled: false,
            },
            showInLegend: false,
          },
        },
        colors: ['#00af9b', '#ffb800', '#ff2d55', '#bfbfbf'],
        series: [],
      },
    };
  },
});
</script>

<style>
.highcharts-tooltip > span {
  width: 100px !important;
}
</style>
