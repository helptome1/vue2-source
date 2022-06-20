import babel from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve';
// rollup默认导出一个对象，作为打包的配置文件
export default {
  // 打包的入口文件
  input: 'src/index.js',
  // 打包的出口文件
  output: {
    file: './dist/vue.js',
    // 在全局实例上增加一个属性,global.Vue
    name: 'Vue',
    // 打包的格式esm，es6模块，commonjs模块 iife自执行函数，umd支持commonjs和amd规范
    format: 'umd',
    // 希望可以调试代码
    sourcemap: true,
  },
  plugins:[
    babel({
      exclude: "node_modules/**", //排除 node_modules 所有文件
    }),
    nodeResolve()
  ]
}