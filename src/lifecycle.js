import Watch from './observe/watcher'
import { createElementVNode, createTextVNode } from './vdom'
import { patch } from './vdom/patch'

/**
 * 但是现在有个问题，就是每次更新数据都需要手动的去执行_update和_render函数。
 * 为了解决这一问题，引入了观察者模式。为了节约性能，引入了diff算法。
 * @param {*} Vue
 */
export function initLifeCycle(Vue) {
  // _update接收一个dom节点。把虚拟dom装为真实dom
  Vue.prototype._update = function (vnode) {
    // 将虚拟dom转换为真实dom
    const vm = this
    const el = vm.$el

    // 用来判断是否是第一次渲染
    const preVnode = vm._vnode
    vm._vnode = vnode // 把组件第一次产生的虚拟节点保存到_vnode上
    if (preVnode) {
      // 更新, 这里的patch是一个递归的过程，会将虚拟dom转换为真实dom
      patch(preVnode, vnode)
    } else {
      // 第一次渲染
      vm.$el = patch(el, vnode)
    }
  }

  /**
   * 底下的这些_c，_v, _s都是用来转换dom节点的。
   */
  // _c('div', {}, ...children)
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments)
  }

  // _v(text)
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments)
  }

  //
  Vue.prototype._s = function (value) {
    if (typeof value != 'object') {
      return value
    }
    return JSON.stringify(value)
  }
  // 创建虚拟dom
  Vue.prototype._render = function () {
    const vm = this
    // 使用call让with中的this指向vm,并且执行函数
    // console.log('options', vm.$options.render.call(vm))
    return vm.$options.render.call(vm)
  }
}

export function mountComponent(vm, el) {
  // 把el也挂宅到vm实例上
  vm.$el = el
  // 1. 调用render方法产生虚拟节点，虚拟DOM
  // vm._render() = vm.$options.render() 虚拟节点
  // vm._update就是把虚拟节点变成真实的节点。
  const updateComponent = () => {
    vm._update(vm._render())
  }
  // 启动观察者模式
  new Watch(vm, updateComponent, true)
  // 2. 根据虚拟DOM产生真是DOM

  // 3. 插入到el元素中
}

// vue的核心：1。创建了响应式数据；2.html模版转换成ast语法树；
// 3.将ast语法树转换为render函数；4.后续每次更新html只需要执行render函数（无需再次执行ast语法树），节省性能。
// 重点：render函数会产生虚拟节点。（使用响应式数据）
// 5. 根据生成的虚拟节点创建真是的dom

// 调用钩子函数和生命周期
export function callHook(vm, hook) {
  // 调用钩子函数
  const handlers = vm.$options[hook]
  if (handlers) {
    handlers.forEach((handler) => handler.call(vm))
  }
}
