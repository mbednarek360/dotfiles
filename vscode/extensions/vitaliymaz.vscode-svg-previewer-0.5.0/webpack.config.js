const path = require('path');

module.exports = {
	mode: 'development',
	entry: {
		index: path.resolve(__dirname, 'preview-src/index.tsx')
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js']
	},
	devtool: 'inline-source-map',
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'media')
	},
	module: {
		rules: [
		  { test: /\.tsx?$/, loader: "ts-loader", exclude: /node_modules/ }
		]
	}
};