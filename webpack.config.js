const path = require('path')
const htmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode:'development',
    entry:path.resolve(__dirname, './src/main.js'),

    plugins:[
        new htmlWebpackPlugin({//创建内存中生成 html 页面的插件
            template:path.resolve(__dirname,'./src/index.html'), //指定模板页面，根据这个页面生成内存中的页面
            filename:'index.html'
        })
    ],
    module:{//用于配置所有第三方模块加载器
        rules:[
            {
                test:/\.css$/,
                use:['style-loader','css-loader']
            }
        ]
    }
}