// webpack.config.babel.js
'use strict';
import webpack from 'webpack';
import EnvConfig from './config.json';

const isProd = process.env.NODE_ENV === 'production';
const WDS_PORT = 7000;
const nodeEnv = process.env.NODE_ENV || EnvConfig.NODE_ENV || 'develop';
const plugins = [
    new webpack.EnvironmentPlugin(Object.assign({}, EnvConfig, {NODE_ENV: nodeEnv})),
];

export default {
    entry: {
        bundle: ['babel-polyfill', './src/client'],
    },
    output: {
        filename: '[name].js',
        path: `${__dirname}/dist/client/`,
        publicPath: isProd ? `/` : `http://localhost:${WDS_PORT}/`,
    },
    module: {
        rules: [
            { test: /\.(js|jsx)$/, use: 'babel-loader', exclude: /node_modules/ },
        ]
    },
    mode: isProd ? 'production' : 'development',
    plugins: plugins,
    devtool: isProd ? false : 'source-map',
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
          react: `${__dirname}/node_modules/react`,
        },
    },
    devServer: {
        port: WDS_PORT,
    }
}
