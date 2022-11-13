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
export function patchProps(el, oldProps = {}, props = {}) {
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
/**
 * -----------------diff算法的核心所在-----------------
 * 比较新旧虚拟节点
 * @param {*} oldVnode 旧的虚拟节点
 * @param {*} vnode 新的虚拟节点
 * @returns 节点
 */
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

  // 3. 比较儿子节点，一方有，一方没有儿子；或者两方都有儿子。
  let oldChildren = oldVnode.children || []
  let newChildren = vnode.children || []
  // 3.1 两方都有儿子，需要比较儿子的差异。
  if (oldChildren.length > 0 && newChildren.length > 0) {
    // 完整的diff算法。
    updateChildren(el, oldChildren, newChildren)
  }
  // 3.2新的有儿子，老的没有，挂载dom
  else if (newChildren.length > 0) {
    mountChildren(el, newChildren)
  }
  // 3.3老的有儿子，新的没有，删除
  else if (oldChildren.length > 0) {
    el.innerHTML = '' //也可以循环删除。
  }
  return el
}

// 给节点新增儿子dom
function mountChildren(el, newChildren) {
  for (let i = 0; i < newChildren.length; i++) {
    let child = newChildren[i]
    el.appendChild(createElm(child))
  }
}

// ------------- diff算法的核心 ----------------
// 对比儿子节点的差异
function updateChildren(el, oldChildren, newChildren) {
  // 我们为了比较两个儿子，增高性能，会使用一些性能优化。
  // vue2中采用双指针的方式比较。
  let oldStartIndex = 0,
    newStartIndex = 0
  let oldEndIndex = oldChildren.length - 1
  let newEndIndex = newChildren.length - 1

  let oldStartVnode = oldChildren[0]
  let newStartVnode = newChildren[0]

  let oldEndVnode = oldChildren[oldEndIndex]
  let newEndVnode = newChildren[newEndIndex]

  function makeIndexByKey(oldChildren) {
    let map = {}
    oldChildren.forEach((item, index) => {
      map[item.key] = index
    })
    return map
  }
  let oldVnodeMap = makeIndexByKey(oldChildren)
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 比对方法，1）头和头比，2）头和尾比，3）交叉比对（尾和头比，尾和尾比）。4）乱序对比。
    // 新旧节点双方，有一方 头指针，大于尾部指针，就停止循环。
    // 首先判断节点为空的情况，如果为空，就跳过。
    if (!oldStartVnode) {
      oldStartVnode = oldChildren[++oldStartIndex]
    } else if (!oldEndVnode) {
      oldEndVnode = oldChildren[--oldEndIndex]
    }
    // 1. 从头开始比较，如果头指针相同，就比较下一个。
    else if (isSameVnode(oldStartVnode, newStartVnode)) {
      // 如果是同一个节点，就递归比较儿子节点。
      patchVnode(oldStartVnode, newStartVnode) // 比较儿子节点
      oldStartVnode = oldChildren[++oldStartIndex]
      newStartVnode = newChildren[++newStartIndex]
    }

    // 2. 从尾开始比较，如果尾指针相同，就比较下一个。
    else if (isSameVnode(oldEndVnode, newEndVnode)) {
      // 如果是同一个节点，就递归比较儿子节点。
      patchVnode(oldEndVnode, newEndVnode) // 比较儿子节点
      oldEndVnode = oldChildren[--oldEndIndex]
      newEndVnode = newChildren[--newEndIndex]
    }

    // 3. 交叉比较，尾和头比，尾和尾比。
    // 3.1 旧节点的尾和新节点的头比较。
    else if (isSameVnode(oldEndVnode, newStartVnode)) {
      patchVnode(oldEndVnode, newStartVnode)
      // 将老的尾部节点移动到头部。这样后序只需要移动老节点的头部指针就可以了
      el.insertBefore(oldEndVnode.el, oldStartVnode.el)
      oldEndVnode = oldChildren[--oldEndIndex]
      newStartVnode = newChildren[++newStartIndex]
    }
    // 3.2 旧节点的头和新节点的尾比较。
    else if (isSameVnode(oldStartVnode, newEndVnode)) {
      patchVnode(oldStartVnode, newEndVnode)
      // 将老的头部节点移动到尾部节点的下一个节点之前就可以了。这样后序只需要移动老节点的尾部指针就可以了
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
      oldStartVnode = oldChildren[++oldStartIndex]
      newEndVnode = newChildren[--newEndIndex]
    }
    // 3.3 乱序比较
    else {
      // 在给动态列表添加key的时候，要避免使用索引，因为索引是从0开始的，可能会发生错误的复用。
      // 根据老的节点制作一个映射关系表，用新的去找，找到则移动；找不到则创建新的节点，添加。最后多余的删除。
      let moveIndex = oldVnodeMap[newStartVnode.key]
      if (moveIndex !== undefined) {
        let movevNode = oldChildren[index]
        oldChildren[index] = undefined
        el.insertBefore(movevNode.el, oldStartVnode.el)
        patchVnode(movevNode, newStartVnode)
      } else {
        el.insertBefore(createElm(newStartVnode), oldStartVnode.el)
      }
      newStartVnode = newChildren[++newStartIndex]
    }
  }
  // 1. 如果新的节点比旧的节点长，就将多余的节点添加到旧的节点后面。
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      let childEle = createElm(newChildren[i])
      // 从头部循环和从尾部循环的插入方式不太一样，所以需要判断一下。
      // 获取一下newStartVnode的下一个节点，如果没有，就是从头循环。如果有就是从尾循环。
      let anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null // 获取下一个节点。
      // 需要理解的一点是anchor为空时，insetBefore会自动插入到最后。
      el.insertBefore(childEle, anchor)
    } 
  }
  // 2. 如果新的节点比旧的节点短，就将旧的多余的节点删除。
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      if(oldChildren[i] !== undefined) {
        el.removeChild(oldChildren[i].el)
      }
    }
  }
}
