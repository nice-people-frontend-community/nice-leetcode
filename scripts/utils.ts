import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

import type { AsyncResultArrayCallback } from 'async';

const dayjs = require('dayjs');
const isoWeekPlugin = require('dayjs/plugin/isoWeek');
const isBetween = require('dayjs/plugin/isBetween');
const lcusAllQuestionsMap = require('../data/common/lcus_all_questions_map.json');

dayjs.extend(isoWeekPlugin).extend(isBetween);

// 日期格式化方式
export const DATE_FORMAT_TEMPLATE = 'YYYY-MM-DD';

import type { IArchivesLog, IRecentACSubmissions, IRecentACSubmissionsResponse, IUser } from './typings';

/**
 * 获取今天的日期（已格式化）
 */
export const getToday: () => string = () => {
  return dayjs().format(DATE_FORMAT_TEMPLATE);
};

/**
 * 获取昨天的日期（已格式化）
 */
export const getYesterday: () => string = () => {
  return dayjs().subtract(1, 'day').format(DATE_FORMAT_TEMPLATE);
};

/**
 * 判断文件是否存在
 * @param {string} path 文件路径
 * @returns {Promise<boolean>} 是否存在
 */
export const isFileExists = async (path: string): Promise<boolean> => {
  return new Promise(function (resolve) {
    fs.stat(path, (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

/**
 * 查询近期的AC记录
 * @param user 用户信息
 * @returns
 */
export const lcQuery = async (user: IUser) => {
  const url = user.lcus ? 'https://leetcode.com/graphql/' : 'https://leetcode.cn/graphql/noj-go/';
  const graphqlQuery = user.lcus
    ? {
        query:
          '\n    query recentAcSubmissions($username: String!, $limit: Int!) {\n  recentAcSubmissionList(username: $username, limit: $limit) {\n    id\n    title\n    titleSlug\n    timestamp\n  }\n}\n    ',
        variables: { username: user.userId, limit: 50 },
      }
    : {
        query:
          '\n    query recentACSubmissions($userSlug: String!) {\n  recentACSubmissions(userSlug: $userSlug) {\n    submissionId\n    submitTime\n    question {\n      translatedTitle\n      titleSlug\n      questionFrontendId\n    }\n  }\n}\n    ',
        variables: { userSlug: user.userId },
      };
  const options = {
    //Method is post because we are requesting from graphql
    method: 'POST',
    url,
    headers: {},
    data: graphqlQuery,
  };

  const response = await axios.request<{
    code: number;
    data: IRecentACSubmissionsResponse;
  }>(options);

  // 抹平国服和美服的差异
  const { recentACSubmissions, recentAcSubmissionList } = response.data.data;
  const result: IRecentACSubmissions[] = [];

  if (user.lcus) {
    // 美服
    recentAcSubmissionList.forEach((el) => {
      result.push({
        // 从映射中获取美服问题的ID
        questionFrontendId: lcusAllQuestionsMap[el.titleSlug]?.questionId || el.titleSlug,
        titleSlug: el.titleSlug,
        submitTime: +el.timestamp * 1000,
      });
    });
  } else {
    // 国服
    recentACSubmissions.forEach((el) => {
      result.push({
        questionFrontendId: el.question.questionFrontendId,
        titleSlug: el.question.titleSlug,
        submitTime: el.submitTime * 1000,
      });
    });
  }

  return result;
};

/**
 * 获取用户某一天的的提交记录
 * @param userInfo 用户信息
 * @param date 统计哪一天的提交
 * @param callback mapLimit 并发队列的回调函数
 * @description 利用最近 15 道 AC 的题目的接口，过滤后获得结果，最好是统计最近1~2天
 */
export const getAcSubmissions = async (userInfo: IUser, date: string, callback?: AsyncResultArrayCallback<unknown>) => {
  const { userName, userId, lcus = false } = userInfo;
  const filePath = path.resolve(__dirname, `../archives/${userName}(${userId}).json`);
  // 检查是是否有用户的文件
  const exists = await isFileExists(filePath);
  if (!exists) {
    // 创建文件
    fs.writeFileSync(
      filePath,
      JSON.stringify({
        userName,
        userId,
        homepage: lcus ? `https://leetcode.com/u/${userId}/` : `https://leetcode.cn/u/${userId}/`,
        logs: [],
      }),
      {
        encoding: 'utf8',
      },
    );
  }

  try {
    const recentACSubmissions = await lcQuery(userInfo);

    const todayACQuestionIds = recentACSubmissions
      .filter((row) => dayjs(row.submitTime).format(DATE_FORMAT_TEMPLATE) === date)
      .map((row) => `[${row.questionFrontendId}]`);

    // 去重
    const uniqueQuestionIds = Array.from(new Set(todayACQuestionIds));

    // 读取 json 文件
    const archivesData: IArchivesLog = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    // 记录更新时间
    archivesData.updatedAt = dayjs().format();
    // 查找这一天所在周的
    const weekDateList = getWeekStartAndEnd(date);
    const currentWeekQuestionIds: string[] = [];

    archivesData.logs
      .filter((log) => dayjs(log.date).isBetween(weekDateList[0], date, '[)'))
      .forEach((el) => {
        currentWeekQuestionIds.push(...el.questionIds);
        currentWeekQuestionIds.push(...el.reviewQuestionIds);
      });
    // 当天的记录
    const targetLog = archivesData.logs.find((log) => log.date === date);

    // 新问题
    const questionIds: string[] = [];
    // 复习的问题
    const reviewIds: string[] = [];
    uniqueQuestionIds.forEach((questionId) => {
      // 判断是否是历史出现过的题目
      if (currentWeekQuestionIds.includes(questionId)) {
        reviewIds.push(questionId);
      } else if (!reviewIds.includes(questionId)) {
        // 避免已经出现在当天的复习题中的这种情况
        questionIds.push(questionId);
      }
    });

    if (!targetLog) {
      archivesData.logs.push({
        date,
        questionIds,
        reviewQuestionIds: reviewIds,
      });
    } else {
      // 保存时去重一次
      targetLog.questionIds = Array.from(new Set([...targetLog.questionIds, ...questionIds]));
      targetLog.reviewQuestionIds = Array.from(new Set([...(targetLog.reviewQuestionIds || []), ...reviewIds]));
    }

    // 针对日期排序，最近的日期在上面
    archivesData.logs.sort((a, b) => +new Date(b.date) - +new Date(a.date));

    fs.writeFileSync(filePath, JSON.stringify(archivesData), {
      encoding: 'utf8',
    });
  } catch (err: unknown) {
    console.error(`用户 [${userId}] 统计失败。可以手动前往用户主页查看 https://leetcode.cn/u/${userId}/`);
  } finally {
    console.log(`用户 [${userId}] --- ok`);
    callback && callback(null);
  }
};

/**
 * 获取某个日期所在ISO周的起止日期
 * @param {string} date YYYY-MM-DD
 * @returns 日期列表 [YYYY-MM-DD]
 */
export const getWeekStartAndEnd = (date: string) => {
  // 当前周的星期一
  const startDate = dayjs(date).startOf('isoWeek').format(DATE_FORMAT_TEMPLATE);

  const dateList: string[] = [];
  let index = 0;
  while (index < 7) {
    dateList.push(dayjs(startDate).add(index, 'day').format(DATE_FORMAT_TEMPLATE));
    index += 1;
  }

  return dateList;
};

/**
 * 获取某个日期所在的ISO周数
 * @param date 日期 YYYY-MM-DD
 * @returns
 */
export const getISOWeekNumber = (date: string) => dayjs(date).isoWeek();
