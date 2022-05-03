require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const dayjs = require('dayjs');
const async = require('async');
const users = require('./dict/user.json');
// 日期格式化方式
const DATE_FORMAT_STRING = 'YYYY-MM-DD';
// 当天日期
const today = dayjs().format(DATE_FORMAT_STRING);

/**
 * 判断文件是否存在
 * @param {string} path 文件路径
 * @returns {Promise<boolean>} 是否存在
 */
const isFileExists = async (path) => {
  return new Promise(function (resolve, reject) {
    fs.stat(path, (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

/**
 * Axios请求
 * @param {Object} graphqlQuery
 * @returns
 */
const lcQuery = async (graphqlQuery) => {
  const options = {
    //Method is post because we are requesting from graphql
    method: 'POST',
    url: 'https://leetcode-cn.com/graphql/noj-go/',
    headers: {
      'x-csrftoken': process.env.CSRFTOKEN,
    },
    data: graphqlQuery,
  };

  try {
    return await axios.request(options);
  } catch (err) {
    throw err;
  }
};

/**
 * 获取用户昨天的的提交记录
 * @param {{displayName: string, userSlug: string}} userInfo 用户信息
 * @param {string} date 统计哪一天的提交
 * @description 利用最近 15 道 AC 的题目的接口，过滤后获得结果，最好是统计最近1~2天
 */
const getUserTodayAcSubmissions = async (userInfo, date = today) => {
  const { displayName, userSlug } = userInfo;
  const filePath = `./archives/${displayName}(${userSlug}).txt`;
  // 检查是是否有用户的文件
  const exists = await isFileExists(filePath);
  if (!exists) {
    // 创建文件
    fs.writeFileSync(
      filePath,
      `# ${displayName}(${userSlug}) 的刷题记录\n > 用户主页: https://leetcode-cn.com/u/${userSlug}/`,
      {
        encoding: 'utf8',
      }
    );
  }

  try {
    const response = await lcQuery({
      query:
        '\n    query recentACSubmissions($userSlug: String!) {\n  recentACSubmissions(userSlug: $userSlug) {\n    submissionId\n    submitTime\n    question {\n      translatedTitle\n      titleSlug\n      questionFrontendId\n    }\n  }\n}\n    ',
      variables: { userSlug },
    });

    const { recentACSubmissions = [] } = response.data.data || {};
    const todayACQuestionIds = recentACSubmissions
      .filter(
        (row) =>
          dayjs(row.submitTime * 1000).format(DATE_FORMAT_STRING) === date
      )
      .map((row) => `[${row.question.questionFrontendId}]`);

    // 去重
    const uniqeQuestionIds = Array.from(new Set(todayACQuestionIds));

    // 如果为空，有2种可能，
    // 1是确实是没有提交题目
    // 2是设置了隐保护，需要去 [通知与隐私 - 隐私设置 - 显示我的提交记录] 开启
    fs.appendFileSync(
      filePath,
      `\n\n## ${date}\n${
        uniqeQuestionIds.length > 0
          ? uniqeQuestionIds.join('')
          : '用户太懒了，什么也没有提交'
      }`
    );
  } catch (err) {
    console.log(err.message);
    fs.appendFileSync(
      filePath,
      `\n\n## ${todayString}\n统计失败。可以手动前往用户主页查看 https://leetcode-cn.com/u/${userSlug}/`
    );
  } finally {
    console.log(`用户 [${userSlug}] --- ok`);
  }
};

(async () => {
  async.mapLimit(
    users,
    5,
    async function (userInfo) {
      await getUserTodayAcSubmissions(userInfo);
    },
    (err, results) => {
      if (err) throw err;
      console.log('全部处理完成^_^');
    }
  );
})();
