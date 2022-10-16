const path = require('path');
const fs = require('fs');
const nodeModulesPath = path.join(process.cwd(), 'public','preload.js');

class PreloadPlugin{
    apply(compiler){
        compiler.hooks.done.tapAsync("PreloadPlugin",(compilation,next)=>{
            console.log(nodeModulesPath);

            const exec = require('child_process').exec;
            exec(`yarn install`,{
                cwd: path.join(process.cwd(), 'dist')
            },function (){
                console.log('preload.js install success');
                next();
            });

            // const webpack = require('webpack');
            //
            // webpack({
            //     entry: nodeModulesPath,
            //     output: {
            //         path: __dirname + "/dist",
            //         filename: "preload_[name].js",
            //         publicPath: '/'
            //     },
            //     optimization: {
            //         minimize: false,
            //         splitChunks: {
            //             cacheGroups: {
            //                 vendors: {
            //                     // 和 CommonsChunkPlugin 里的 minChunks 非常像，用来决定提取哪些模块
            //                     // 可以接受字符串，正则表达式，或者函数，函数的一个参数是 module，第二个参数为引用这个 module 的 chunk（数组）
            //                     test: /[\\/]node_modules[\\/]/,
            //                     // 优先级高的 Chunk 为被优先选择，优先级一样的话，`size` 大的优先被选择
            //                     priority: -10
            //                 },
            //                 default: {
            //                     minChunks: 2,
            //                     priority: -20,
            //                     //当 module 未变时，是否可以使用之前的 Chunk
            //                     reuseExistingChunk: true
            //                 }
            //             }
            //         }
            //     },
            // }, (err, stats) => {
            //     if (err || stats.hasErrors()) {
            //         // 构建过程出错
            //         console.error(err);
            //     }
            //     // 成功执行完构建
            //     // console.log(stats);
            //     next();
            // });

            // require('@vercel/ncc')(nodeModulesPath, {
            //     // provide a custom cache path or disable caching
            //     cache: false,
            //     // externals to leave as requires of the build
            //     externals: ["externalpackage"],
            //     // directory outside of which never to emit assets
            //     filterAssetBase: process.cwd(), // default
            //     minify: false, // default
            //     sourceMap: false, // default
            //     assetBuilds: false, // default
            //     sourceMapBasePrefix: '../', // default treats sources as output-relative
            //     // when outputting a sourcemap, automatically include
            //     // source-map-support in the output file (increases output by 32kB).
            //     sourceMapRegister: true, // default
            //     watch: false, // default
            //     license: '', // default does not generate a license file
            //     v8cache: false, // default
            //     quiet: false, // default
            //     debugLog: false // default
            // }).then(({ code, map, assets , symlinks, stats }) => {
            //
            //     fs.writeFileSync(path.join(process.cwd(),'dist', 'preload.js'), code, 'utf-8');
            //
            //     next();
            // })
        })
    }
}

module.exports = PreloadPlugin;  //插件导出
