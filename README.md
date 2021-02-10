## 使用

```bash
$ git clone https://github.com/jetlinks/jetlinks-ui-antd.git
$ cd jetlinks-ui-antd
$ npm install
$ npm start         # visit http://localhost:8000
```
>> 推荐使用淘宝镜像

### 本地开发环境要求

- nodeJs v12.x
- npm v6.x
- Chrome v80.0+

本地开发项目建议使用如下命令启动项目

```bash
$ npm run start:dev     //支持：dev、test、pre环境
```

项目多处采用了 SSE 接口交互，开发需要使用 dev 环境变量（生产环境使用 nginx 代理了 EventSource 接口）

### 修改后台接口地址

后台接口配置文件地址：`config/proxy.ts`:

```typescript
/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 */
export default {
  dev: {
    '/jetlinks': {
      target: '后台地址',
      changeOrigin: true,
      pathRewrite: { '^/jetlinks': '' },
    },
  },
  test: {
    '/jetlinks': {
      target: '后台地址',
      changeOrigin: true,
      pathRewrite: { '^/jetlinks': '' },
    },
  },
  pre: {
    '/jetlinks': {
      target: '后台地址',
      changeOrigin: true,
      pathRewrite: { '^/jetlinks': '' },
    },
  },
};
```

