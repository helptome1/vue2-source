import { initGlobalAPI } from './gloableAPI'
import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'
import Watcher, { nextTick } from './observe/watcher'

// 使用构造函数的方法创建Vue实例，将所有的方法都耦合起来。
function Vue(options) {
  // 这个_init函数在Vue的原型对象上。
  this._init(options) //用户的配置
}


Vue.prototype.$nextTick = nextTick
initMixin(Vue) // 将initMixin方法添加到Vue的原型上
initLifeCycle(Vue)
initGlobalAPI(Vue) // 初始化api——mixin

Vue.prototype.$watch = function (expOrFn, cb) {
  new Watcher(this, expOrFn, { user: true }, cb)
}

export default Vue
