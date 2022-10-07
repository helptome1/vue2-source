import { mergeOptions } from "./utils"

export function initGlobalAPI(Vue) {
  Vue.options = {}
  Vue.mixin = function (mixin) {
    // debugger
    // 把用户选项和全局的options合并
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
