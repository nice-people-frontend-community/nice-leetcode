<template>
  <div class="first-class-container">
    <a class="fixed-widget" :href="context + '/docs'" target="_blank"> 日报 </a>

    <el-alert
      class="first-class-alert"
      title="头等舱乘客名单~"
      description="离群航班会在每月一号启航，登机客户为上个月不曾打卡的同学，离群后可再次申请入群。由于日报存在一小时的更新延迟，所以航班名单也存在误差。"
      type="error"
      :closable="false"
      style="position: sticky; z-index: 999; top: 0; margin-bottom: 10px"
    >
    </el-alert>

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
      <!-- TODO: -->
      <!-- <div style="color: #999">{{ runStatus }}</div> -->

      <el-divider></el-divider>
    </el-card>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import dayjs from 'dayjs';
import { useLocalStorage } from '@vueuse/core';

/** 用户提交数据 */
interface userSubmitRecord {
  homepage: string;
  logs: any[];
  updatedAt: string;
  userId: string;
  userName: string;
}

type TUserSubmit = Record<string, userSubmitRecord>;

// constant 区域
/** 用户提交 */
const LOCAL_CACHE_KEY = 'user_summission';
/** 用户提交时间 */
const LOCAL_CACHE_TIME_KEY = 'user_summission_time';
/** 时间格式 */
const DATE_FORMAT_STRING = 'YYYY-MM-DD';

/** 当前月份 */
const currentMonth = dayjs().format('YYYY-MM');
/** 用户选择的月份 */
const selectedMonth = ref(currentMonth);

const context = window.location.hostname.includes('github.io') ? '/nice-leetcode' : '';

/** 禁用时间段 */
const disabledDate = (time: string) => {
  return dayjs(time).isBefore(dayjs('2022-05-01')) || dayjs(time).isAfter(dayjs(currentMonth));
};

/** 计算本地浏览器缓存 */
let initUserSubmission: TUserSubmit = {};
/** 需要进行缓存 */
const needCache = ref(true);

// const cacheime = localStorage.getItem(LOCAL_CACHE_TIME_KEY);
// const localUserSubmission = localStorage.getItem(LOCAL_CACHE_KEY);
/** 从浏览器中获取缓存 */
const cacheime = useLocalStorage(LOCAL_CACHE_TIME_KEY, '');
const localUserSubmission = useLocalStorage(LOCAL_CACHE_KEY, '{}');

if (cacheime && localUserSubmission) {
  if (dayjs(cacheime.value).isBefore(dayjs().add(-30, 'm'))) {
    // 超出半个小时的缓存了，直接清空
    // localStorage.removeItem(LOCAL_CACHE_TIME_KEY);
    // localStorage.removeItem(LOCAL_CACHE_KEY);
    cacheime.value = '';
    // localUserSubmission.value = JSON.stringify({});
    localUserSubmission.value = '';
    needCache.value = true;
  } else {
    initUserSubmission = {};
    needCache.value = false;
  }
}

/** 用户日报的缓存 */
const userSubmissionCacheMap = reactive<TUserSubmit>(initUserSubmission);

const reload = () => {
  // localStorage.removeItem(LOCAL_CACHE_TIME_KEY);
  // localStorage.removeItem(LOCAL_CACHE_KEY);
  // userSubmissionCacheMap = {};
  // window.location.reload();
};
</script>

<style scoped lang="scss">
.first-class-container {
  * {
    margin: 0;
  }

  .fixed-widget {
    display: flex;
    position: fixed;
    right: 20px;
    bottom: 50px;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    transition: color 0.3s;
    transition: transform ease 500ms;
    border: 1px solid #00bcd4;
    border-radius: 50%;
    background-color: #00bcd4;
    box-shadow: 0 3px 6px -4px #0000001f, 0 6px 16px #00000014, 0 9px 28px 8px #0000000d;
    color: #fff;
    text-align: center;
    text-decoration: none;

    &:hover {
      transform: scale(1.3);
    }
  }

  .first-class-alert {
    position: sticky;
    z-index: 999;
    top: 0;
    margin-bottom: 10px;
  }

  margin: 10px;
}
</style>
