import { parseHTML } from './parse'
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
// const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g

// 吧attrs对象转换为字符串
function genProps(attrs) {
  let str = ''
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    if (attr.name === 'style') {
      let obj = {};
      attr.value.split(';').forEach((item) => {
        let [key, value] = item.split(':')
        obj[key] = value;
      })
      attr.value = obj
    }
    // a:b,c:d
    str += `${attr.name}:${JSON.stringify(attr.value)},`
  }
  // 去掉最后一个,
  return `{${str.slice(0, -1)}}`
}

function gen(node) {
  // 如果是dom节点就继续生成dom结构
  if (node.type === 1) {
    return codegen(node)
  } else {
    // 如果是文本
    const text = node.text
    // 匹配是不是普通文本，还是插值字符串
    if (!defaultTagRE.test(text)) {
      // _v是创建文本的函数
      return `_v(${JSON.stringify(text)})`
    } else {
      /**
       * 处理插值内容
       * 如果是插值字符串，要使用这种方式来拼接字符
       */
      //_v(_s(name) + "hello")
      let tokens = []
      let match
      // 正则的lastIndex 属性用于规定下次匹配的起始位置。不然匹配不到。
      defaultTagRE.lastIndex = 0
      let lastIndex = 0
      while ((match = defaultTagRE.exec(text))) {
        // 匹配的位置{{name}}  hezg {{age}} demo
        let index = match.index
        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)))
        }
        // 放入匹配的结果。_s({{name}})
        tokens.push(`_s(${match[1].trim()})`)
        lastIndex = index + match[0].length
      }
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)))
      }
      return `_v(${tokens.join('+')})`
    }
  }
}

function genChildren(children) {
    return children.map((child) => gen(child)).join(',')
}

// 生成render函数
function codegen(ast) {
  const children = genChildren(ast.children)
  let code = `_c('${ast.tag}',${ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'}${ast.children.length ? `,${children}` : ''})`
  return code
}

export function compileToFunction(template) {
  // 1. 就是将template转化为ast语法树
  let ast = parseHTML(template)
  console.log("ast", ast)
  // 2. 生成render方法（render方法执行后的返回的结果就是 虚拟dom）
  let code = codegen(ast)
  // 这里使用with是因为，方便取值。因为code中的代码有传参数。使用render.call(vm)就可以改变with中this的指向。
  code = `with(this){return ${code}}` 
  // render() {
  //   return _c('div', {id:'app'}, _c('div', {style: {color: 'red'}}, _v(_s(name)+'hello'), _v('span', undefined, -v(_s(name)))))
  // }
  const render = new Function(code)
  /**
   * 模版引擎的实现原理都是with + new Function
   */
  return render
}
