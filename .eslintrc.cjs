const { defineConfig } = require('eslint-define-config');

/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = defineConfig({
  root: true,
  env: {
    node: true,
    browser: true,
  },
  extends: [
    // node_modules/eslint-plugin-vue/lib/configs/vue3-essential
    'plugin:vue/vue3-essential',
    // node_modules/eslint/conf/eslint-recommended.js
    'eslint:recommended',
    // node_modules/@vue/eslint-config-typescript/index.js => node_modules/@typescript-eslint/dist/configs/eslint-recommended.js
    '@vue/eslint-config-typescript/recommended',
    // node_modules/@vue/eslint-config-prettier/index.js => node_modules/eslint-plugin-prettier/eslint-plugin-prettier.js
    '@vue/eslint-config-prettier',
  ],
  rules: {
    // 下面的配置能够覆盖之前的配置
    'vue/multi-word-component-names': 'off',
  },
});
