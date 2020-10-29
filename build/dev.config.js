const portfinder = require('portfinder');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const join = path.join;
const basename = path.basename;
const eslintFriendlyFormatter = require('eslint-friendly-formatter');
const tsImportPluginFactory = require('ts-import-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

const devConfig = {
  entry: './demo/main.ts',
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    progress: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.vue', '.json'],
    alias: {
      vue: 'vue/dist/vue.js',
    },
  },
  performance: {
    hints: false,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: './demo/index.html',
      filename: 'index.html',
    }),
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'compVersion': JSON.stringify('')
    }),
  ],
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx|vue)$/,
        enforce: 'pre',
        include: resolve('demo'),
        exclude: /node_modules/,
        use: [
          {
            loader: 'eslint-loader',
            options: {
              formatter: eslintFriendlyFormatter,
            },
          },
        ],
      },
      {
        test: /\.ts?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
              transpileOnly: true,
              getCustomTransformers: () => ({
                before: [
                  // 按需引入后台组件库
                  tsImportPluginFactory({
                    libraryName: 'components-junhai',
                    libraryDirectory: 'lib',
                    // path --- 'components-junhai/lib/xxx'
                    style: path =>
                      join('components-junhai', 'lib', 'style', `${basename(path, '.js')}.css`)
                  }),
                  // 按需引入elementui组件库
                  tsImportPluginFactory({
                    libraryName: 'element-ui',
                    libraryDirectory: 'lib',
                    style: path =>
                      join('element-ui', 'lib', 'theme-chalk', `${basename(path, '.js')}.css`)
                  })
                ]
              }),
              compilerOptions: {
                module: 'es2015'
              }
            },
          },
        ],
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          "babel-loader",
          {
            loader: "ts-loader",
            options: { 
              appendTsxSuffixTo: [/\.vue$/],
              transpileOnly: true,
              getCustomTransformers: () => ({
                before: [
                  // 按需引入后台组件库
                  tsImportPluginFactory({
                    libraryName: 'components-junhai',
                    libraryDirectory: 'lib',
                    // path --- 'components-junhai/lib/xxx'
                    style: path =>
                      join('components-junhai', 'lib', 'style', `${basename(path, '.js')}.css`)
                  }),
                  // 按需引入elementui组件库
                  tsImportPluginFactory({
                    libraryName: 'element-ui',
                    libraryDirectory: 'lib',
                    style: path =>
                      join('element-ui', 'lib', 'theme-chalk', `${basename(path, '.js')}.css`)
                  })
                ]
              }),
              compilerOptions: {
                module: 'es2015'
              }
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader',
          {
            loader: 'sass-resources-loader',  // 全局导入scss(本地调试用)
            options: {
              resources: path.resolve(__dirname, '../src/assets/css/common.scss'),
            },
          },
        ],
      },
      {
        test: /\.sass$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader?indentedSyntax',
          {
            loader: 'sass-resources-loader',  // 全局导入scss(本地调试用)
            options: {
              resources: path.resolve(__dirname, '../src/assets/css/common.scss'),
            },
          },
        ],
      },
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
            options: {
              loaders: {
                scss: [
                  'vue-style-loader',
                  'css-loader',
                  'sass-loader'
                ],
                sass: [
                  'vue-style-loader',
                  'css-loader',
                  'sass-loader?indentedSyntax'
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]?[hash]',
            },
          },
        ],
      },
      {
        test: /\.(woff2?|svg|eot|ttf|otf)(\?.*)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'fonts/[name].[hash:7].[ext]',
            }
          }
        ]
      },
    ],
  },
  devtool: '#eval-source-map',
};

// eslint-disable-next-line no-shadow
module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = 8080;
  portfinder.getPort((err, port) => {
    if (err) reject(err);
    devConfig.devServer.port = port;
    resolve(devConfig);
  });
});
