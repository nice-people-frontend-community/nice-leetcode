const nodeVer = process.versions.node.split('.')[0];

if (nodeVer < 16) {
  // 抛出异常
  console.log('当前node版本较低，请安装>16版本node; nvm use 16');
  process.exitCode = 1
}
