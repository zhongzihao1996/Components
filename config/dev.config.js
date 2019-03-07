const baseConfig = require('./base.config');
const portfinder = require('portfinder');

// 合并基础配置生成开发环境配置（可以先发起await http）
var devConfig = Object.assign(baseConfig, {
	devServer: {
		historyApiFallback: true,
		hot: true,
		open: true,
		inline: true,
		progress: true,
	},
	mode: 'development',
});

// 导出供外部webpack-dev-server使用
module.exports = new Promise((resolve, reject) => {
	portfinder.basePort = 8080;
	portfinder.getPort((err, port) => {
		if (err) reject(err);
		devConfig.devServer.port = port;
		console.log('\x1B[36m%s\x1B[0m', '\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
		console.log('\x1B[33m%s\x1b[0m:', 'Your application will running here：http://localhost:' + port);
		console.log('\x1B[36m%s\x1B[0m', '>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n');
		resolve(devConfig);
	});
});
