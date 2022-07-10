import { compileToFunctions } from './compiler'
import { initState } from './state'

// 通过导出方法给vue添加方法
export function initMixin(Vue) {
  // 1. 给vue添加一个用于初始化操作的_init方法
  Vue.prototype._init = function (options) {
    const vm = this
    // 使用vue时的$nextTick()，$data等等，将用户的选项挂载到实例上
    vm.$options = options
    // 初始化状态
    initState(vm)

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
        const render = compileToFunctions(template)
        options.render = render // jsx最终会被编译成h('xxx')
      }
    }
    // 最终可以获取到render方法。
    mountComponent(vm, el);// 组件的挂载
  }
}
