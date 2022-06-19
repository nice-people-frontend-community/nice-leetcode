import * as asyncLib from 'async';

import { IUser } from './typings';
import { DATE_FORMAT_STRING, getAcSubmissions } from './utils';
import { weekRollup } from './week_rollup';

const users = require('../dict/user.json');
const dayjs = require('dayjs');
// 当天日期
const today = dayjs().format(DATE_FORMAT_STRING);
const yesterday = dayjs().subtract(1, 'day').format(DATE_FORMAT_STRING);

// 由于 GitHub Actions 定时器启动不准，这里做下兼容处理
// 定时器不会延迟太久，所以这里仅判断跨天的的即可
// 如果启动时间在凌晨 00:30 以内的话，就查询昨天记录
let queryDate = today;
if (new Date().getHours() === 0 && new Date().getMinutes() < 30) {
  queryDate = yesterday;
}

asyncLib.mapLimit<IUser, any, any>(
  users,
  5,
  async function (userInfo, callback) {
    await getAcSubmissions(userInfo, queryDate, callback);
  },
  (err, results) => {
    if (err) throw err;
    console.log('日报处理完成^_^');
    weekRollup();
    console.log('周报处理完成^_^');
  },
);
