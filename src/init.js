import { initState } from "./state"

// 通过导出方法给vue添加方法 
export function initMixin(Vue) {
  // 给vue添加一个用于初始化操作的_init方法
  Vue.prototype._init = function (options) {
    const vm = this
    // 使用vue时的$nextTick()，$data等等，将用户的选项挂载到实例上
    vm.$options = options
    // 初始化状态
    initState(vm)
  }
}
