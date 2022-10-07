// 获取 数组的原型
let oldArrayProto = Array.prototype

// 拷贝一份数组原型，修改数组方法，不会影响Array的方法。
export let newArrayProto = Object.create(oldArrayProto)

// 这里是改变元素组的方法。
let methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice']

methods.forEach((method) => {
  newArrayProto[method] = function (...args) {
    // 这里重写了数组的方法。
    // 调用原型上的方法。
    // 这里的this指向的是谁调用的，this指向arr
    const result = oldArrayProto[method].call(this, ...args)
    // 需要对新增的数据再次劫持。
    let inserted
    let ob = this.__ob__
    switch (method) {
      case 'push':
        break
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
      default:
        break
    }
    if (inserted) {
      // 对新增的数组内容再次劫持
      ob.observeArray(inserted)
    }

    // 数组变化了，通知对应的wathcer实现更新逻辑
    ob.dep.notify()

    return result
  }
})
