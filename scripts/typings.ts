export interface IGraphqlQuery {
  query: string;
  variables: Record<string, string>;
}

export interface IUser {
  /** 昵称 */
  userName: string;
  /** LeetCode 用户唯一ID */
  userId: string;
  /**
   * 是否是美服
   * @default false 默认是国服
   */
  lcus?: boolean;
  /**
   * 是否在周报中屏蔽
   * @default false 默认在周报中显示
   */
  hideInWeek?: boolean;
}

export interface IRecentACSubmissionsResponse {
  /** 国服的返回值 */
  recentACSubmissions: {
    /** 提交时间 */
    submitTime: number;
    /** 提交 ID */
    submissionId: number;
    question: {
      /** 问题ID */
      questionFrontendId: string;
      /** 问题的英文名称 */
      titleSlug: string;
      /** 问题的中文名称 */
      translatedTitle: string;
    };
  }[];
  /** 美服的返回值 */
  recentAcSubmissionList: {
    /** 提交ID */
    id: string;
    /** 提交时间 */
    timestamp: string;
    /** 标题 */
    title: string;
    /** 题目链接后缀 */
    titleSlug: string;
  }[];
}

export interface IRecentACSubmissions {
  /** 提交时间 */
  submitTime: number;
  /** 问题的英文名称 */
  titleSlug: string;
  /** 问题ID */
  questionFrontendId: string;
}

/** 归档日志 */
export interface IArchivesLog extends IUser {
  /** 用户力扣主页 */
  homepage: string;
  /** 最近一次更新时间(UTC时间) */
  updatedAt: string;
  logs: {
    /** 日期 */
    date: string;
    /** 新题目ID */
    questionIds: string[];
    /** 复习的题目ID */
    reviewQuestionIds: string[];
  }[];
}

/** 用户列表 */
export interface IUserList {
  data: IUser[];
}

/**
 * 国服题目的类型定义
 * @see https://leetcode.cn/api/problems/all/
 */
export interface IQuestion {
  /**
   * 难度等级
   * - 1-简单
   * - 2-中等
   * - 3-复杂
   */
  level: 1 | 2 | 3;
  /**
   * web 展示的问题ID
   * @example 1
   */
  frontend_question_id: string;
  is_new_question: boolean;
  question__hide: boolean;
  /**
   * 问题名称
   * @example Two Sum
   */
  question__title: string;
  /**
   * 问题在 uri 中的名字
   * @example two-sum
   */
  question__title_slug: string;
  /** 问题UUID */
  question_id: number;
  /** 总AC数 */
  total_acs: number;
  /** 总题解数 */
  total_column_articles: number;
  /** 总提交数 */
  total_submitted: number;
}

export type QuestionMap = Record<string, IQuestion>;

export interface IAwardRanking extends IUser {
  weeks: number[];
}
