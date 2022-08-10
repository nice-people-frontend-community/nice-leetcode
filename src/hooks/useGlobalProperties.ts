import type { QuestionMap } from '@@/scripts/typings';
import { getCurrentInstance } from 'vue';

export default function useGlobalProperties() {
  const {
    appContext: {
      app: {
        config: { globalProperties },
      },
    },
  } = getCurrentInstance() as {
    appContext: {
      app: Record<string, any>;
    };
  };
  return { ...globalProperties } as {
    $quertionMap: QuestionMap;
    [key: string]: any;
  };
}
