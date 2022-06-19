const npmExecPath = process.env.npm_execpath || '';
if (!/yarn/.test(npmExecPath)) {
  console.warn(
    `\u001b[33mThis repository requires using yarn as the package manager ` +
    `for scripts to work properly.\u001b[39m\n`,
  );

  console.warn(`\u001b[33mYou should run the following script to reinstall dependencies.\u001b[39m\n`);
  console.warn(`\u001b[33mrm -rf ./node_modules\u001b[39m`);
  if (/pnpm/.test(npmExecPath)) {
    console.warn(`\u001b[33mrm -rf ./pnpm-lock.yaml\u001b[39m`);
  } else if (/npm/.test(npmExecPath)) {
    console.warn(`\u001b[33mrm -rf ./package-lock.json\u001b[39m`);
  }
  console.warn(`\u001b[33myarn install\u001b[39m\n`);

  process.exit(1);
}
