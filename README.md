# 好青年 | LeetCode 打卡群

## 免责声明

本项目仅供学习交流参考，在任意情况下均不得用于任何商业用途。如有意外，本人不承担任何责任。^\_^

## 用途

- 日报: 每天每小时的 50 分获取用户的当天的刷题记录，结果记录在 [data/records 目录](data/records/) 下
- 周报: 日报更新后自动汇总本周周报，结果记录在 [data/weeks 目录](data/weeks/) 下
- 头等舱航班：离群航班会在每月一号启航，登机客户为上个月不曾打卡的同学，离群后可再次申请入群

注意：由于调用的接口只能返回最近 15 次 AC 的记录，可能会包含重复的题目，如果用户存在反反复复重复提交的情况，可能会导致统计不全~

## 线上地址

- [用户日报](https://nice-people-frontend-community.github.io/nice-leetcode/docs/)
- [本周周报](https://nice-people-frontend-community.github.io/nice-leetcode/docs/week)
- [头等舱航班](https://nice-people-frontend-community.github.io/nice-leetcode/docs/first-class)

## 使用方法

### 添加自己的 LC ID

修改文件 [user.json](data/common/user.json)

```json5
{
  // 用户名称，随便你取什么名字
  userName: '你好啊派大星',
  // LeetCode 中用户唯一标识
  userId: 'ni-hao-a-pai-da-xing',
  // 是否是美服账号
  // 此字段选填，默认：false（国服）
  lcus: true,
  // 刷题记录是否周报中屏蔽
  // 此字段选填，默认：false
  hideInWeek: false,
}
```

### 运行

本项目对一些版本进行了必要的约束

- `Node.js` 版本为 `16.x`
- `Yarn` 版本为 `1.22.18`

### 安装依赖

```sh
yarn
```

### 统计 LeetCode 提交

```sh
# 获取提交记录
yarn run ac_record
# 汇总周报
yarn run week_rollup
# 新增用户时，扫描用户最近一周的 AC 记录
yarn run fix_user
```

### 运行前端可视化页面

```sh
# 本地开发
yarn run docs:dev
# 生产打包
yarn run docs:build
# 打包后预览
yarn run docs:preview
```

## 参考

> 其实都没什么用...

- https://blog.csdn.net/qq_32424059/article/details/106071201
- https://github.com/Ruin9999/leetcode-api/blob/main/src/modules/recent.js
- https://github.com/hjx051013/leetcode_submission_check
- https://hasura.io/blog/how-to-request-a-graphql-api-with-fetch-or-axios/
