import { getAcSubmissions, getToday, getWeekStartAndEnd } from './utils';
import type { IUser } from './typings';

const today = getToday();
const weekDateList = getWeekStartAndEnd(today);

const newUsers: IUser[] = [];
// 获取新增人员，当前周的刷题记录
// 其实可以 getAcSubmissions() 修改成直接扫描当前可以获取到的全部记录，重新记录
// 懒得改了...
(async () => {
  for (let i = 0; i < newUsers.length; i++) {
    const user = newUsers[i];

    for (let j = 0; j < weekDateList.length; j++) {
      const date = weekDateList[j];
      console.log(date);
      await getAcSubmissions(user, date);
      if (date === today) {
        break;
      }
    }
  }
})();
