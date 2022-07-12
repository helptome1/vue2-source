import { createElementVNode, createTextVNode } from "./vdom"

export function initLifeCycle(Vue) {
  // _update接收一个dom节点。
  Vue.prototype._update = function (vnode) {
    
    console.log('_update',vnode)
  }
  /**
   * 底下的这些_c，_v, _s都是用来转换dom节点的。
   * 
   */
  // _c('div', {}, ...children)
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments)
  }
  // _v(text)
  Vue.prototype._v = function () {
    return  createTextVNode(this, ...arguments)
  }
  // 
  Vue.prototype._s = function (value) {
    if(typeof value != 'object') {return value}
    return JSON.stringify(value)
  }
  Vue.prototype._render = function () {
    const vm = this
    // 使用call让with中的this指向vm
    return vm.$options.render.call(vm)
  }
}

export function mountComponent(vm, el) {
  // 1. 调用render方法产生虚拟节点，虚拟DOM
  // vm._render() = vm.$options.render() 虚拟节点
  // vm._update就是把虚拟节点变成真实的节点。
  vm._update(vm._render())
  // 2. 根据虚拟DOM产生真是DOM

  // 3. 插入到el元素中
}

// vue的核心：1。创建了响应式数据；2.html模版转换成ast语法树；
// 3.将ast语法树转换为render函数；4.后续每次更新html只需要执行render函数（无需再次执行ast语法树），节省性能。
// 重点：render函数会产生虚拟节点。（使用响应式数据）
// 5. 根据生成的虚拟节点创建真是的dom
