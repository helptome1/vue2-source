class Observe {
  constructor(data) {
    // Object.defineProperty只能劫持已经存在的属性，不能劫持新增的属性（为此vue会新增一些方法例如：$set, $delete）
    if (Array.isArray(data)) {
      //  修改数组的每一项时进行修改，不管是基本数据类型，还是引用数据类型。
      this.observeArray(data)
    } else {
      this.walk(data)
    }
  }
  // 遍历对象，对每一个属性进行劫持
  walk(data) {
    Object.keys(data).forEach((key) => {
      defineReactive(data, key, data[key])
    })
  }
  // 遍历数组，对每一项进行劫持
  observeArray(data) {
    data.forEach((item) => observe(item))
  }
}

// 劫持数据，响应式数据， 这是一个闭包
export function defineReactive(target, key, val) {
  // 如果val是对象，则递归调用，劫持对象。
  observe(val)
  // 对对象重新定义了。
  Object.defineProperty(target, key, {
    // 取值的时候
    get() {
      // console.log('用户取值了',key)
      return val
    },
    // 设置或者修改值时执行
    set(newVal) {
      if (val !== newVal) {
        // console.log('用户设置，修改了值')
        // 对修改的对象属性进行劫持。
        observe(newVal)
        val = newVal
      }
    }
  })
}

export function observe(data) {
  // 对这个对象进行劫持
  if (typeof data !== 'object' || data === null) {
    return //只对对象进行劫持
  }
  // 如果一个对象已经被劫持了，那么它就不需要再次被劫持。（判断方法是：添加一个实例，用实例来判断）
  // 新增了Observer实例，判断这个对象是否已经被劫持
  return new Observe(data)
}
