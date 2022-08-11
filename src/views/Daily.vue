<template>
  <div class="daily-box">
    <div class="l-box">
      <div class="search-sort">
        <el-input placeholder="请输入用户昵称或用户id" v-model="userName" clearable>
          <template #append>
            <el-select style="width: 120px" v-model="sortFlag" @change="changeSort">
              <el-option v-for="item in sortOptions" :key="item.label" :label="item.label" :value="item.value" />
            </el-select>
          </template>
        </el-input>
      </div>
      <el-scrollbar class="user-list" v-if="showUsers.length > 0" ref="scrollbarRef">
        <div
          class="user"
          :class="{ active: selectUserId === item.userId }"
          v-for="item in showUsers"
          :key="item.userId"
          @click="changeUser(item)"
        >
          <span class="user-name">{{ item.userName + '(' + item.userId + ')' }}</span>
          <el-link
            class="c-link"
            type="primary"
            target="_blank"
            :underline="false"
            :href="(item.lcus ? 'https://leetcode.com/u/' : 'https://leetcode.cn/u/') + item.userId"
            >力扣主页 {{ item.lcus ? '🇺🇸' : '🇨🇳' }}
          </el-link>
        </div>
      </el-scrollbar>
    </div>
    <div class="r-box" v-if="selectUserId && showUsers.length > 0" v-loading="loading">
      <div class="r-top">
        <h2>
          <span>{{ userArchivesData?.userName + '(' + userArchivesData?.userId + ')' }}的AC记录</span>
          <el-link style="margin-left: 20px" :href="userArchivesData?.homepage" type="primary" target="_blank"
            >力扣主页
          </el-link>
        </h2>
      </div>
      <div class="r-description">
        <span class="d-time">更新于: {{ formatUpdateAt }}</span>
        <question-difficulty />
      </div>
      <el-scrollbar class="r-scroll">
        <div v-for="(log, index) in userArchivesData?.logs" :key="index">
          <template v-if="new Date(log.date).getDay() === 0 || index === 0">
            <el-divider content-position="left">
              <span class="c-bold">{{ getWeekName(log.date) }}</span>
            </el-divider>
            <div class="table-head">
              <div class="row-item col-date">日期</div>
              <div class="row-item col-no">新题</div>
              <div class="row-item col-no">复习</div>
            </div>
          </template>
          <div class="table-row">
            <div class="row-item col-date">{{ log.date }}({{ getWeekDay(log.date) }})</div>
            <div class="row-item col-no col-question">
              ({{ log.questionIds ? log.questionIds.length : 0 }}):
              <span v-if="log.questionIds.length === 0">无</span>
              <question
                v-else
                v-for="questionId in getFrontendQuestionIds(log.questionIds.join(''))"
                :key="questionId"
                :question-id="questionId"
                :question="questionsMap[questionId]"
                :lcus="selectUser?.lcus"
              />
            </div>
            <div class="row-item col-no col-question">
              ({{ log.reviewQuestionIds ? log.reviewQuestionIds.length : 0 }}):
              <span v-if="log.reviewQuestionIds.length === 0">无</span>
              <question
                v-else
                v-for="questionId in getFrontendQuestionIds(log.reviewQuestionIds.join(''))"
                :key="questionId"
                :question-id="questionId"
                :question="questionsMap[questionId]"
                :lcus="selectUser?.lcus"
              />
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <el-empty class="emptyBox" description="暂无匹配的数据" v-if="showUsers.length === 0" />
  </div>
</template>

<script lang="ts" setup>
import debounce from 'lodash/debounce';
import { getWeekStartAndEnd, getFrontendQuestionIds } from '@/utils';
import type { IUser, IArchivesLog } from '@@/scripts/typings';
import type { ElScrollbar } from 'element-plus';
import useGlobalProperties from '@/hooks/useGlobalProperties';

// 所有题目集合
const questionsMap = useGlobalProperties().$quertionMap;

/** 所有用户列表 */
const showUsers = ref<IUser[]>([]);

/**页面中展示的用户列表 */
let allUsers: IUser[] = [];

/**当前选中的userId */
const selectUserId = ref('');
const selectUser = computed(() => {
  return allUsers.find((user) => user.userId === selectUserId.value);
});

/**当前某人的打卡记录 */
const userArchivesData = ref<IArchivesLog>();

// 格式化更新时间
const formatUpdateAt = computed(() => {
  return dayjs(userArchivesData.value?.updatedAt).format('YYYY-MM-DD hh:mm:ss');
});

/**根据用户昵称模糊搜索 */
const userName = ref('');

/** 是否在加载中 */
const loading = ref(false);

// region 排序逻辑
const sortOptions = [
  {
    label: '力扣ID顺序',
    value: 'lcId',
  },
  {
    label: '力扣ID倒序',
    value: 'lcIdDesc',
  },
];
const sortFlag = ref('lcId');
const changeSort = (value: string) => {
  // TODO: 别的排序方法
  showUsers.value.sort((a, b) => {
    const userIdA: string = a.userId;
    const userIdB: string = b.userId;
    const minLen: number = Math.min(userIdA.length, userIdB.length);
    for (let i = 0; i < minLen; i++) {
      const charA = userIdA.toLowerCase().charCodeAt(i);
      const charB = userIdB.toLowerCase().charCodeAt(i);
      if (charA === charB) continue;
      return value === 'lcId' ? charA - charB : charB - charA;
    }
    return 1;
  });
};
// endregion

