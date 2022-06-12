import { observe } from './observe/index'

export function initState(vm) {
  const option = vm.$options
  if (option.data) {
    initData(vm)
  }
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

function initData(vm) {
  let data = vm.$options.data
  // data可能是函数
  data = typeof data === 'function' ? data.call(this) : data

  // 把返回的对象放到_data上。
  vm._data = data
  // 对vue2的数据进行劫持，采用一个api，defineProperty
  observe(data)
  // 将vm._data挂载到vm上,用vm来代理
  proxy(vm, '_data')
}
