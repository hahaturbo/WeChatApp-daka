const path = require('path');
const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const {
  AddEntryPlugin,
  CopyDependentFilePlugin,
} = require('./webpack_plugins');
const OUTPUT_PATH = 'output_resource';
const CLIENT_SRC_PATH = path.resolve(__dirname, 'src');
const PUBLIC_PATH = 'https://wxda.hahaturbo.site';

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const commonConfig = {
    mode: argv.mode,
    context: CLIENT_SRC_PATH,
    entry: {
      app: path.join(CLIENT_SRC_PATH, 'app.ts'),
    },
    output: {
      filename: '[name].js',
      publicPath: `/${PUBLIC_PATH}/`,
      path: path.resolve(__dirname, OUTPUT_PATH),
      globalObject: 'wx',
    },
    plugins: [
      new CleanWebpackPlugin(),
      new AddEntryPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].wxss',
      }),
      new CopyDependentFilePlugin({
        output: path.resolve(__dirname, OUTPUT_PATH),
        input: CLIENT_SRC_PATH,
        imageLimit: 300,
      }),
    ],
    module: {
      rules: [
        {
          test: /\.(j|t)s$/,
          loader: 'babel-loader',
        },
        {
          test: /\.wxs$/,
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
          },
        },
        {
          test: /\.(wx|le)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  config: path.resolve(__dirname, './postcss.config.js'),
                },
              },
            },
            'less-loader',
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js', '.less', '.wxss', '.d.ts'],
      alias: {
        components: path.resolve(CLIENT_SRC_PATH, 'components'),
        static: path.resolve(CLIENT_SRC_PATH, 'static'),
        utils: path.resolve(CLIENT_SRC_PATH, 'utils'),
      },
    },
    optimization: {
      minimizer: [
        new CssMinimizerPlugin({
          test: /\.(le|wx)ss$/,
        }),
      ],
    },
  };

  let config;
  if (isProduction) {
    config = merge(commonConfig, {});
  } else {
    config = merge(commonConfig, {
      devtool: 'eval-source-map',
    });
  }

  return config;
};
