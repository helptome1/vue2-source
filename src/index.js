import { compileToFunction } from './compiler'
import { initGlobalAPI } from './gloableAPI'
import { initMixin } from './init'
import { initLifeCycle } from './lifecycle'
import { initStateMixin } from './state'
import { createElm, patch } from './vdom/patch'

// 使用构造函数的方法创建Vue实例，将所有的方法都耦合起来。
function Vue(options) {
  // 这个_init函数在Vue的原型对象上。
  this._init(options) //用户的配置
}


initMixin(Vue) // 将initMixin方法添加到Vue的原型上
initLifeCycle(Vue) // vm_update vm._render
initGlobalAPI(Vue) // 初始化api——mixin，全局api
initStateMixin(Vue) // 实现了nextTick $watch

// -------------------方便调试-----------
let render1 = compileToFunction(`<ul key='a' style="color:green">
  <li key="a">a</li>
  <li key="b">b</li>
  <li key="c">c</li>
  <li key="d">d</li>
</ul>`)
let vm1 = new Vue({data: {name: 'hzg'}})
let preVnode = render1.call(vm1)

// 渲染到document上s
let el = createElm(preVnode)
document.body.appendChild(el)

let render2 = compileToFunction(`<ul key='a' style="color:red;">
  <li key="b">b</li>
  <li key="m">m</li>
  <li key="a">a</li>
  <li key="p">p</li>
  <li key="c">c</li>
  <li key="d">q</li>
</ul>`)
let vm2 = new Vue({data: {name: 'demo'}})
let nextVnode = render2.call(vm2)

setTimeout(() => {
  // 直接将老的替换新的，比较消耗性能；可以先比较两个节点的区别之后在进行比较。
  // 而diff算法就就是一个平级比较。父亲比较父亲，儿子和儿子进行比较。
  // let newEle = createElm(nextVnode)
  // el.parentNode.replaceChild(newEle, el)
  patch(preVnode, nextVnode)

}, 1000);

export default Vue
