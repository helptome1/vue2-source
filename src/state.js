import { observe } from './observe/index'

export function initState(vm) {
  const option = vm.$options
  // 如果用户vue({data: {}}), 有data属性。就执行initData
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

// 
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
