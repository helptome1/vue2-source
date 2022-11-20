// h()  _C()都是这个方法

const isReservedTag = (tag) => {
  return ['a', 'div', 'p', 'ul', 'li', 'span', 'button', 'input', 'br', 'ol'].includes(tag)
}

export function createElementVNode(vm, tag, data = {}, ...chidren) {
  if (data == null) {
    data = {}
  }
  let key = data.key
  !!key && delete data.key

  if (isReservedTag(tag)) {
    return vNode(vm, tag, key, data, children)
  } else {
    // Ctor就是组件的定义， 可能是一个sub类，也可能是一个组件的obj选项。
    let Ctor = vm.$options.components[tag]
    return createComponent(vm, tag, data, key, children, Ctor)
  }
}

function createComponent(vm, tag, data, key, children, Ctor) {
  if (typeof Ctor === 'object') {
    Ctor = vm.$options._base.extend(Ctor)
  }
  data.hook = {
    // 稍后调用组件真实节点的时候， 如果是组件则调用此init方法。
    init(vnode) {
      // 保存组件的实例到虚拟节点上。
      let instance = vnode.componentInstance = new vnode.componentOptions.Ctor
      instance.$mount();
    }
  }
  return vNode(vm, tag, key, children, null, { Ctor })
}

// _v();
export function createTextVNode(vm, text) {
  return vNode(vm, undefined, undefined, undefined, undefined, text)
}

// ast做的是语法层面的转换，它描述的是语法本身；（可以描述js，css，html）
// 而vNode的虚拟dom是描述dom的元素，可以增加一些自定义属性。（只描述dom元素）
function vNode(vm, tag, key, data, children, text, componentOptions) {
  return {
    vm,
    tag,
    key,
    data,
    children,
    text,
    componentOptions // 包含组件的构造函数
    // 事件，插槽，等等一系列
  }
}

// 判断两个节点是否是同一个
export function isSameVnode(oldVnode, newVnode) {
  return newVnode.tag === oldVnode.tag && newVnode.key === oldVnode.key
}
