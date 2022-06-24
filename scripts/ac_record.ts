// 获取所有用户的AC记录
import { mapLimit } from 'async';
import { getAcSubmissions, getToday, getYesterday } from './utils';
import { weekRollup } from './week_rollup';
import type { IUser } from './typings';

const dayjs = require('dayjs');
const users = require('../dict/user.json');

const day = dayjs();

// 由于 GitHub Actions 定时器启动不准，这里做下兼容处理
// 定时器不会延迟太久，所以这里仅判断跨天的的即可
// 如果启动时间在凌晨 00:30 以内的话，就查询昨天记录
let queryDate = getToday();
if (day.hour() === 0 && day.minute() < 30) {
  queryDate = getYesterday();
}

mapLimit<IUser, unknown, unknown>(
  users,
  5,
  async function (userInfo, callback) {
    await getAcSubmissions(userInfo, queryDate, callback);
  },
  (err) => {
    if (err) throw err;
    console.log('日报处理完成^_^');
    weekRollup();
    console.log('周报处理完成^_^');
  },
);
