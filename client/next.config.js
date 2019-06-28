const withPlugins = require("next-compose-plugins");
const offline = require("next-offline");
const pino = require("next-pino");
const withTypescript = require('@zeit/next-typescript');
const withCSS = require("@zeit/next-css");

const nextConfig = {
  distDir: 'build',
  webpack(config, options) {
    config.module.rules.push({
      test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 100000,
          name: '[name].[ext]'
        }
      }
    });
    return config;
  }
};

const cssConfig = {
  cssModules: true,
  cssLoaderOptions: {
    importLoaders: 1,
    localIdentName: '[local]'
  }
}

module.exports = withPlugins([[offline], [pino], [withTypescript], [withCSS, cssConfig]], nextConfig);
