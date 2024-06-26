const path = require("path");
const webpack = require("webpack");

function resolveSrc(_path) {
  return path.join(__dirname, _path);
}
// vue.config.js
module.exports = {
  lintOnSave: true,
  configureWebpack: {
    // Set up all the aliases we use in our app.
    resolve: {
      alias: {
        src: resolveSrc("src"),
        "chart.js": "chart.js/dist/Chart.js",
      },
      fallback: {
        assert: require.resolve("assert"),
        fs: false,
        process: require.resolve("process/browser"),
        url: require.resolve("url"),
        path: require.resolve("path-browserify"),
        module: false,
        v8: false,
        util: require.resolve("util"),
      },
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env": {
          VUE_APP_AWS_ACCESS_KEY_ID: JSON.stringify(
            process.env.VUE_APP_AWS_ACCESS_KEY_ID
          ),
          VUE_APP_AWS_SECRET_ACCESS: JSON.stringify(
            process.env.VUE_APP_AWS_SECRET_ACCESS
          ),
          VUE_APP_BACKEND_URL: JSON.stringify(process.env.VUE_APP_BACKEND_URL),
          VUE_APP_I18N_FALLBACK_LOCALE: JSON.stringify(
            process.env.VUE_APP_I18N_FALLBACK_LOCALE
          ),
          VUE_APP_AWS_REGION: JSON.stringify(process.env.VUE_APP_AWS_REGION),
          VUE_APP_I18N_LOCALE: JSON.stringify(process.env.VUE_APP_I18N_LOCALE),
          PORT: JSON.stringify(process.env.PORT),
        },
      }),
    ],
  },
  pwa: {
    name: "Ramas Bienes Raices",
    themeColor: "#344675",
    msTileColor: "#344675",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "#344675",
  },
  pluginOptions: {
    i18n: {
      locale: "es",
      fallbackLocale: "es",
      localeDir: "locales",
      enableInSFC: false,
    },
  },
  css: {
    // Enable CSS source maps.
    sourceMap: process.env.NODE_ENV !== "production",
  },
};
