#!/usr/bin/env node
import { execSync } from 'child_process';
import { Command } from 'commander';
import inquirer from 'inquirer';
import path from 'path';
import { readPackageSync } from 'read-pkg';
import semver from 'semver';
import inc from 'semver/functions/inc.js';
import { fileURLToPath } from 'url';
import { mpUpload } from './ci/weapp.js';
import pkg from "./package.json" assert { type: "json" };
const program = new Command();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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


program
  .name('ci')
  .description('mitools-mp-ci 是一个小程序自动发布工具')
  .version(pkg.version).parse()

const options = program.opts();

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


