import type { IUser } from 'scripts/typings';

import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);

/**
 * 获取用户主页链接地址
 * @param user 用户信息
 */
export const getUserHomepage = (user: IUser): string => {
  return (user.lcus ? 'https://leetcode.com/u/' : 'https://leetcode.cn/u/') + user.userId;
};

/***
 * 年月日格式化字符串
 */
export const DATE_FORMAT_STRING = 'YYYY-MM-DD';

/***
 * 年月日格式化字符串
 */
export function getToday(format = DATE_FORMAT_STRING) {
  return dayjs().format(format);
}

/**
 * 获取某个日期所在的ISO周数
 * @param date 日期 YYYY-MM-DD
 * @returns
 */
export const getISOWeekNumber = (date: string) => dayjs(date).isoWeek();

/**
 * 获取某个日期所在ISO周的起止日期
 * @param {string} date YYYY-MM-DD
 * @returns 日期列表
 */
export const getWeekStartAndEnd = (date: string) => {
  // 当前周的星期一
  const startDate = dayjs(date).startOf('isoWeek').format(DATE_FORMAT_STRING);

  const dateList = [];
  let index = 0;
  while (index < 7) {
    dateList.push(dayjs(startDate).add(index, 'day').format(DATE_FORMAT_STRING));
    index += 1;
  }

  return dateList;
};

/**
 * 格式化奖励等级
 * @param level 等级
 * @param step 进制
 */
export const formatAwardLevel = (level: number, step = 4) => {
  let restLevel = level;
  // 生成的换算后的文字
  let levelText = '';
  // 1个等级就是一个星星
  const starStep = 1;
  // 4个星星变成一个月亮
  const moonStep = starStep * step;
  // 4个月亮变成一个太阳
  const sunStep = moonStep * step;
  // 计算太阳
  if (restLevel >= sunStep) {
    const sunCount = Math.floor(restLevel / sunStep);
    levelText += String('🌞').repeat(sunCount);
    restLevel = restLevel - sunStep * sunCount;
  }

  // 计算月亮
  if (restLevel >= moonStep) {
    const moonCount = Math.floor(restLevel / moonStep);
    levelText += String('🌙').repeat(moonCount);
    restLevel = restLevel - moonStep * moonCount;
  }

  // 计算星星
  if (restLevel > 0) {
    levelText += String('⭐').repeat(restLevel);
  }

  return levelText;
};
