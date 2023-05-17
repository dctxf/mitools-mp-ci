# mitools-mp-ci

小程序上传工具

## 使用

```bash
npm i mitools-mp-ci
// or
pnpm i mitools-mp-ci
```

## 配置

在 package.json 中增加如下配置

```json
// 其他配置
"ci": {
  "weapp": {
    "appid": "xxx",
    // 默认值 ./private.${config.appid}.key
    "privateKeyPath": "./config/private.key",
    // 默认值 ./dist/weapp
    "projectPath": "./dist/weapp"
  }
}
```

## 脚本

```
ci
```
