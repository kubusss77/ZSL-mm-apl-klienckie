const path = require('path');
module.exports = {
	entry: {
		index: './src/index.ts'
	},
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: '[name].bundle.js',
		clean: true
	},
	module: {
		rules: [
		{
			test: /\.tsx?$/,
			use: 'ts-loader',
			exclude: /node_modules/
		}
		]
	},
	resolve: {
		extensions: [ '.tsx', '.ts', '.js' ]
	}
}
