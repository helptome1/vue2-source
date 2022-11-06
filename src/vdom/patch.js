import { isSameVnode } from './index'

// 创建真实的dom，将虚拟节点变成真实的节点。
export function createElm(vnode) {
  let { tag, data, children, text } = vnode
  if (typeof tag === 'string') {
    //tag如果是标签
    // 这里把虚拟节点和真实节点联系起来。
    vnode.el = document.createElement(tag)
    // 更新data中的属性。
    patchProps(vnode.el, {}, data)
    // 如果有children，就使用递归来循环创建children里面的内容
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child))
    })
  } else {
    // 如果是文本
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}

/**
 * 比较新旧节点的属性和样式，进行属性的赋值操作。
 * @param {*} el dom节点
 * @param {*} props 属性
 */
export function patchProps(el, oldProps, props) {
  let oldStyles = oldProps.style || {}
  let newStyles = props.style || {}
  // 老的样式对象中有，新的样式对象中没有，要删除老的样式中的属性。
  for (let key in oldStyles) {
    if (!newStyles[key]) {
      el.style[key] = ''
    }
  }
  // 老的属性中有该属性。
  for (let key in oldProps) {
    // 新的属性中没有
    if (!props[key]) {
      // 则删除节点上的属性。
      el.removeAttribute(key)
    }
  }
  // 设置样式和属性。
  for (let key in props) {
    if (key === 'style') {
      // style: {color: 'red'}
      for (let styleName in props.style) {
        el.style[styleName] = props.style[styleName]
      }
    } else {
      el.setAttribute(key, props[key])
    }
  }
}
/**
 * 用于更新dom节点，比较虚拟节点。
 * @param {*} oldVnode 旧的dom节点
 * @param {*} vnode 新的dom节点
 */
export function patch(oldVnode, vnode) {
  // 写的是初渲染流程
  const isRealElement = oldVnode.nodeType
  if (isRealElement) {
    const elm = oldVnode
    const parentElm = elm.parentNode //拿到父级元素。==> body
    const newEle = createElm(vnode)
    parentElm.insertBefore(newEle, elm.nextSibing)
    parentElm.removeChild(elm)
    return newEle
  } else {
    patchVnode(oldVnode, vnode)
  }
}

function patchVnode(oldVnode, vnode) {
  // 1. 先判断两个节点是否是同一个节点。如果是同一个节点就删除老节点，换上新的真实节点。
  if (!isSameVnode(oldVnode, vnode)) {
    // tag == tag, key == key
    let el = createElm(vnode)
    oldVnode.el.parentNode.replaceChild(el, oldVnode.el)
    return el
  }
  // 2. 当两个节点是一个节点，比较两个节点的属性差异（复用老的节点，将新的属性添加上去。）
  // 2.1 文本需要特殊处理, 比较一下文本的内容，复用老的节点。
  let el = (vnode.el = oldVnode.el)
  if (!oldVnode.tag) {
    if (oldVnode.text !== vnode.text) {
      el.textContent = vnode.text // 用新的文本覆盖掉老的文本
    }
  }
  // 2.2 是标签时，我们需要比较标签的属性。
  patchProps(el, oldVnode.data, vnode.data)

  // 3. 比较儿子节点，一方有，一方没有儿子；或者两房都有儿子。
  let oldChildren = oldVnode.children || []
  let newChildren = vnode.children || []

  if (oldChildren.length > 0 && newChildren.length > 0) {
    // 完整的diff算法。
    updateChildren(el, oldChildren, newChildren)
  }
  // 新的有，老的没有，挂载dom
  else if (newChildren.length > 0) {
    mountChildren(el, newChildren)
  }
  // 老的有，新的没有，删除
  else if (oldChildren.length > 0) {
    el.innerHTML = '' //也可以循环删除。
  }
  return el
}

function mountChildren(el, newChildren) {
  for (let i = 0; i < newChildren.length; i++) {
    let child = newChildren[i]
    el.appendChild(createElm(child))
  }
}

function updateChildren(el, oldChildren, newChildren) {
  // 我们为了比较两个儿子，增高性能，会使用一些性能优化。
  // vue2中采用双指针的方式比较。
  let oldStartIndex,
    newStartIndex = 0
  let oldEndIndex = oldChildren.length - 1
  let newEndIndex = newChildren.length - 1

  let oldStartVnode = oldChildren[0]
  let newStartVnode = newChildren[0]

  let oldEndVnode = oldChildren[oldEndIndex]
  let newEndVnode = newChildren[newEndIndex]

  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 双方有一方头指针，大于尾部指针，就停止循环。
    // 1. 从头开始比较，如果头指针相同，就比较下一个。
    
  }

}
