const path = require("path");

function resolveSrc(_path) {
  return path.join(__dirname, _path);
}
const devServerPort = Number(process.env.PORT || 8080);
const wdsHost = process.env.WDS_SOCKET_HOST;

// vue.config.js
module.exports = {
  lintOnSave: true,
  devServer: {
    host: "0.0.0.0",
    port: devServerPort,
    allowedHosts: "all",
    client: wdsHost
      ? {
          webSocketURL: {
            protocol: "ws",
            hostname: wdsHost,
            pathname: "/ws",
            port: Number(process.env.WDS_SOCKET_PORT || devServerPort),
          },
        }
      : {
          // Match whatever host/port you used in the browser (localhost vs LAN IP).
          webSocketURL: "auto://0.0.0.0:0/ws",
        },
  },
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
    plugins: [],
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
