
const path = require('path');
const fs = require('fs');
const nodeModulesPath = path.join(process.cwd(), 'public','preload.js');
const webpack = require("webpack");
webpack({
    entry: nodeModulesPath,
    output: {
        path: __dirname + "/dist",
        filename: "preload_[name].js",
        publicPath: '/'
    },
    target: 'node',
    optimization: {
        minimize: false,
        splitChunks: {
            cacheGroups: {
                vendors: {
                    // 和 CommonsChunkPlugin 里的 minChunks 非常像，用来决定提取哪些模块
                    // 可以接受字符串，正则表达式，或者函数，函数的一个参数是 module，第二个参数为引用这个 module 的 chunk（数组）
                    test: /[\\/]node_modules[\\/]/,
                    // 优先级高的 Chunk 为被优先选择，优先级一样的话，`size` 大的优先被选择
                    priority: -10
                },
                default: {
                    name: 'common',
                    chunks: 'initial',
                    test: /[\\/]node_modules[\\/]/,
                }
            }
        }
    },
}, (err, stats) => {
    if (err || stats.hasErrors()) {
        // 构建过程出错
        const info = stats.toJson();
        console.error('err',err,info.errors);
    }
    // 成功执行完构建
    // console.log(stats);
});
