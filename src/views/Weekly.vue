<template>
  <div class="weekly">
    <rule-alert />
    <div class="control-wrap">
      <el-button id="copy-table-btn" @click="copyTable" size="small" type="primary" plain>复制表格</el-button>
      <el-button @click="takePicture" size="small" type="primary" plain>另存图片</el-button>
      <el-button @click="showOrHideLazyMan" size="small" type="primary" plain>
        {{ isShowLazyMan ? '隐藏懒人' : '显示懒人' }}
      </el-button>
    </div>
    <div class="markdown-body" ref="weeklyTableRef">
      <h1>{{ weekRollupFileName }}周报</h1>
      <blockquote style="display: flex; align-content: center; justify-content: space-between">
        更新于: {{ time }}

        <div class="action">
          <question-difficulty />
          <el-select v-model="currentWeek" class="m-2" placeholder="选择周" size="small">
            <el-option v-for="item in weekLabel" :key="item?.value" :label="item?.label" :value="item?.value || 0" />
          </el-select>
        </div>
      </blockquote>
      <el-skeleton :rows="5" animated :loading="loading">
        <el-table
          :data="weeklyData.records.filter((i) => isShowLazyMan || i?.newQuestionsTotal !== 0)"
          :row-class-name="tableRowClassName"
          :border="true"
          style="width: 100%"
        >
          <template v-for="{ key, label, width, dateIndex } in columnData.data" :key="key">
            <!-- 用户名称 -->
            <el-table-column v-if="key === 'userName'" :label="label" :width="width" :resizable="false">
              <template #default="scope">
                <div>{{ scope.row.userName }}</div>
                <el-link :href="scope.row.homepage" :underline="false" target="_blank" type="primary">{{
                  scope.row.userId
                }}</el-link>
              </template>
            </el-table-column>
            <!-- 统计 -->
            <el-table-column
              v-else-if="key === 'stats'"
              :label="label"
              :prop="key"
              :width="width"
              :resizable="false"
              align="center"
            >
              <template #default="scope">
                <pie :questions="scope.row.weekly.join('')" />
              </template>
            </el-table-column>
            <!-- 操作 -->
            <el-table-column
              v-else-if="key === 'newQuestionsTotal' || key === 'ranking'"
              :label="label"
              :prop="key"
              :width="width"
              :resizable="false"
              align="center"
            />
            <!-- 题目 -->
            <el-table-column
              v-else
              :label="label"
              :prop="key"
              :width="width"
              :resizable="false"
              header-align="center"
              align="left"
            >
              <template #default="scope">
                <template v-for="id in getFrontendQuestionIds(scope.row.weekly[dateIndex!])" :key="id">
                  <question
                    :question-id="id"
                    :question="questionsMap[id]"
                    :lcus="scope.row.homepage.includes('leetcode.com')"
                  />
                </template>
              </template>
            </el-table-column>
          </template>
        </el-table>
      </el-skeleton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import useGlobalProperties from '@/hooks/useGlobalProperties';
import { DATE_FORMAT_STRING, getFrontendQuestionIds, getISOWeekNumber, getToday, getWeekStartAndEnd } from '@/utils';
import clipboardJs from 'clipboard';
import domToImage from 'dom-to-image';

interface PersonRecord {
  userId: string;
  userName: string;
  homepage: string;
  ranking: number;
  newQuestionsTotal: number;
  weekly: string[];
}

interface WeeklyData {
  title?: string;
  updatedAt?: string;
  weekly?: string[];
  records: (PersonRecord | null)[];
}
interface Column {
  label: string;
  key: string;
  /** 对应日期的序号 */
  dateIndex?: number;
  width?: number;
}
interface WeekLabel {
  label: string;
  value: number;
}

const columnTemplate: Column[] = [
  {
    label: '用户名',
    key: 'userName',
  },
];

const isShowLazyMan = ref(true);
const loading = ref(true);

const currentWeek = ref(0);
const queryDate = ref(getToday());

watch(currentWeek, () => {
  initData();
});

