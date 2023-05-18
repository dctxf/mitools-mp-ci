#!/usr/bin/env node
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import minici from 'miniprogram-ci';
import { readPackageSync } from 'read-pkg';
import semver from 'semver';
import inc from 'semver/functions/inc.js';

const prompt = inquirer.createPromptModule();

const isDev = process.env.NODE_ENV === 'development';

// 获取项目根目录的package.json的配置
const { version: packageVersion, ci } = readPackageSync({
  // cwd: __dirname,
});

if (!packageVersion) {
  console.log('请在项目根目录下运行此命令');
  process.exit(1);
}


export type WeappConfig = {
  appid: string;
  privateKeyPath?: string;
  projectPath?: string;
  version: string;
  desc: string;
};

export async function mpUpload (config: WeappConfig) {
  const project = new minici.Project({
    appid: config.appid,
    type: 'miniProgram',
    projectPath: config.projectPath || './dist/weapp',
    privateKeyPath: config.privateKeyPath || `./private.${config.appid}.key`,
    ignores: ['node_modules/**/*'],
  });

  if (!isDev) {
    await minici.upload({
      project,
      version: config.version,
      desc: config.desc,
      setting: {
        es6: true,
        minify: true,
      },
      robot: 1,
      onProgressUpdate: console.log,
    });
  }
  console.log('---- 代码部署完毕，请到小程序后台进行后续操作 ----');
  console.log('https://mp.weixin.qq.com/');
  console.log('-----  End  -----');
}


prompt([
  {
    type: 'list',
    name: 'mpType',
    message: '请选择要发布的小程序类型',
    default: 'weapp',
    choices: ['weapp', 'swan', 'alipay', 'tt', 'qq', 'jd'],
    loop: true,
  },
  {
    type: 'list',
    name: 'version',
    message: `请选择要发布的版本, 当前版本为: ${packageVersion}`,
    default: 'minor',
    choices: ['major', 'minor', 'patch', 'none'],
    loop: true,
  },
  {
    type: 'confirm',
    name: 'isBuild',
    message: '是否需要打包小程序(Y/n):',
    default: 'Y',
  },
  {
    type: 'input',
    name: 'remark',
    message: '请输入版本说明:',
  },
]).then(async ({ mpType, version, isBuild, remark }) => {
  console.log('即将开始打包小程序', { version, remark, packageVersion })
  const pv = semver.parse(packageVersion);
  const nv = version !== 'none' ? inc(pv, version) : packageVersion;
  if (version !== 'none' && !isDev) {
    execSync(`npm version ${version} --git-tag-version=false`);
  }
  console.log('配置完成', { version: nv, remark: remark || nv });

  if (mpType === 'weapp') {
    if (isBuild && !isDev) {
      execSync(`npm run build:weapp`, { stdio: 'inherit' });
    }
    console.log('小程序打包完成，即将开始上传小程序');
    // 开始读取配置文件
    await mpUpload({
      appid: ci.weapp.appid,
      privateKeyPath: ci.weapp.privateKeyPath,
      version: nv,
      desc: remark || nv,
    });
  }
});


