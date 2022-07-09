import axios from 'axios';

const instance = axios.create({
  // baseURL: `${window.location.hostname.includes('github.io') ? '/nice-leetcode' : ''}`,
  baseURL: 'https://nice-people-frontend-community.github.io/nice-leetcode',
  timeout: 1000 * 30,
});

export default instance;
