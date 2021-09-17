/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { deepAssign } = require('@seismic/browser-utils');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { getBaseWebpackConfig, getBabelOptions } = require('./baseConfigs');

module.exports = (_, argv) => {
    const mode = argv.mode || 'production';
    const babelOptions = getBabelOptions({
        isProduction: mode === 'production',
        useBuiltIns: 'usage',
        corejs: '3',
    });
    const config = getBaseWebpackConfig({ mode, babelOptions });

    return deepAssign(config, {
        entry: path.resolve(__dirname, '../src/app/StandaloneWrapper'),
        output: {
            path: path.join(config.output.path, 'standalone'),
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, '../public/index.html'),
            }),
        ],
    });
};
