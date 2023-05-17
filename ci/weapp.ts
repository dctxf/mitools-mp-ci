import ci from 'miniprogram-ci';

const isDev = process.env.NODE_ENV === 'development';

export type WeappConfig = {
  appid: string;
  privateKeyPath?: string;
  projectPath?: string;
  version: string;
  desc: string;
};

export async function mpUpload (config: WeappConfig) {
  const project = new ci.Project({
    appid: config.appid,
    type: 'miniProgram',
    projectPath: config.projectPath || './dist/weapp',
    privateKeyPath: config.privateKeyPath || `./private.${config.appid}.key`,
    ignores: ['node_modules/**/*'],
  });

  if (!isDev) {
    await ci.upload({
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
