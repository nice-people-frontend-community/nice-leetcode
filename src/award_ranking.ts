import * as fs from 'fs';
import * as path from 'path';
import { IArchivesLog, IAwardRanking } from './typings';
import {
  DATE_FORMAT_STRING,
  getISOWeekNumber,
  getWeekStartAndEnd,
} from './utils';
const users = require('../dict/user.json');
const dayjs = require('dayjs');

// 当天日期
const now = dayjs();
const today = now.format(DATE_FORMAT_STRING);
const yesterday = now.subtract(1, 'day').format(DATE_FORMAT_STRING);
// 由于 GitHub Actions 定时器启动不准，这里做下兼容处理
// 定时器不会延迟太久，所以这里仅判断跨天的的即可
// 如果启动时间在周一凌晨 1 点以内的话，就汇总上周的记录
let queryDate = today;
if (new Date(now).getDay() === 1 && new Date(now).getHours() < 1) {
  queryDate = yesterday;
}
// 当前日所在的ISO周数
const curISOWeekNumber = getISOWeekNumber(queryDate);
const dateList = getWeekStartAndEnd(queryDate);

const awardRankingFilePath = path.resolve(
  __dirname,
  `../dict/award-ranking.json`
);

// TODO: 自动计算总排名，刷新 dict/award-ranking.json
export const awardRanking = () => {
  const awardRankingData: IAwardRanking[] = JSON.parse(
    fs.readFileSync(awardRankingFilePath, 'utf8')
  );

  const checkUsers = [];

  for (let i = 0; i < users.length; i++) {
    const { userName, userId, hideInWeek = false } = users[i];
    // 跳过周报屏蔽的同学
    if (hideInWeek) {
      continue;
    }
    const archiveFilePath = path.resolve(
      __dirname,
      `../archives/${userName}(${userId}).json`
    );

    const userArchivesData: IArchivesLog = fs.existsSync(archiveFilePath)
      ? JSON.parse(fs.readFileSync(archiveFilePath, 'utf8'))
      : {
          // 大概率不会有找不到用户文件的情况
          // 这里只是简单的保护一下
          userId,
          userName,
        };
    // 读取本周的数据
    const curWeekLogs = (userArchivesData.logs ?? []).filter((el) =>
      dateList.includes(el.date)
    );

    // 判断是否可以奖励小星星
    let award = false;
    // 出勤天数
    let attendanceDays = 0;
    // 新题总数
    let newQuestionsTotal = 0;

    for (let j = 0; j < curWeekLogs.length; j++) {
      const daily = curWeekLogs[j];
      // 累加新题数
      newQuestionsTotal += daily.questionIds.length;
      // 判断出勤天数
      if (daily.questionIds.length > 0) {
        attendanceDays++;
      }

      // 题目数量 >=14 或者是 满勤，就给小星星
      if (newQuestionsTotal >= 14 || attendanceDays === 7) {
        award = true;
      }

      // 给予奖励时，就 break
      if (award) {
        break;
      }
    }

    // 判断下是否可以找到这个人
    const userAward = awardRankingData.find((u) => u.userId === userId);
    // 给予奖励，更改数据
    if (award) {
      checkUsers.push(userName);
      if (userAward) {
        userAward.weeks = Array.from(
          new Set([...(userAward.weeks || []), curISOWeekNumber])
        );
      } else {
        awardRankingData.push({
          userId,
          userName,
          weeks: [curISOWeekNumber],
        });
      }
    }
  }

  console.log(checkUsers)

  // 覆盖奖励数据
  fs.writeFileSync(awardRankingFilePath, JSON.stringify(awardRankingData), {
    encoding: 'utf8',
  });
};

awardRanking();
