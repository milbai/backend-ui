/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
export default {
  dev: {
    '/rwslinks': {
      // target: 'http://192.168.3.146:8844/',
      // ws: 'ws://192.168.3.146:8844/',
      // target: 'http://water.zlkjhb.com:9000/rwslinks',
      // ws: 'http://water.zlkjhb.com:9000/rwslinks',
      // ws: 'ws://demo.rwslinks.cn/rwslinks',
      // target: 'http://demo.rwslinks.cn/rwslinks',
      target: 'http://101.201.145.41:8881/',
      ws: 'ws://101.201.145.41:8881/',
      // target: 'http://127.0.0.1:8848/',
      // ws: 'ws://127.0.0.1:8848/',
      // ws: 'ws://demo.rwslinks.cn/rwslinks',
      // target: 'http://demo.rwslinks.cn/rwslinks',
      changeOrigin: true,
      pathRewrite: { '^/rwslinks': '' },
    },
  },
  test: {
    '/rwslinks': {
      // target: 'http://192.168.3.89:8848/',
      target: 'http://2.rwslinks.org:9010/',
      changeOrigin: true,
      pathRewrite: { '^/rwslinks': '' },
    },
  },
  pre: {
    '/rwslinks': {
      // target: 'http://192.168.3.89:8848/',
      target: 'http://2.rwslinks.org:9010/',
      changeOrigin: true,
      pathRewrite: { '^/rwslinks': '' },
    },
  },
};
