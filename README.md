# 务实好青年 LeetCode 刷题打卡群

## 免责声明

本项目仅供学习交流参考，在任意情况下均不得用于任何商业用途。如有意外，本人不承担任何责任。^\_^

## 用途

- 日报: 每天每小时的 50 分获取用户的当天的刷题记录，结果记录在 [archives 目录](./archives/) 下。
- 周报: 每天的 04:55、08:55、12:55、16:55、20:55、23:55 汇总本周周报，结果记录在 [weeks 目录](./weeks/) 下

注意：由于调用的接口只能返回最近 15 次 AC 的记录，可能会包含重复的题目，如果用户存在反反复复重复提交的情况，可能会导致统计不全~

## 线上地址

- [用户日报](https://anonymity94.github.io/leetcode-submission/docs/)
- [本周周报](https://anonymity94.github.io/leetcode-submission/docs/week)

## 使用方法

### 添加自己的 LC ID

修改文件 [user.json](./dict/user.json)

```json
{
  // 用户名称，随便你取什么名字
  "userName": "你好啊派大星",
  // LeetCode 中用户唯一标识
  "userId": "ni-hao-a-pai-da-xing"
}
```

### 运行

```sh
yarn
# 获取提交记录
yarn run ac_record
# 汇总周报
yarn run week_rollup
# 新增用户时，扫描用户最近一周的 AC 记录
yarn run fix_user
```

## 参考

> 其实都没什么用...

- https://blog.csdn.net/qq_32424059/article/details/106071201
- https://github.com/Ruin9999/leetcode-api/blob/main/src/modules/recent.js
- https://github.com/hjx051013/leetcode_submission_check
- https://hasura.io/blog/how-to-request-a-graphql-api-with-fetch-or-axios/
