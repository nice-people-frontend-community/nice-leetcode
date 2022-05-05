require('dotenv').config();
import * as asyncLib from 'async';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import {
  IArchivesLog,
  IGraphqlQuery,
  IRecentACSubmissions,
  IUser,
} from './typings';

const users = require('../dict/user.json');
const dayjs = require('dayjs');
// 日期格式化方式
const DATE_FORMAT_STRING = 'YYYY-MM-DD';
// 当天日期
const today = dayjs().format(DATE_FORMAT_STRING);

/**
 * 判断文件是否存在
 * @param {string} path 文件路径
 * @returns {Promise<boolean>} 是否存在
 */
const isFileExists = async (path: string): Promise<boolean> => {
  return new Promise(function (resolve, reject) {
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
 * Axios请求
 * @param {Object} graphqlQuery
 * @returns
 */
const lcQuery = async (graphqlQuery: IGraphqlQuery) => {
  const options = {
    //Method is post because we are requesting from graphql
    method: 'POST',
    url: 'https://leetcode-cn.com/graphql/noj-go/',
    headers: {
      'x-csrftoken': process.env.CSRFTOKEN as string,
    },
    data: graphqlQuery,
  };

  try {
    return await axios.request<{
      code: number;
      data: IRecentACSubmissions;
    }>(options);
  } catch (err) {
    throw err;
  }
};

/**
 * 获取用户昨天的的提交记录
 * @param userInfo 用户信息
 * @param date 统计哪一天的提交
 * @description 利用最近 15 道 AC 的题目的接口，过滤后获得结果，最好是统计最近1~2天
 */
const getUserTodayAcSubmissions = async (
  userInfo: IUser,
  callback: asyncLib.AsyncResultArrayCallback<any>,
  date: string = today
) => {
  const { userName, userId } = userInfo;
  const filePath = path.resolve(
    __dirname,
    `../archives/${userName}(${userId}).json`
  );
  // 检查是是否有用户的文件
  const exists = await isFileExists(filePath);
  if (!exists) {
    // 创建文件
    fs.writeFileSync(
      filePath,
      JSON.stringify({
        userName,
        userId,
        homepage: `https://leetcode-cn.com/u/${userId}/`,
        logs: [],
      }),
      {
        encoding: 'utf8',
      }
    );
  }

  try {
    const response = await lcQuery({
      query:
        '\n    query recentACSubmissions($userSlug: String!) {\n  recentACSubmissions(userSlug: $userSlug) {\n    submissionId\n    submitTime\n    question {\n      translatedTitle\n      titleSlug\n      questionFrontendId\n    }\n  }\n}\n    ',
      variables: { userSlug: userId },
    });

    const { recentACSubmissions = [] } = response.data.data;
    const todayACQuestionIds = recentACSubmissions
      .filter(
        (row) =>
          dayjs(row.submitTime * 1000).format(DATE_FORMAT_STRING) === date
      )
      .map((row) => `[${row.question.questionFrontendId}]`);

    // 去重
    const uniqeQuestionIds = Array.from(new Set(todayACQuestionIds));

    // 读取 json 文件
    const archivesData: IArchivesLog = JSON.parse(
      fs.readFileSync(filePath, 'utf8')
    );
    // 记录更新时间
    archivesData.updatedAt = dayjs().format();
    // 更新题号
    const target = archivesData.logs.find((log) => log.date === date);
    if (target) {
      // 判断问题是否已经记录
      uniqeQuestionIds.forEach((questionId) => {
        if (!target.questionIds.includes(questionId)) {
          target.questionIds.push(questionId);
        }
      });
    } else {
      archivesData.logs.push({
        date,
        questionIds: uniqeQuestionIds,
      });
    }

    // 针对日期排序，最近的日期在上面
    archivesData.logs.sort((a, b) => +new Date(b.date) - +new Date(a.date));

    // 如果为空，有2种可能，
    // 1是确实是没有提交题目
    // 2是设置了隐保护，需要去 [通知与隐私 - 隐私设置 - 显示我的提交记录] 开启
    fs.writeFileSync(filePath, JSON.stringify(archivesData), {
      encoding: 'utf8',
    });
  } catch (err: any) {
    console.log(err.message);
    fs.appendFileSync(
      filePath,
      `\n\n## ${today}\n统计失败。可以手动前往用户主页查看 https://leetcode-cn.com/u/${userId}/`
    );
  } finally {
    console.log(`用户 [${userId}] --- ok`);
    callback(null);
  }
};

asyncLib.mapLimit<IUser, any, any>(
  users,
  5,
  async function (userInfo, callback) {
    await getUserTodayAcSubmissions(userInfo, callback);
  },
  (err, results) => {
    if (err) throw err;
    console.log('全部处理完成^_^');
  }
);
