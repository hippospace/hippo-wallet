const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  webpack: {
    configure: (config) => {
      const rules = config.module.rules
        .find((rule) => typeof rule.oneOf === 'object')
        .oneOf.filter((rule) => Array.isArray(rule.use));

      rules.forEach((rule) => {
        rule.use.forEach((moduleLoader) => {
          if (moduleLoader?.loader?.includes('resolve-url-loader'))
            moduleLoader.options.sourceMap = false;
        });
      });

      config.plugins.push(
        new NodePolyfillPlugin({
          excludeAliases: ['console'],
          resolve: {
            fallback: {
              fs: false,
              readline: false,
              path: require.resolve('path-browserify')
            }
          }
        })
      );

      return config;
    }
  }
};
