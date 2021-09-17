/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { deepAssign } = require('@seismic/browser-utils');
const SeismicBuildWebpackPlugin = require('seismic-build-webpack-plugin');
const { getBaseWebpackConfig, getBabelOptions } = require('./baseConfigs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (_, argv) => {
    const mode = argv.mode || 'production';
    const babelOptions = getBabelOptions({ isProduction: mode === 'production' });
    const config = getBaseWebpackConfig({ mode, babelOptions });

    return deepAssign(config, {
        entry: path.resolve(__dirname, '../src/app/SeismicEmbedWrapper'),
        output: {
            path: path.join(config.output.path, 'seismic'),
            filename({ chunk }) {
                return chunk.name === 'main' ? 'loader.js' : config.output.filename;
            },
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, '../public/seismic-embed.html'),
            }),
        ],
        externals: SeismicBuildWebpackPlugin.prototype.initDefaultOptions().externals,
    });
};
