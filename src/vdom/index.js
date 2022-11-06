// h()  _C()都是这个方法
export function createElementVNode(vm, tag, data = {}, ...chidren) {
  if (data == null) {
    data = {}
  }
  let key = data.key
  !!key && delete data.key

  return vNode(vm, tag, key, data, chidren)
}

// _v();
export function createTextVNode(vm, text) {
  return vNode(vm, undefined, undefined, undefined, undefined, text)
}

// ast做的是语法层面的转换，它描述的是语法本身；（可以描述js，css，html）
// 而vNode的虚拟dom是描述dom的元素，可以增加一些自定义属性。（只描述dom元素）
function vNode(vm, tag, key, data, children, text) {
  return {
    vm,
    tag,
    key,
    data,
    children,
    text
    // 事件，插槽，等等一系列
  }
}

// 判断两个节点是否是同一个
export function isSameVnode(oldVnode, newVnode) {
  return newVnode.tag === oldVnode.tag && newVnode.key === oldVnode.key
}