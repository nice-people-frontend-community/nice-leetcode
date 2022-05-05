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
    /** AC 的问题ID */
    questionIds: string[];
  }[];
}
