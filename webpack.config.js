const path = require('path');
const fs = require('fs');
const join = path.join;
const basename = path.basename;
const webpack = require('webpack');
const eslintFriendlyFormatter = require('eslint-friendly-formatter');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const tsImportPluginFactory = require('ts-import-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const getEntry = require('./build/getEntry');

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

// 汇总各组件入口与总入口
const entrys = getEntry(path.resolve(__dirname, './packages'));

module.exports = {
  entry: entrys,
  output: {
    path: path.resolve(__dirname, './lib'),
    publicPath: '../',
    filename: '[name].js',
    library: 'componentsJunhai',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx|vue)$/,
        enforce: 'pre',
        include: resolve('src'),
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
                before: [tsImportPluginFactory(
                  {
                    libraryName: 'element-ui',
                    libraryDirectory: 'lib',
                    style: path =>
                      join('element-ui', 'lib', 'theme-chalk', `${basename(path, '.js')}.css`)
                  }
                )]
              }),
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
                before: [tsImportPluginFactory(
                  {
                    libraryName: 'element-ui',
                    libraryDirectory: 'lib',
                    style: path =>
                      join('element-ui', 'lib', 'theme-chalk', `${basename(path, '.js')}.css`)
                  }
                )]
              })
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
          {
            loader: 'sass-resources-loader',  // 全局导入scss
            options: {
              resources: path.resolve(__dirname, './src/assets/css/common.scss'),
            },
          }
        ]
      },
      {
        test: /\.sass$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
          {
            loader: 'sass-resources-loader',  // 全局导入scss
            options: {
              resources: path.resolve(__dirname, './src/assets/css/common.scss'),
            },
          }
        ]
      },
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
            options: {
              loaders: {
                scss: [
                  MiniCssExtractPlugin.loader,
                  'css-loader',
                  'sass-loader'
                ],
                sass: [
                  MiniCssExtractPlugin.loader,
                  'css-loader',
                  'sass-loader'
                ]
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
        test: /\.(png|jpg|gif)$/,
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
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js',
    },
    extensions: ['.ts', '.tsx', '.js', '.vue', '.json'],
  },
  externals: {
    vue: {
      root: 'Vue',
      commonjs: 'vue',
      commonjs2: 'vue',
      amd: 'vue',
    },
  },
  performance: {
    hints: false,
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true,
        parallel: true,
        uglifyOptions: {
          output: {
            comments: false  // 删掉所有注释
          }
        }
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          map: {
            // 不生成内联映射,这样配置就会生成一个source-map文件
            inline: false,
            // 向css文件添加source-map路径注释
            // 如果没有此项压缩后的css会去除source-map路径注释
            annotation: true
          }
        }
      })
    ],
  }
};

if (process.env.NODE_ENV === 'production') {
  const now = new Date();
  const versionStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`;
  module.exports.devtool = '#source-map';
  module.exports.plugins = (module.exports.plugins || []).concat([
    function () {
      // 更新package.json中的版本号
      this.plugin('done', () => {
        const pkgPath = path.join(__dirname, './package.json');
        let pkg = fs.readFileSync(pkgPath);
        pkg = JSON.parse(pkg);
        let getV = pkg.version;
        getV = getV.split('.').join('');
        getV = Number(getV) + 1;
        pkg.version = `${getV}`.split('').join('.');
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      });
    },
    new CleanWebpackPlugin(),
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
      },
      'compVersion': JSON.stringify(versionStr)
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    }),
    new MiniCssExtractPlugin({
      filename: 'style/[name].css'
    })
  ]);
}