// 判断本周属于哪个年度，以当前周四所在的年份为准
// 周汇总的文件名称
const weekRollupFileName = ref('');
const updateWeekRollupFileName = () => {
  // 获取当前日期
  // 当前日所在的ISO周数
  const dateList = getWeekStartAndEnd(queryDate.value);
  weekRollupFileName.value = `${new Date(dateList[3]).getFullYear()}年第${getISOWeekNumber(queryDate.value)}周(${
    dateList[0]
  }_${dateList[dateList.length - 1]})`;
};
updateWeekRollupFileName();

const weeklyData: WeeklyData = reactive({ records: [] } as WeeklyData);
// 所有题目集合
const questionsMap = useGlobalProperties().$quertionMap;

const showOrHideLazyMan = () => (isShowLazyMan.value = !isShowLazyMan.value);

const time = ref('');

const columnData: { data: Column[] } = reactive({ data: [] });

const weeklyTableRef = ref();

const initData = async () => {
  queryDate.value = getToday(DATE_FORMAT_STRING, currentWeek.value);
  updateWeekRollupFileName();
  loading.value = true;
  axios
    .get<WeeklyData>(`/data/weeks/${weekRollupFileName.value}.json?v=${+new Date()}`)
    .then(({ data: res }) => {
      Object.assign(weeklyData, res);
      const day = dayjs(weeklyData.updatedAt);
      time.value = dayjs(weeklyData.updatedAt).format('YYYY-MM-DD HH:mm:ss');
      columnData.data = columnTemplate.slice(0);

      const dateColumn = weeklyData.weekly?.map((date, index) => ({ label: date, key: date, dateIndex: index })) ?? [];

      columnData.data = [
        {
          label: '用户名',
          key: 'userName',
        },
        ...dateColumn,
        {
          label: '统计',
          key: 'stats',
          width: 100,
        },
        {
          label: '总计',
          key: 'newQuestionsTotal',
          width: 60,
        },
        {
          label: '排名',
          key: 'ranking',
          width: 60,
        },
      ];

      if (day.day() === 0 && day.hour() === 22 ? day.minute() >= 50 : day.hour() > 22) {
        buildSendMessage();
      }
    })
    .catch(() => {
      weeklyData.records = [];
      weeklyData.weekly = [];
      columnData.data = columnTemplate.slice(0);
    })
    .finally(() => {
      loading.value = false;
    });
};
initData();

function getLastDayOfYear(year: number) {
  return dayjs().set('year', year).endOf('year').format(DATE_FORMAT_STRING);
}

const weekControl = () => {
  const weeksLabel: (WeekLabel | null)[] = [];
  const startYear = 2022;
  const currentYear = new Date().getFullYear();
  let year = currentYear,
    howManyWeeksHavePassed = 0;
  while (year >= startYear) {
    for (
      let i = getISOWeekNumber(year !== currentYear ? getLastDayOfYear(year) : queryDate.value);
      i >= (year === startYear ? 19 : 1);
      i--
    ) {
      weeksLabel.push({
        label: `${year}年${i}周`,
        value: howManyWeeksHavePassed--,
      });
    }
    year--;
  }
  return weeksLabel;
};

const weekLabel = weekControl();

const tableRowClassName = ({ row }: { row: PersonRecord }) => {
  if (row.ranking <= 5) {
    return `row_top--${row.ranking}`;
  } else if (row.newQuestionsTotal === 0) {
    return 'row_lazy';
  }
  return '';
};

const copyTable = () => {
  if (!weeklyTableRef.value) return;
  const clipboard = new clipboardJs('#copy-table-btn', {
    target: () => weeklyTableRef.value,
  });
  clipboard.on('success', function (e) {
    e.clearSelection();
    ElMessage.success('复制成功');
  });
  clipboard.on('error', function () {
    ElMessage.success('复制失败');
  });
};

const takePicture = () => {
  if (!weeklyTableRef.value) return;
  domToImage
    .toPng(weeklyTableRef.value, {
      style: {
        background: '#fff',
      },
    })
    .then((dataUrl: string) => {
      const link = document.createElement('a');
      link.download = `${weekRollupFileName.value}.png`;
      link.href = dataUrl;
      link.click();
    });
};

