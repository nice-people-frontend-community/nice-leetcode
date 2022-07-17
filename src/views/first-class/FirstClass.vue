<template>
  <div class="first-class-container">
    <rule-alert
      title="头等舱乘客名单~"
      description="离群航班会在每月一号启航，登机客户为上个月不曾打卡的同学，离群后可再次申请入群。由于日报存在一小时的更新延迟，所以航班名单也存在误差。"
    ></rule-alert>

    <el-card class="first-class-card">
      <template #header>
        <div class="card-header">
          <h2>头等舱航班</h2>
        </div>
      </template>

      <el-row>
        <el-date-picker
          v-model="selectedMonth"
          type="month"
          format="YYYY-MM"
          value-format="YYYY-MM"
          :clearable="false"
          :editable="false"
          :disabled-date="disabledDate"
          placeholder="请选择月份"
          style="margin-bottom: 10px"
        >
        </el-date-picker>
        <el-button type="primary" plain style="margin-left: 10px" @click="reload">清除缓存</el-button>
      </el-row>
      <!-- 运行状态提示文案 -->
      <div style="color: #999">{{ runStatus }}</div>

      <el-divider></el-divider>
      <el-row v-for="user in firstClassStudents.data" :key="user.userId">
        <el-link type="info" target="_blank" :href="getUserHomepage(user)"
          >{{ user.userName }} {{ user.lcus ? '🇺🇸' : '🇨🇳' }}
        </el-link>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import useFirstClass from './useFirstClass';
import type { IArchivesLog, IUser, IUserList } from '@@/scripts/typings';
import { getUserHomepage } from '@/utils';

type TUserSubmit = Record<string, IArchivesLog>;
// constant 区域
/** 用户提交 */
const LOCAL_CACHE_KEY = 'user_summission';
/** 用户提交时间 */
const LOCAL_CACHE_TIME_KEY = 'user_summission_time';
/** 当前月份 */
const currentMonth = dayjs().format('YYYY-MM');
/** 用户选择的月份 */
const selectedMonth = ref(currentMonth);
/** 禁用时间段 */
const disabledDate = (time: string) => {
  return dayjs(time).isBefore(dayjs('2022-05-01')) || dayjs(time).isAfter(dayjs(currentMonth));
};
/** 计算本地浏览器缓存 */
let initUserSubmission: TUserSubmit = {};
/** 需要进行缓存 */
const needCache = ref(true);
/** 从浏览器中获取缓存 */
const localUserSubmission = useLocalStorage(LOCAL_CACHE_KEY, '{}');
const cacheime = useLocalStorage(LOCAL_CACHE_TIME_KEY, '');
if (cacheime && localUserSubmission) {
  if (useFirstClass().checkCacheTimeExpired(cacheime.value)) {
    // 超出半个小时的缓存了，直接清空
    cacheime.value = '';
    localUserSubmission.value = '';
    needCache.value = true;
  } else {
    initUserSubmission = {};
    needCache.value = false;
  }
}
/** 用户日报的缓存 */
// 使用未过期的localstorage来初始化
const userSubmissionCacheMap = reactive<TUserSubmit>(initUserSubmission);
/** 所有用户列表 */
const allUsers: IUserList = reactive({ data: [] });
/** 初始化用户数据请求json */
const initUserData = async () => {
  const res = await axios.get<IUser[]>(`/data/common/user.json?v=${+new Date()}`);
  allUsers.data = res.data;
  computeFirstClass();
};
initUserData();
/** 头等舱用户列表 */
const firstClassStudents: IUserList = { data: [] };
/** 运行状态 */
const runStatus = ref('');
/** 获取用户的提交记录 */
const getUserSubmission = async (user: IUser) => {
  const filePath = `/data/records/${user.userName}(${user.userId}).json?v=${+new Date()}`;
  try {
    const { data } = await axios.get<IArchivesLog>(filePath);
    /** 设置用户提交信息到缓存map */
    userSubmissionCacheMap[user.userId] = data;
    return data;
  } catch (err) {
    console.log(`获取 【${user.userName}】 记录失败`, err);
    return false;
  }
};
/** 计算头等舱用户 */
const computeFirstClass = async () => {
  firstClassStudents.data = [];
  runStatus.value = `执行中...${needCache ? '首次执行时间可能在1分钟左右...' : ''}`;
  // 开始计算需要登录头等舱的同学
  for (let index = 0; index < allUsers.data?.length; index++) {
    const userInfo = allUsers.data[index];
    const { userId } = userInfo;
    // 先从cache里获取；如果取不到就去请求
    const userSubmission = userSubmissionCacheMap[userId] || (await getUserSubmission(userInfo));
    // 获取选中月份的
    if (!userSubmission) {
      continue;
    }
    const monthLogs = userSubmission.logs.filter((row) => row.date.includes(selectedMonth.value));
    // 满足条件，添加
    if (monthLogs.every((row) => (row.questionIds || []).length === 0 && (row.reviewQuestionIds || 0).length === 0)) {
      firstClassStudents.data.push(userInfo);
    }
  }
  // 浏览器缓存
  if (needCache.value) {
    localUserSubmission.value = JSON.stringify(userSubmissionCacheMap);
    cacheime.value = new Date().toString();
  }
  runStatus.value = '执行完成';
};
/** 清除缓存 */
const reload = () => {
  localUserSubmission.value = '{}';
  cacheime.value = '';
  window.location.reload();
};
</script>

<style scoped lang="scss">
.first-class {
  &-container {
    * {
      margin: 0;
    }

    margin: 10px;
  }

  &-card {
    margin-top: 10px;
  }
}
</style>
