// 获取所有用户的AC记录
import { mapLimit } from 'async';
import { getAcSubmissions, getToday, getYesterday } from './utils';
import { weekRollup } from './week_rollup';
import type { IUser } from './typings';
import { awardRanking } from './award_ranking';
import { cpus } from 'os';

const dayjs = require('dayjs');
const users = require('../data/common/user.json');

const day = dayjs();

// 由于 GitHub Actions 定时器启动不准，这里做下兼容处理
// 定时器不会延迟太久，所以这里仅判断跨天的的即可
// 如果启动时间在凌晨 02:00 以内的话，就查询昨天记录
// 防止前一天丢数据
let queryDate = getToday();
if (day.hour() < 2) {
  queryDate = getYesterday();
}

// 最大上限
const limit = cpus().length;

console.log('limit =>', limit);

mapLimit<IUser, unknown, unknown>(
  users,
  limit,
  async function (userInfo, callback) {
    await getAcSubmissions(userInfo, queryDate, callback);
  },
  (err) => {
    if (err) throw err;
    console.log('日报处理完成^_^');
    if (day.day() !== 0 || (day.hour() === 22 ? day.minute() >= 40 : day.hour() > 22)) {
      weekRollup();
      console.log('周报处理完成^_^');
    }
    awardRanking();
    console.log('总榜处理完成^_^');
  },
);
