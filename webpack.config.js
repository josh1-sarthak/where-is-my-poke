const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/where-is-my-poke/",
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new CopyPlugin({
      patterns: [{ from: "public/images", to: "images" }],
    }),
    new Dotenv({
      systemvars: true, // This is the magic line!
    }),
  ],
  module: {
    rules: [{ test: /\.css$/, use: ["style-loader", "css-loader"] }],
  },
};
