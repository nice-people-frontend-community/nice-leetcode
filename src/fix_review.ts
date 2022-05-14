import * as fs from 'fs';
import * as path from 'path';
import { IArchivesLog } from './typings';
import { getWeekStartAndEnd } from './utils';
const users = require('../dict/user.json');

const dir = path.resolve(__dirname, `../fix_review`);

if (!fs.statSync(dir)) {
  fs.mkdirSync(dir);
}

// 获取新增人员，当前周的刷题记录
// 其实可以 getAcSubmissions() 修改成直接扫描当前可以获取到的全部记录，重新记录
// 懒得改了...
(async () => {
  for (let i = 0; i < users.length; i++) {
    const { userName, userId } = users[i];
    const archiveFilePath = path.resolve(
      __dirname,
      `../archives/${userName}(${userId}).json`
    );
    const fixArchiveFilePath = path.resolve(
      __dirname,
      `../fix_review/${userName}(${userId}).json`
    );
    const userArchivesData: IArchivesLog = JSON.parse(
      fs.readFileSync(archiveFilePath, 'utf8')
    );

    const acData = userArchivesData?.logs || [];
    // 从最后一个日期开始重新整理
    for (let index = acData.length - 1; index >= 0; index--) {
      const dateLog = userArchivesData.logs[index];
      // 查找这一天所在周的
      const weekDateList = getWeekStartAndEnd(dateLog.date);
      const currentWeekQuestionIds: string[] = [];
      acData
        .filter(
          (log) =>
            +new Date(log.date) >= +new Date(weekDateList[0]) &&
            +new Date(log.date) < +new Date(dateLog.date)
        )
        .forEach((el) => {
          currentWeekQuestionIds.push(...el.questionIds);
          currentWeekQuestionIds.push(...el.reviewQuestionIds);
        });

      // 新问题
      const questionIds: string[] = [];
      // 复习的问题
      const reviewIds: string[] = [];
      [...dateLog.questionIds, ...(dateLog.reviewQuestionIds || [])].forEach(
        (questionId) => {
          if (currentWeekQuestionIds.includes(questionId)) {
            reviewIds.push(questionId);
          } else if (!reviewIds.includes(questionId)) {
            // 避免已经出现在当天的复习题中的这种情况
            questionIds.push(questionId);
          }
        }
      );

      // 更新
      dateLog.questionIds = questionIds;
      dateLog.reviewQuestionIds = reviewIds;
    }

    // 保存新的文件
    fs.writeFileSync(fixArchiveFilePath, JSON.stringify(userArchivesData), {
      encoding: 'utf8',
    });
    console.log(`${userName} --- ok`);
  }
})();