function buildSendMessage() {
  const persons = [];
  // Top5 的总人数
  let top5UserTotal = 0;

  interface top {
    users: (string | null | undefined)[];
    questionCount: number;
  }

  const top5: top[] = new Array(5).fill(0).map(() => ({
    users: [],
    questionCount: 0,
  }));
  if (!weeklyData.records?.length) return;
  for (let i = 0; i < weeklyData.records.length; i++) {
    const record = weeklyData.records[i];
    const userName = record?.userName;
    const day1 = getFrontendQuestionIds(record?.weekly?.[0]).length;
    const day2 = getFrontendQuestionIds(record?.weekly?.[1]).length;
    const day3 = getFrontendQuestionIds(record?.weekly?.[2]).length;
    const day4 = getFrontendQuestionIds(record?.weekly?.[3]).length;
    const day5 = getFrontendQuestionIds(record?.weekly?.[4]).length;
    const day6 = getFrontendQuestionIds(record?.weekly?.[5]).length;
    const day7 = getFrontendQuestionIds(record?.weekly?.[6]).length;
    const questionCount = record?.newQuestionsTotal || 0;
    const ranking = record?.ranking;

    const fullAttendance = !!day1 && !!day2 && !!day3 && !!day4 && !!day5 && !!day6 && !!day7;
    if (questionCount >= 14 || fullAttendance) {
      persons.push({
        userName,
        questionCount,
        ranking,
      });
    }

    // 记录top5人员
    if (ranking && ranking <= 5) {
      top5UserTotal += 1;
      top5[ranking - 1] = {
        users: [...top5[ranking - 1].users, userName],
        questionCount,
      };
    }
  }
  let atMessage = `中国好青年「刷题榜」${getToday(' MM 月 DD 日')}`;
  atMessage += '\n\n';
  atMessage += persons.map((el) => `@${el.userName} `).join('');
  atMessage += '\n\n';
  atMessage += `本周全勤或刷题大于等于 14 题的共有上述 ${persons.length} 位同学，恭喜以上同学获取小星星奖励，大家越来越努力了呀！[庆祝][庆祝][庆祝]`;

  atMessage += '\n\n';
  atMessage += `其中，本周 Top5 的一共有 ${top5UserTotal} 位同学，他们分别是：\n`;
  const rankingString = ['一', '二', '三', '四', '五'];
  for (let i = 0; i < top5.length; i++) {
    const row = top5[i];
    const ranking = rankingString[i];
    if (row.users.length > 1) {
      atMessage += `第${ranking}名的有 ${row.users.length} 位同学，分别是 ${row.users
        .map((user) => `@${user}`)
        .join('、')}，以 ${row.questionCount} 道题并列第${ranking}名`;
    } else {
      atMessage += `第${ranking}名的是 @${row.users[0]} 同学，刷题 ${row.questionCount} 道`;
    }
    atMessage += i === top5.length - 1 ? '。' : ';\n';
  }

  atMessage += '\n\n努力的人总会被眷顾，祝我们都有美好的未来。[愉快]';
  console.log(atMessage);
}
</script>

<style lang="scss" scoped>
.weekly {
  width: 90%;
  margin: 1em auto;
  text-align: left;
}

.control-wrap {
  display: flex;
  position: fixed;
  z-index: 10001;
  top: 50%;
  right: 10px;
  flex-flow: column nowrap;
  justify-content: flex-start;
  padding: 10px 5px;
  transform: translate(0, -50%);
  border-radius: 5px;
  background: #fff;
  box-shadow: 1px 0 8px 0 #e6e6e6;
  text-align: center;
}

.markdown-body {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  width: 100%;

  h1 {
    margin: 0;
    padding-bottom: 0.3em;
    border-bottom: 1px solid #eaecef;
    white-space: nowrap;
  }
}

blockquote {
  box-sizing: border-box;
  width: 100%;
  margin: 1em 0;
  padding: 0 1em;
  border-left: 0.25em solid #dfe2e5;
  color: #6a737d;
}

.el-button {
  margin: 0.5em 0 !important;
}

.action {
  display: flex;
}
</style>
