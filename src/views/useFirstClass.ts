/**
 * 针对头等舱页面的处理逻辑
 */
import dayjs from 'dayjs';

export interface IUseFirstClass {
  checkCacheTimeExpired: (time: string) => boolean;
}

/* eslint-disable @typescript-eslint/no-empty-function*/

export default function (): IUseFirstClass {
  /**
   * 检查存储是否过期
   * @param time
   * @returns
   */
  const checkCacheTimeExpired = (time: string) => {
    return dayjs(time).isBefore(dayjs().add(-30, 'm'));
  };

  return {
    checkCacheTimeExpired,
  };
}
