/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { jsFileExtensions } = require('@seismic/toolchain/fileExtensions');
const { browserList } = require('@seismic/toolchain/browserList');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const postCssFlexbugsFixes = require('postcss-flexbugs-fixes');
const postCssPresetEnv = require('postcss-preset-env');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpack = require('webpack');
const packageJson = require('../package.json');

const srcDir = path.resolve(__dirname, '../src');

function getStyleLoaders({ isProduction, useSass, ...cssLoaderOptions } = {}) {
    cssLoaderOptions = {
        ...cssLoaderOptions,
        importLoaders: useSass ? 3 : 1,
        sourceMap: !isProduction,
    };

    const loaders = [
        { loader: MiniCssExtractPlugin.loader },
        {
            // "css-loader" resolves paths in CSS and adds assets as dependencies.
            loader: 'css-loader',
            options: cssLoaderOptions,
        },
        {
            // "postcss-loader" applies autoprefixer to our CSS for IE 11 support.
            loader: 'postcss-loader',
            options: {
                postcssOptions: {
                    plugins: [
                        postCssFlexbugsFixes,
                        postCssPresetEnv({
                            autoprefixer: {
                                flexbox: 'no-2009',
                            },
                            browsers: browserList,
                            stage: 3,
                        }),
                    ],
                },
                sourceMap: !isProduction,
            },
        },
    ];

    if (useSass) {
        loaders.push(
            {
                loader: 'resolve-url-loader',
                options: {
                    sourceMap: !isProduction,
                },
            },
            {
                loader: 'sass-loader',
                options: {
                    sourceMap: !isProduction,
                },
            },
        );
    }

    return loaders;
}

function getBabelOptions({ isProduction, ...presetOptions }) {
    return {
        cacheDirectory: true,
        babelrc: false,
        configFile: false,
        compact: false,
        sourceMap: !isProduction,
        plugins: [
            ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
            ['@babel/plugin-transform-typescript', { isTSX: true }],
        ],
        presets: [
            [
                '@babel/preset-env',
                {
                    loose: true,
                    targets: browserList,
                    shippedProposals: true,
                    ...presetOptions,
                },
            ],
        ],
    };
}
exports.getBabelOptions = getBabelOptions;

exports.getBaseWebpackConfig = ({ mode, babelOptions }) => {
    const isProduction = mode === 'production';
    const outputPattern = isProduction
        ? `${packageJson.name}.[name].[contenthash:8].js`
        : `${packageJson.name}.[name].js`;

    return {
        mode: isProduction ? 'production' : 'development',
        // Stop compilation early on errors (prod only).
        bail: isProduction,
        devtool: !isProduction && 'cheap-module-source-map',
        // Use webpack runtime that is compatible with es5.
        target: ['web', 'es5'],
        optimization: {
            minimize: isProduction,
            minimizer: ['...' /* '...' includes default Webpack minimizers */, new CssMinimizerPlugin()],
        },
        output: {
            path: path.resolve(__dirname, '../dist'),
            filename: outputPattern,
            chunkFilename: isProduction ? '[name].[contenthash:8].chunk.js' : '[name].chunk.js',
        },
        resolve: {
            plugins: [new TsconfigPathsPlugin()],
            extensions: jsFileExtensions,
            fallback: isProduction ? undefined : { crypto: false },
        },
        devServer: isProduction
            ? undefined
            : {
                contentBase: '/public/',
                disableHostCheck: true,
                //https: true,
            },
        module: {
            rules: [
                {
                    oneOf: [
                        // "url" loader works like "file" loader except that it embeds assets
                        // smaller than specified limit in bytes as data URLs to avoid requests.
                        // A missing `test` is equivalent to a match.
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            loader: 'url-loader',
                            options: {
                                limit: 10000,
                                name: '[name].[hash:8].[ext]',
                            },
                        },
                        {
                            test: /\.(txt|md)$/i,
                            use: 'raw-loader',
                        },
                        // Process application TypeScript and JavaScript with babel.
                        {
                            test: /\.(ts|tsx|js|jsx|mjs)$/,
                            include: srcDir,
                            use: [
                                {
                                    loader: 'babel-loader',
                                    options: babelOptions,
                                },
                            ],
                        },
                        // Process any JS outside of the app with Babel.
                        // Unlike the application JS, we only compile the standard ES features.
                        {
                            test: /\.(js|mjs)$/,
                            exclude: /@babel(?:\/|\\{1,2})runtime/,
                            loader: 'babel-loader',
                            options: {
                                babelrc: false,
                                configFile: false,
                                compact: false,
                                sourceMap: false,
                                presets: [
                                    [
                                        '@babel/preset-env',
                                        {
                                            loose: true,
                                            targets: { browsers: browserList },
                                        },
                                    ],
                                ],
                            },
                        },
                        // Support for regular CSS.
                        {
                            test: /\.css$/,
                            exclude: /\.module\.css$/,
                            use: getStyleLoaders({ isProduction, modules: false }),
                            // Don't consider CSS imports dead code even if the
                            // containing package claims to have no side effects.
                            // Remove this when webpack adds a warning or an error for this.
                            // See https://github.com/webpack/webpack/issues/6571
                            sideEffects: true,
                        },
                        // Support for CSS modules with the extension .module.css
                        {
                            test: /\.module\.css$/,
                            use: getStyleLoaders({ isProduction, modules: true }),
                        },
                        // Support for SASS (using .scss or .sass extensions).
                        {
                            test: /\.(scss|sass)$/,
                            exclude: /\.module\.(scss|sass)$/,
                            use: getStyleLoaders({ isProduction, modules: false, useSass: true }),
                            sideEffects: true,
                        },
                        // Support for SASS modules with the extensions .module.scss or .module.sass
                        {
                            test: /\.module\.(scss|sass)$/,
                            use: getStyleLoaders({ isProduction, modules: true, useSass: true }),
                        },
                        // When you `import` an asset, you get its filename.
                        // The assets get copied to the `build` folder.
                        // This loader doesn't use a "test" so it will catch all modules
                        // that fall through the other loaders.
                        {
                            loader: 'file-loader',
                            // Exclude `js` files to keep "css" loader working as it injects
                            // its runtime that would otherwise be processed through "file" loader.
                            // Also exclude `html` and `json` extensions so they get processed
                            // by webpacks internal loaders.
                            exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                            options: {
                                name: '[name].[hash:8].[ext]',
                            },
                        },
                        // ** STOP ** Are you adding a new loader?
                        // Make sure to add the new loader before file-loader.
                    ],
                },
            ],
        },
        plugins: [
            // https://webpack.js.org/plugins/define-plugin/
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
            }),
            new MiniCssExtractPlugin({
                filename: isProduction ? '[name].[contenthash:8].css' : '[name].css',
                chunkFilename: isProduction ? '[name].[contenthash:8].chunk.css' : '[name].chunk.css',
            }),
        ],
    };
};
