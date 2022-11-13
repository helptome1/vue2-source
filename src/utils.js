
// 静态方法
// 1. 策略模式---->使用策略减少if else
// 2. 创建生命周期
const strats = {}
const LIFECYCLE = ['beforeCreate', 'created']
LIFECYCLE.forEach((hook) => {
  strats[hook] = function (p, c) {
    // 1. {} {created: function() {}} => {created: [fn]}
    // 2. {created: [fn]} {created: function() {}} => {created: [fn, fn]}
    if (c) {
      //如果有儿子
      if (p) {
        // 如果有父亲, 优先使用呢儿子的方法，所以使用覆盖。
        return p.concat(c)
      } else {
        // 只有儿子
        return [c]
      }
    } else {
      // 没有儿子
      return p
    }
  }
})

strats.components = function (parentVal, childVal) {
  // 组件的合并策略
  const res = Object.create(parentVal)
  if (childVal) {
    for (let key in childVal) {
      res[key] = childVal[key] // 返回的是构造函数的
    }
  }
  return res
}

export function mergeOptions(parent, child) {
  const options = {}
  for (let key in parent) {
    mergeField(key)
  }
  for (let key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key)
    }
  }

  function mergeField(key) {
    // 使用策略模式，减少if else
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key])
    } else {
      options[key] = child[key] || parent[key] // 优先采用儿子，再采用父亲
    }
  }
  return options
}
