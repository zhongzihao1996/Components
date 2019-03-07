const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
	entry: ['./examples/main.js'],
	resolve: {
		alias: {
			vue: 'vue/dist/vue.js', //使用别名
		},
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new htmlWebpackPlugin({
			template: './examples/index.html', //生成的新的html文件所依赖的模板
			filename: 'index.html', //生成的新的html文件的名字
		}),
		new VueLoaderPlugin(),
	],
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader',
			},
			{
				test: /\.less$/,
				loader: 'style-loader!css-loader!less-loader',
			},
		],
	},
};
