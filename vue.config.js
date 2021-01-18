const webpack = require("webpack");

module.exports = {
  css: {
    loaderOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  configureWebpack: {
    plugins: [new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)]
  },
  devServer: {
    //代理
    // proxy: {
    //   "/api": {
    //     target: "http://localhost:8080",
    //     //拦截并且使用mock数据
    //     bypass: function(req, res) {
    //       if (req.headers.accept.indexOf("html") !== -1) {
    //         console.log("Skipping proxy for browser request.");
    //         return "/index.html";
    //       } else if (process.env.MOCK !== "none") {
    //         // console.log(process.env.SERVER);
    //         if (req.path) {
    //           const name = req.path
    //             .split("/api/")[1]
    //             .split("/")
    //             .join("_");
    //           const mock = require(`./mock/${name}`);
    //           const result = mock(req.method);
    //           delete require.cache[require.resolve(`./mock/${name}`)];
    //           return res.send(result);
    //         }
    //       }
    //     }
    //   }
    // }
  }
};
