import { initState } from './state'
import { compileToFunction } from './compiler/index.js'
import { callHook, mountComponent } from './lifecycle'
import { mergeOptions } from './utils'

// 通过导出方法给vue添加方法
export function initMixin(Vue) {
  // 1. 给vue添加一个用于初始化操作的_init方法
  Vue.prototype._init = function (options) {
    // vm.$options就是获取用户的配置
    // 使用vue时的$nextTick()，$data， $attr等等，将用户的选项挂载到实例上
    const vm = this
    // 我们 定义的全局指令和过滤器。。。都会挂载到实例上。
    // this.constructor.options拿到vue实例的options
    vm.$options = mergeOptions(this.constructor.options, options)
    // 生命周期beforeCreate
    callHook(vm, 'beforeCreate');
    // 初始化状态,挂载数据,计算属性。
    initState(vm)
    callHook(vm, 'created');

    if (options.el) {
      vm.$mount(options.el) //实现数据的挂载
    }
  }

  /**
   * 解析dom元素
   * @param {*} el dom挂载点
   */
  Vue.prototype.$mount = function (el) {
    const vm = this
    el = document.querySelector(el)
    let options = vm.$options
    if (!options.render) {
      //先看一下用户是否传入了render方法
      let template
      // 没有render看一下是否写了template,没写采用外部的template
      if (!options.template && el) {
        template = el.outerHTML
      } else {
        if (el) {
          template = options.template //如果有el采用模板、
        }
      }
      // 如果写了template就需要对模板进行编译，最终生成一个render函数。
      if (template) {
        const render = compileToFunction(template)
        options.render = render // jsx最终会被编译成h('xxx')
      }
    }
    // 最终可以获取到render方法。
    mountComponent(vm, el) // 组件的挂载
  }
}
