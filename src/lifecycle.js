

export function initLifeCycle(Vue) {

}


export function mountComponent(vm, el) {
  // 1. 调用render方法产生虚拟节点，虚拟DOM
  // vm._render() = vm.$options.render() 虚拟节点
  // vm._update就是把虚拟节点变成真实的节点。
  vm._update(vm._render()); 
  // 2. 根据虚拟DOM产生真是DOM

  // 3. 插入到el元素中
}