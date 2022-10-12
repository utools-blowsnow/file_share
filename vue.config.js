
const PreloadPlugin = require('./build'); // 通过 npm 安装

module.exports = {
  publicPath: './',
  productionSourceMap: false,
  configureWebpack:{
    plugins:[
      new PreloadPlugin()
    ],
  }
}
