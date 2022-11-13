import { mergeOptions } from './utils'

export function initGlobalAPI(Vue) {
  Vue.options = {
    _base: Vue,
  }
  Vue.mixin = function (mixin) {
    // debugger
    // 把用户选项和全局的options合并
    this.options = mergeOptions(this.options, mixin)
    return this
  }

  // 可以手动创建一个组件的构造函数，可以手动创建一组件进行挂载。
  Vue.extend = function (options) {
    // 根据用户的参数返回一个构造函数。
    function Sub(options = {}) {
      // 默认对子类进行初始化操作
      this._init(options)
    }
    // 继承Vue的原型 等于 Sub.prototype.__proto__ = Vue.prototype
    Sub.prototype = Object.create(Vue.prototype)
    Sub.prototype.constructor = Sub
    // 将用户传递的参数和全局的参数进行合并。
    Sub.options = mergeOptions(Vue.options, options)
    Sub.options = options
    return Sub
  }
  // 全局的指令， Vue.options.directives
  Vue.options.components = {}
  Vue.component = function (id, definition) {
    // 如果definition是一个对象，就是一个组件的定义，如果是一个函数，就是一个组件的构造函数(说明用户自己调用了Vue.extend)。
    definition = typeof definition === 'function' ? definition : Vue.extend(definition)
    // 2.注册组件
    Vue.options.components[id] = definition

  }
}
