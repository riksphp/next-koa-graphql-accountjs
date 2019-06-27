const withPlugins = require("next-compose-plugins");
const offline = require("next-offline");
const pino = require("next-pino");

const nextConfig = {
  webpack(config, options) {
    return config;
  }
};

module.exports = withPlugins([[offline], [pino]], nextConfig);
