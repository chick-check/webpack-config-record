## webpack 构建说明
1. 创建项目目录
- test
  - dist
  - src
    - css
    - js
    - images
    - main.js
    - index.html

2. 初始化项目 `npm init -y` ,会生成 package.json 文件
3. 安装 webpack 和 webpack-cli(用于在命令行执行 webpack) `npm install webpack webpack-cli --save-dev`; 当前版本：webpack@4.29.6 / webpack-cli@3.2.3 生成package-lock.json 和 node_modules
4. 编写 index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <script src = "./main.js"></script>
</body>
</html>
```
5. 然后可以通过 `webpack ./src/main.js  --mode development` 将./src/main.js文件打包到 ./dist/main.js; webpack4 默认了打包到的路径，所以像之前的写法会报错。
6. 每次都通过 `webpack ./src/main.js  --mode development`  打包很麻烦，所以把配置文件写好，然后直接执行 `webpack` 就好啦。
7. 编写 webpack 配置文件 webpack.config.js，先根目录添加，在编写。
```javascript
const path = require('path')

module.exports = {
    mode:'development',
    entry:path.resolve(__dirname, './src/main.js')
}
```
8. 试试在 main.js 里写些代码，看能不能渲染到页面上去呢？
```javascript
/*
 1、首先安装 jquery: npm i jquery
 2、然后导入
 */
import $ from 'jquery'


$(function(){
    $('#tt').css('backgroundColor','lightblue')
})
```
9. `webpack --watch` 可以实时监听，修改保存后自动打包。 
10. 使用 webpack-dev-server 工具也可以实现自动打包编译的功能。这个工具的用法和 webpack 一样。
     安装webpack-dev-server `npm i webpack-dev-server -D` ，这是项目中安装的，所以无法把 webpack-dev-server 当成命令在终端执行。
 	此时在 package.json 配置，之后可以直接执行`npm run build` 执行 webpack-dev-server，--open 打开本地浏览器 --port 3000 设置端口号 --contentBase 设置路径  --hot 热更新(热更新可以实现编译时部分更新；页面异步更新，而不是刷新整个页面) ;再执行 `npm run build` 试试。
 ```json
    "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "webpack-dev-server --open --port 3000 --contentBase src --hot"
  }
 ```
 到这里也只是完成了自动编译的功能，修改 main.js 文件并没有实现打包到 dist/main.js，为什么呢？
 一下为执行`npm run build` 时的输出信息，可以看出 webpack 被托管于跟目录，这是因为通过webpack-dev-server 打包的main.js 文件，并没有存到实际的物理磁盘中，而是托管到电脑内存中，所以在项目根目录上，也找不到打包好的 main.js 文件。
 > test@1.0.0 build /Users/weichaofang/workspaces/test
> webpack-dev-server

ℹ ｢wds｣: Project is running at http://localhost:8080/
ℹ ｢wds｣: webpack output is served from /
ℹ ｢wdm｣: Hash: 0122b3897faa80afb5e2

所以修改html 的引入路径，就可以实现效果了。
这么做可以提升速度，还不消耗磁盘。
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <div id = "app">
        <h1 id ='tt'>hello</h1>
    </div>
    <script src="/main.js"></script> <!--引入内存里的 js 文件-->
</body>
</html>
```
 11. 既然引入的是内存中的 js 文件，那能不能把 html 页面也放到内存中呢？
 使用 html-webpack-plugin 可以实现
   * 首先安装插件 `npm i  html-webpack-plugin -D`
   * 配置 webpack.config.js 文件
```javascript
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
    ]
} 
```
使用html-webpack-plugin，可以自动在内存中根据指定页面生成内存中的页面；自动把打包好的 main.js 文件追加到页面中，所以不需要指明页面中 js 文件的引用路径。

12. 在 main.js 中使用 import 引入样式表，保存之后会报错误。
```javascript
//试试 jQuery
/*
 1、首先安装 jquery: npm i jquery
 2、然后导入
 */
import $ from 'jquery'
import './css/index.css'

$(function(){
    $('#tt').css('backgroundColor','red')
})
```
这是因为webpack 默认只处理 js 文件，无法处理其他非 js 文件；此时需要手动安装第三方 loader 加载器; 
`npm install -g cnpm --registry=https://registry.npm.taobao.org`
`cnpm i style-loader css-loader -D`
之后在配置文件里配置
```javascript
  module:{
        rules:[
            {
                test:/\.css$/,
                use:['style-loader','css-loader']
            },
            {
                test:/\.scss/,
                use:['style-loader','css-loader','sass-loader']
            },
            { /*
                //webpack 的 css 不能处理 url ,包括图片和字体，所以需要第三方加载器。limit 给定图片大小，单位 byte,
                  如果引入的图片大于等于limit值，不会转化成 base64;name 表示名字和后缀不进行哈希转换，和原来的保持一致;
                  可是hash 保证的图片重名也不会有错，所以还是需要的，可以截取前8位hash值
                */
                test:/\.(jpg|png|gif|bmp|jpeg)$/, 
                use:'url-loader?limit=7632&name=[hash:8]-[name].[ext]'
            },
            {
                test:/\.(ttf|eot|svg|woff|woff2)$/, 
                use:'url-loader'
            },
            {
                test:/\.js$/,
                use:'babel-loader',
                exclude:/node_modules/ //仅转换自己写的 js 文件，排除 node_modules 里的 js 文件
            }
        ]
    } 
```
13. webpack ,默认只能处理部分 es6新语法，此时需要借助 第三方 loader 帮助处理成低级语法，之后把结果交给 webpack 打包给 main.js
- `cnpm i babel-core babel-loader babel-plugin-transform-runtime -D` 
- `cnpm i babel-preset-env babel-preset-stage-0 -D`
- 之后在 webpack 配置文件 module 节点 rules 数组中，添加新的匹配规则在项目根目录，新建 .babelrc 的 Babel 的配置文件，这个配置文件是 json 格式，不能写注释，字符串必须用双引号。【语法】【插件】 是不含 babel-loader 和 babel-preset 的后面部分。
```json
{
    "plugins": ["transform-runtime"],
    "presets": ["env","stage-0"]
}
```

注意：export default 和 export 是es6 向外暴露成员的方式，两个方式可以一起用，但是export default只能暴露一次，接收时，参数随意；export可以多次暴露，名称不一样，用{名称} 接收，名称 必须和定义时候的一样；module.exports={} 和 exports 是node 向外暴露成员的方式；
导入模块：es6 是 import xx from xx；node 是 var a = require('模块标识符')