// webpack.config.babel.js
'use strict';
import webpack from 'webpack';

const isProd = process.env.NODE_ENV === 'production';

export default {
    entry: {
        index: ['./src/index.js'],
    },
    output: {
        filename: '[name].js',
        path: `${__dirname}/dist/`,
    },
    module: {
        rules: [
            { test: /\.js$/, use: 'babel-loader', exclude: /node_modules/ },
        ]
    },
    devtool: isProd ? false : 'source-map'
}
