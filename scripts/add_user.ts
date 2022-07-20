import { getAcSubmissions, getToday, getWeekStartAndEnd } from './utils';
import type { IUser } from './typings';
import * as fs from 'fs';
import * as path from 'path';

const today = getToday();
const weekDateList = getWeekStartAndEnd(today);

const newUsers: IUser[] = [
  // {
  //   userName: '',
  //   userId: '',
  // },
];

addUser(newUsers).catch((e) => console.log(e));

// 获取新增人员，当前周的刷题记录
// 其实可以 getAcSubmissions() 修改成直接扫描当前可以获取到的全部记录，重新记录
// 懒得改了...
async function addUser(newUsers: IUser[]) {
  if (!newUsers.length) return;
  const userFilePath = path.resolve(__dirname, `../data/common/user.json`);
  const userJSON = fs.readFileSync(userFilePath, { encoding: 'utf-8' });
  const users = JSON.parse(userJSON);
  for (let i = 0; i < newUsers.length; i++) {
    const user = newUsers[i];
    users.push(user);
    for (let j = 0; j < weekDateList.length; j++) {
      const date = weekDateList[j];
      await getAcSubmissions(user, date);
      if (date === today) break;
    }
  }
  fs.writeFileSync(userFilePath, JSON.stringify(users, null, 2), { encoding: 'utf-8' });
}
