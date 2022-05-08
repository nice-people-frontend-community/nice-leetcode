// 汇总每周的周报
import * as fs from 'fs';
import * as path from 'path';
import { IArchivesLog } from './typings';
const users = require('../dict/user.json');
const dayjs = require('dayjs');
const isoWeek = require('dayjs/plugin/isoWeek');
const weekOfYear = require('dayjs/plugin/weekOfYear');
dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);
// 日期格式化方式
const DATE_FORMAT_STRING = 'YYYY-MM-DD';

// 当前日所在的ISO周数
const curISOWeekNumber = dayjs().isoWeek();

/**
 * 获取当前日所在ISO周的起止日期
 * @returns 日期列表
 */
const getWeekStartAndEnd = () => {
  // 当前周的星期一
  const startDate = dayjs().startOf('isoWeek').format(DATE_FORMAT_STRING);

  const dateList: string[] = [];
  let index = 0;
  while (index < 7) {
    dateList.push(
      dayjs(startDate).add(index, 'day').format(DATE_FORMAT_STRING)
    );
    index += 1;
  }

  return dateList;
};

const dateList = getWeekStartAndEnd();

/**
 * 汇总周报
 */
const rollup = () => {
  // 生成用户排名信息
  const summaryList: (IArchivesLog & {
    curWeekLogs: IArchivesLog['logs'];
    /** 新题的数量  */
    newQuestionsTotal: number;
    /** 排名 */
    ranking?: number;
  })[] = [];
  for (let i = 0; i < users.length; i++) {
    const { userName, userId } = users[i];
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

    // 只统计新题目的数量
    summaryList.push({
      ...userArchivesData,
      curWeekLogs,
      newQuestionsTotal: curWeekLogs.reduce(
        (sum, item) => (sum += item.questionIds.length),
        0
      ),
    });
  }

  // 倒序排列
  summaryList.sort((a, b) => b.newQuestionsTotal - a.newQuestionsTotal);
  // 根据题目数量进行排名，相同题目数量的，排名相同
  let rankNumber = 1;
  for (let index = 0; index < summaryList.length; index++) {
    const summary = summaryList[index];
    if (
      index > 0 &&
      summary.newQuestionsTotal !== summaryList[index - 1].newQuestionsTotal
    ) {
      rankNumber += 1;
    }
    summary.ranking = rankNumber;
  }

  const weekFilePath = path.resolve(
    __dirname,
    `../weeks/第${curISOWeekNumber}周(${dateList[0]}_${
      dateList[dateList.length - 1]
    }).md`
  );

  // 创建文件
  fs.writeFileSync(
    weekFilePath,
    `
# ${dateList[0]} ~ ${dateList[dateList.length - 1]} 打卡记录

> 更新于: ${dayjs().format()}

| 用户名 | 力扣 |  ${dateList.join('|')}  | 总计 | 排名 |
| ---- | ---- |   ${new Array(dateList.length)
      .fill(' ---- ')
      .join('|')}  | ---- | ---- |
${summaryList
  .map((user) =>
    [
      '',
      user.userName,
      // 主页
      `[${user.userId}](${user.homepage})`,
      // 本周的做题
      ...dateList.map((date) => {
        const dateLog = user.curWeekLogs.find((row) => date === row.date);
        if (!dateLog) {
          return '';
        }
        return dateLog.questionIds
          .join('')
          .replace(/\[/g, '\\[')
          .replace(/\]/g, ']');
      }),
      // 总计
      user.newQuestionsTotal,
      user.ranking,
      '',
    ].join('|')
  )
  .join('\n')}
    `,
    {
      encoding: 'utf8',
    }
  );
};

rollup();
