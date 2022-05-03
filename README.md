# 务实好青年 LeetCode 刷题打卡群

## 免责声明

本项目仅供学习交流参考，在任意情况下均不得用于任何商业用途。如有意外，本人不承担任何责任。^_^

## 用途

每天晚上 23:30 获取用户的当天的刷题记录，结果记录在 [archives 目录](./archives/) 下。

注意：由于调用的接口只能返回最近 15 次 AC 的记录，可能会包含重复的题目，如果用户存在反反复复重复提交的情况，可能会导致统计不全~

## 使用方法

### 填写 `CSRFTOKEN`

登录 LeetCode PC 端，F12 查看 `Request Headers`，将 `x-csrftoken` 复制，添加到文件 [.env](./.env) 中。例如

```
x-csrftoken: CrSKCu371vP9uXvYhVv4TaI9x9pOp2zQTh2HLWxkgPQ6uYav94bZ49tFdzJ7wTBX
```

### 添加自己的 LC ID

修改文件 [user.json](./dict/user.json)

```json
{
  // 用户名称，随便你取什么名字
  "displayName": "你好啊派大星",
  // LeetCode 中用户唯一标识
  "userSlug": "ni-hao-a-pai-da-xing"
}
```

### 运行

```sh
yarn
yarn run start
```

## 参考

> 其实都没什么用...

- https://blog.csdn.net/qq_32424059/article/details/106071201
- https://github.com/Ruin9999/leetcode-api/blob/main/src/modules/recent.js
- https://github.com/hjx051013/leetcode_submission_check
- https://hasura.io/blog/how-to-request-a-graphql-api-with-fetch-or-axios/