const route = useRoute();
const router = useRouter();
watch(
  () => route.params.userId as string,
  (userId: string) => {
    if (userId) {
      selectUserId.value = userId;
    }
  },
);

const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>();

/** 获取所有的用户列表 */
const getUserList = async () => {
  try {
    const data: IUser[] = (await axios.get(`/data/common/user.json?v=${Date.now()}`)).data;
    // 初始根据力扣ID排序
    data.sort((a, b) => {
      const userIdA: string = a.userId;
      const userIdB: string = b.userId;
      const minLen: number = Math.min(userIdA.length, userIdB.length);
      for (let i = 0; i < minLen; i++) {
        const charA = userIdA.toLowerCase().charCodeAt(i);
        const charB = userIdB.toLowerCase().charCodeAt(i);
        if (charA === charB) continue;
        return charA - charB;
      }
      return 1;
    });
    showUsers.value = data;
    allUsers = data;
    if (data.length === 0) return;
    if (route.params.userId) {
      selectUserId.value = route.params.userId as string;
      const index = data.findIndex((user) => user.userId === selectUserId.value);
      if (index > -1) {
        await nextTick();
        scrollbarRef.value?.setScrollTop(40 * index);
      }
    } else {
      selectUserId.value = data[0].userId;
    }
  } catch (err) {
    ElMessage.error('获取记录失败');
  }
};
const CancelToken = axios.CancelToken;
let cancel: any = null;

/**获取某个人的打卡记录 */
const getUserSubmission = async () => {
  try {
    const data: IArchivesLog = (
      await axios.get(`/data/records/${selectUserId.value}.json?v=${Date.now()}`, {
        cancelToken: new CancelToken(function executor(c: any) {
          cancel = c;
        }),
      })
    ).data;
    loading.value = false;
    userArchivesData.value = data;
  } catch (err) {
    if (err instanceof AxiosError && err.code === 'ERR_CANCELED') return;
    ElMessage.error('获取记录失败');
  }
};

/**初始化用户列表 */
getUserList();

/** 切换用户 */
const changeUser = (item: IUser) => {
  if (item.userId != selectUserId.value) {
    loading.value = true;
    cancel?.();
    router.push(`/daily/${item.userId}`);
  }
};

/**模糊搜索 */
const search = debounce(
  () => {
    showUsers.value = allUsers.filter(
      (user: IUser) => user.userName.indexOf(userName.value) > -1 || user.userId.indexOf(userName.value) > -1,
    );
  },
  400,
  {
    leading: true,
  },
);

/**监听userName输入变化 */
watch(userName, (userName) => {
  if (!userName) {
    showUsers.value = allUsers;
    return;
  }
  search();
});

/**监听selectUserId变化 */
watch(selectUserId, () => {
  getUserSubmission();
});

/**获取周数标题 */
const getWeekName = (date: string) => {
  const dateList = getWeekStartAndEnd(date);
  // 判断本周属于哪个年度，以当前周四所在的年份为准
  const weekOfYear = new Date(dateList[3]).getFullYear();
  // 所在周数
  const weekNumber = dayjs(date).isoWeek();

  return `${weekOfYear}年第${weekNumber}周`;
};
// 获取某个日期是周几
const getWeekDay = (date: string) => {
  const dateList = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return dateList[new Date(date).getDay()];
};
</script>

<style scoped lang="scss">
.daily-box {
  display: flex;
  box-sizing: border-box;
  height: 100vh;
  padding: 0 0 16px;
  font-size: 14px;

  .l-box {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 500px;

    .search-sort {
      display: flex;
      justify-content: center;
      width: 90%;
      margin: 10px 0;
      padding-bottom: 10px;
    }

    .user-list {
      display: flex;
      flex-direction: column;
      width: 90%;
      height: calc(100vh - 50px);
      overflow-y: auto;

      .user {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        transition: all 0.3s;
        border-radius: 4px;
        cursor: pointer;

        &.active {
          background-color: rgb(64 158 255 / 10%);
          color: #409eff;
        }

        &:hover {
          background: rgb(46 50 56 / 5%);
        }

        .user-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .c-link {
          display: inline-flex;
          width: 85px;
        }
      }
    }
  }

  .r-box {
    display: flex;
    flex: 1;
    flex-direction: column;
    height: 100%;
    padding: 0 20px;

    .d-time {
      color: #666;
    }

    .r-description {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .r-scroll {
      flex: 1;
      overflow-y: auto;
    }

    .c-bold {
      font-size: 16px;
      font-weight: bold;
    }

    .table-head {
      display: flex;
      width: 98%;
      height: 50px;
      background-color: #f5f7fa;
    }

    .table-row {
      display: flex;
      width: 98%;
      min-height: 50px;
      transition: all 0.3s;

      &:hover {
        background-color: rgb(46 50 56 / 5%);
        cursor: text;
      }
    }

    .row-item {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      border: 1px solid #dcdfe6;
      text-align: center;
    }

    .col-question {
      display: block;
    }

    .col-date {
      flex: 20%;
    }

    .col-no {
      flex: 40%;
    }
  }
}
</style>
