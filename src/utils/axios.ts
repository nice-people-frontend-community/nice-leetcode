axios.defaults.baseURL = import.meta.env.PROD ? '/nice-leetcode' : '';
axios.defaults.timeout = 1000 * 30;
