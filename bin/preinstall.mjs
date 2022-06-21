// 有时候 preinstall 并不会如预期一般运行
// https://github.com/npm/cli/issues/2660

// eslint-disable-next-line no-undef
const packageManagerUA = process.env.npm_config_user_agent || '';
if (!/yarn/.test(packageManagerUA)) {
  console.warn(
    `\u001b[33mThis repository requires using yarn as the package manager ` +
      `for scripts to work properly.\u001b[39m\n`,
  );

  console.warn(`\u001b[33mYou should run the following script to reinstall dependencies.\u001b[39m\n`);
  console.warn(`\u001b[33mrm -rf ./node_modules\u001b[39m`);
  if (/pnpm/.test(packageManagerUA)) {
    console.warn(`\u001b[33mrm -rf ./pnpm-lock.yaml\u001b[39m`);
  } else if (/npm/.test(packageManagerUA)) {
    console.warn(`\u001b[33mrm -rf ./package-lock.json\u001b[39m`);
  }
  console.warn(`\u001b[33myarn install\u001b[39m\n`);
  // eslint-disable-next-line no-undef
  process.exit(1);
}
