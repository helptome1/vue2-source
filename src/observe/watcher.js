import Dep from './dep'

let id = 0

// 观察者，观察某个属性的变化。每个属性都有一个dep(被观察者)，watcher就是观察者。属性变化会通知观察者更新。
// 1. 不同的组件有不同的watcher。 目前只有一个，渲染跟实例
class Watch {
  constructor(vm, fn, options) {
    this.id = id++
    this.renderWatcher = options
    this.getter = fn
    this.dep = [] //后续实现计算属性，和一些清理工作时使用。记住dep
    this.depsId = new Set()
    this.get()
  }

  get() {
    Dep.target = this // 静态属性就一份
    this.getter() //回去vm上取值, vm._update(vm._render)
    Dep.target = null
  }

  // 一个组件 对应着多个属性。重复的属性也不用记录。
  addDep(dep) { 
    let id = dep.id
    if (!this.depsId.has(id)) {
      this.dep.push(id)
      this.depsId.add(id)
      dep.addSub(this) // watcher已经记住了dep，而且去重复了，可以让dep记住了watcher
    }
  }

  // 更新视图
  update() {
    // this.get() //更新渲染
    queueWatcher(this);
  }

  run() {
    this.get() // 执行刷新
  }
}

// 以下代码用来，更新数据的时候，等到最后修改完，只刷新一次节约性能。
let queue = []
let has = {}
let pending = false // 防抖
function flushScheduleQueue() {
  // 拷贝了一份。
  let flushQueue = queue.slice(0)
  // 清空队列
  queue = []
  has = {}
  pending = false
  // 在刷新的过程中，可能有新的wathcer，回重新放到queue中。
  flushQueue.forEach((item) => {
    item.run()
  })
}

function queueWatcher(watcher) {
  const id = watcher.id
  if (!has[id]) {
    queue.push(watcher)
    has[id] = true
    // 不管我们的update执行多少次，但是最终只执行一轮刷新操作。
    if (!pending) {
      setTimeout(flushScheduleQueue, 0)
      pending = true
    }
  }
}

// 问题是，callback是先用户的，还是先内部的
export function nextTick (cb) {
  console.log("cb", cb);
}

export default Watch
