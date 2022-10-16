import Watch from './watcher'

let id = 0
// dep用来收集watcher，而且，dep和watcher是多对多的关系。
// 重点：只有在模版中使用的变量，才会被收集
class Dep {
    constructor() {
        this.id = id++
        this.subs = []
    }
    
    depend() {
        // 需要对watcher去重。只是一个单向的关系.dep -> watcher, 所以不能简单的把wathcer直接记录下来。
        // this.subs.push(Dep.target)
        // 调用watcher的addDep方法。把当前dep传给wathcer
        Dep.target.addDep(this)
    }

    addSub(watcher) {
        this.subs.push(watcher)
    }

    // 通知更新, 告诉watcher，去更新视图
    notify() {
        this.subs.forEach((item) => item.update())
    }
}
// 静态属性。
// 记录的是wathcer， 先把它维护成栈
Dep.target = null
let stack = []
export function pushTarget(watcher) {
    stack.push(watcher)
    Dep.target = watcher
}
export function popTarget() {
    stack.pop()
    Dep.target = stack[stack.length - 1]
}

export default Dep
