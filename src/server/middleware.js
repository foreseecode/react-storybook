import { Router } from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import getBaseConfig from './config/webpack.config';
import loadConfig from './config';
import getIndexHtml from './index.html';
import getIframeHtml from './iframe.html';
import { getHeadHtml, getMiddleware } from './utils';

export default function (configDir) {
  // Build the webpack configuration using the `getBaseConfig`
  // custom `.babelrc` file and `webpack.config.js` files
  const config = loadConfig('DEVELOPMENT', getBaseConfig(), configDir);
  const middlewareFn = getMiddleware(configDir);

  // remove the leading '/'
  let publicPath = config.output.publicPath;
  if (publicPath[0] === '/') {
    publicPath = publicPath.slice(1);
  }

  const compiler = webpack(config);
  const devMiddlewareOptions = {
    noInfo: true,
    publicPath: config.output.publicPath,
    watchOptions: config.watchOptions || {},
  };

  const router = new Router();
  router.use(webpackDevMiddleware(compiler, devMiddlewareOptions));
  router.use(webpackHotMiddleware(compiler));

  // custom middleware
  middlewareFn(router);

  router.get('/', function (req, res) {
    const headHtml = getHeadHtml(configDir, 'head.html');
    res.send(getIndexHtml({ headHtml, publicPath }));
  });

  router.get('/iframe.html', function (req, res) {
    const frameHtml = getHeadHtml(configDir, 'frame.html');
    res.send(getIframeHtml({ frameHtml, publicPath }));
  });

  return router;
}
