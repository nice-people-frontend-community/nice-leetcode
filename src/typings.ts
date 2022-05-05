export interface IGraphqlQuery {
  query: string;
  variables: Record<string, string>;
}

export interface IUser {
  /** 昵称 */
  userName: string;
  /** LeetCode 用户唯一ID */
  userId: string;
}

export interface IRecentACSubmissions {
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
