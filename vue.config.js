/* eslint-disable @typescript-eslint/no-var-requires */
const moment = require('moment');
const child_process = require('child_process');
const path = require('path');

const CODE_BRANCH = (child_process.execSync('git name-rev --name-only HEAD').toString() || '').replace(/('|\n)/gi, '');
const COMMER_USER = (child_process.execSync('git log --pretty=\'%an\' -1').toString() || '').replace(/('|\n)/gi, '');
const COMMER_MESSAGE = (child_process.execSync('git log --pretty=\'%s\' -1').toString() || '').replace(/('|\n)/gi, '');
const COMMER_TIME = (child_process.execSync('git log --pretty=\'%cd\' -1').toString() || '').replace(/('|\n)/gi, '');

module.exports = {
  indexPath: path.resolve(__dirname, './dist/index.html'),
  outputDir: path.resolve(__dirname, './dist'),
  assetsDir: 'public',
  publicPath: './',
  productionSourceMap: false,
  pages: {
    index: {
      entry: path.resolve(__dirname, './examples/main.ts'),
      template: path.resolve(__dirname, './public/index.html'),
      filename: 'index.html',
      chunks: ['index']
    }
  },
  chainWebpack: config => {
    if (process.env.NODE_ENV === 'development') {
      config
        .plugin('define')
        .tap(args => {
          args[0]['process.env'].CODE_VERSION = `"${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}"`;
          args[0]['process.env'].CODE_BRANCH = `"${CODE_BRANCH}"`;
          args[0]['process.env'].COMMER_USER = `"${COMMER_USER}"`;
          args[0]['process.env'].COMMER_MESSAGE = `"${COMMER_MESSAGE}"`;
          args[0]['process.env'].COMMER_TIME = `"${moment(new Date(COMMER_TIME)).format('YYYY-MM-DD HH:mm:ss')}"`;
          return args;
        });
    }
    config.optimization.delete('splitChunks');
  },
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    open: false,
    hot: true,
  },
  configureWebpack: {
    resolve: {
      extensions: ['.js', '.vue', '.ts']
    },
    plugins: [],
  },
};
