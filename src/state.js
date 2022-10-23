import Dep from './observe/dep'
import { observe } from './observe/index'
import Watch from './observe/watcher'

export function initState(vm) {
  const option = vm.$options
  // 如果用户vue({data: {}}), 有data属性。就执行initData
  if (option.data) {
    initData(vm)
  }
  // 如果用户vue({computed: {}}), 有computed属性。就执行initComputed
  if (option.computed) {
    initComputed(vm)
  }
  // 如果用户vue({watch: {}}), 有watch属性。就执行initWatch
  if (option.watch) {
    initWatch(vm)
  }
}

function initWatch(vm) {
  const watch = vm.$options.watch
  for (let key in watch) {
    const handler = watch[key]
    // 如果用户传递的是数组，就循环执行。
    if (Array.isArray(handler)) {
      handler.forEach((handle) => {
        createWatcher(vm, key, handle)
      })
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

function createWatcher(vm, key, handler) {
  // handler可能是字符串或者函数.如果是字符串，就是methods中的方法。
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(key, handler)
}

function proxy(vm, target) {
  // vm[target])===vm._data
  Object.keys(vm[target]).forEach((key) => {
    Object.defineProperty(vm, key, {
      get() {
        return vm[target][key]
      },
      set(newVal) {
        vm[target][key] = newVal
      }
    })
  })
}

// 初始化data
function initData(vm) {
  let data = vm.$options.data
  // 1. 拿到data属性。由于data可能是函数，所以需要判断一下data的类型。
  data = typeof data === 'function' ? data.call(this) : data

  // 2. 把返回的对象放到vue实例的_data上。
  vm._data = data
  // 对vue2的数据进行劫持，使用js的api->defineProperty
  observe(data)
  // 3. 将vm._data中的数据都挂载到vm上,用vm来代理
  proxy(vm, '_data')
}

function initComputed(vm) {
  const computeds = vm.$options.computed
  // 将计算属性保存到vm上，方便后续执行。
  const watchers = (vm._computedWatchers = {})
  for (let key in computeds) {
    let userDef = computeds[key]

    // 我们需要监控 计算属性中get的变化。
    let fn = typeof userDef === 'function' ? userDef : userDef.get

    // lazy是暂时不执行fn方法, 再将key和wathcer对应起来。
    watchers[key] = new Watch(vm, fn, { lazy: true })

    defineComputed(vm, key, userDef)
  }
}

function defineComputed(target, key, userDef) {
  // 获取getter或者setter
  // const getter = typeof userDef === 'function' ? userDef : userDef.get
  const setter = userDef.set || (() => {})
  // 通过实例拿到对应的属性。
  // 为了让计算属性在使用时再去执行，执行的fn要写在get函数中。
  Object.defineProperty(target, key, {
    get: createComputedGetter(key),
    set: setter
  })
}

function createComputedGetter(key) {
  // 需要检测是否执行这个getter
  return function () {
    // this指向的是vm
    const watcher = this._computedWatchers[key]
    if (watcher.dirty) {
      // 如果是脏的就去执行computed计算属性，用户传入的计算属性
      watcher.evaluate() // 求值后把dirty变为false，下次就不会执行了。
    }
    if (Dep.target) {
      watcher.depend()
    }
    // 返回计算属性求得的值。
    return watcher.value
  }
}
