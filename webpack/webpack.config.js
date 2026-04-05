const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = (env, argv) => {
  const isProd = argv.mode === "production";

  return {
    entry: {
      app: "./webpack/js/main.js",
      "data-viz": "./webpack/js/shiny.js",
      styles: "./webpack/scss/main.scss",
    },
    output: {
      path: path.resolve(__dirname, "src/static/gen"),
      filename: "[name].js",
    },
    devtool: isProd ? false : "cheap-module-source-map",
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
        {
          test: /\.scss$/,
          use: [MiniCssExtractPlugin.loader, { loader: "css-loader", options: { url: false } }, "sass-loader"],
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, { loader: "css-loader", options: { url: false } }],
        },
        {
          test: /\.(woff2?|ttf|eot|svg|png|jpe?g|gif)$/,
          type: "asset/resource",
          generator: {
            filename: "fonts/[name][ext]",
          },
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "styles.css",
      }),
    ],
    optimization: {
      minimizer: ["...", new CssMinimizerPlugin()],
    },
  };
};
