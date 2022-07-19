<template>
  <div class="daily-box">
    <div class="l-box">
      <el-input class="c-input" placeholder="请输入用户昵称" v-model="userName" clearable></el-input>
      <el-scrollbar class="user-list" v-if="showUsers.length > 0">
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
      <span class="d-time">更新于: {{ userArchivesData?.updatedAt }}</span>
      <el-scrollbar class="r-scroll">
        <div v-for="(log, index) in userArchivesData?.logs" :key="index">
          <el-divider content-position="left" v-if="new Date(log.date).getDay() === 0 || index === 0"
            ><span class="c-bold">{{ getWeekName(log.date) }}</span>
          </el-divider>
          <p>## {{ log.date }}({{ getWeekDay(log.date) }})</p>
          <p>新题({{ log.questionIds.length }}): {{ log.questionIds.length > 0 ? log.questionIds.join('') : '无' }}</p>
          <p>
            复习({{ log.reviewQuestionIds ? log.reviewQuestionIds.length : 0 }}):
            {{ log.reviewQuestionIds && log.reviewQuestionIds.length > 0 ? log.reviewQuestionIds.join('') : '无' }}
          </p>
        </div>
      </el-scrollbar>
    </div>

    <el-empty class="emptyBox" description="暂无匹配的数据" v-if="showUsers.length === 0" />
  </div>
</template>

<script lang="ts" setup>
import debounce from 'lodash/debounce';
import { getWeekStartAndEnd } from '@/utils';
import type { IUser, IArchivesLog } from '@@/scripts/typings';

/** 所有用户列表 */
const showUsers = ref<IUser[]>([]);

/**页面中展示的用户列表 */
let allUsers: IUser[] = [];

/**当前选中的userId */
const selectUserId = ref('');

const selectUserName = ref('');

/**当前某人的打卡记录 */
const userArchivesData = ref<IArchivesLog>();

/**根据用户昵称模糊搜索 */
const userName = ref('');

/** 是否在加载中 */
const loading = ref(false);

/** 获取所有的用户列表 */
const getUserList = async () => {
  try {
    const data: IUser[] = (await axios.get(`/data/common/user.json?v=${Date.now()}`)).data;
    showUsers.value = data;
    allUsers = data;
    if (data.length > 0) {
      selectUserId.value = data[0].userId;
      selectUserName.value = data[0].userName;
    }
  } catch (err) {
    ElMessage.error('获取记录失败');
  }
};

/**获取某个人的打卡记录 */
const getUserSubmission = async () => {
  try {
    const data: IArchivesLog = (await axios.get(`/data/records/${selectUserId.value}.json?v=${Date.now()}`)).data;
    loading.value = false;
    userArchivesData.value = data;
  } catch (err) {
    ElMessage.error('获取记录失败');
  }
};

/**初始化用户列表 */
getUserList();

/** 切换用户 */
const changeUser = (item: IUser) => {
  loading.value = true;
  selectUserId.value = item.userId;
  selectUserName.value = item.userName;
};

/**模糊搜索 */
const search = debounce(() => {
  showUsers.value = allUsers.filter(
    (user: IUser) => user.userName.indexOf(userName.value) > -1 || user.userId.indexOf(userName.value) > -1,
  );
}, 1000);

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
  const datelist = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return datelist[new Date(date).getDay()];
};
</script>

<style scoped lang="scss">
.daily-box {
  display: flex;
  height: 100vh;
  font-size: 14px;

  .l-box {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 40%;

    .c-input {
      width: 80%;
      margin: 10px 0;
    }

    .user-list {
      display: flex;
      flex-direction: column;
      width: 80%;
      height: calc(100vh - 50px);
      overflow-y: auto;

      .user {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        border-radius: 4px;
        cursor: pointer;

        &.active {
          background-color: rgb(64 158 255 / 10%);
          color: #409eff;
        }

        .user-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .c-link {
          display: inline-flex;
          width: 80px;
        }
      }
    }
  }

  .r-box {
    display: flex;
    flex: 1;
    flex-direction: column;
    height: 100vh;
    padding: 0 20px;

    .d-time {
      color: #666;
    }

    .r-scroll {
      flex: 1;
      overflow-y: auto;
    }

    .c-bold {
      font-size: 16px;
      font-weight: bold;
    }
  }
}
</style>
