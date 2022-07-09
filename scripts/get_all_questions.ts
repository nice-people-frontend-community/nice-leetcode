import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

import type { IQuestion } from './typings';

interface IAllProblemResponse {
  stat_status_pairs: {
    /** 难度等级 */
    difficulty: { level: number };
    stat: IQuestion;
  }[];
}
const getAllQuestions = () => {
  axios
    .get<IAllProblemResponse>('https://leetcode.cn/api/problems/all/')
    .then((res) => {
      const { stat_status_pairs } = res.data;
      // 对题目进行转换后保存
      const questionMap = <Record<string, IQuestion>>{};

      for (let i = 0; i < stat_status_pairs.length; i++) {
        const question = stat_status_pairs[i];
        questionMap[question.stat.question__title_slug] = { ...question.stat, level: question.difficulty.level };
        questionMap[question.stat.frontend_question_id] = { ...question.stat, level: question.difficulty.level };
      }

      // 写文件
      fs.writeFileSync(path.resolve(__dirname, `../data/common/all_questions_map.json`), JSON.stringify(questionMap), {
        encoding: 'utf8',
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

getAllQuestions();
