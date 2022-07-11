// Regular Expressions for parsing tags and attributes
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`) //匹配到的是一个标签名 <xxx匹配到的是开始标签的名字
const attribute =
  // eslint-disable-next-line no-useless-escape
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) //匹配到的是</xxxx>结束标签。

// vue3并没有使用正则
export function parseHTML(html) {
  //html最开始肯定是一个<
  const ELEMENT_TYPE = 1
  const TEXT_TYPE = 3
  const stack = [] //用于存放元素
  let currentParent //指向栈中的最后一个
  // 根节点
  let root

  // 最终转化成一颗抽象的语法树
  function createASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null
    }
  }

  // 解析开始标签，使用栈来构造一棵树。
  function start(tag, attrs) {
    let node = createASTElement(tag, attrs)
    if (!root) {
      // 如果树为空，
      root = node //则作为根节点
    }
    if (currentParent) {
      node.parent = currentParent
      currentParent.children.push(node)
    }
    stack.push(node) // 压入栈中
    currentParent = node // currentParent指向栈中的最后一个。
  }
  // 解析文本
  function chars(text) {
    text = text.replace(/\s/g, '')
    text &&
      currentParent.children.push({
        type: TEXT_TYPE,
        text,
        parent: currentParent
      })
  }
  // 结束标签处理
  function end(tag) {
    // 标签匹配结束时，弹出最后一个
    // eslint-disable-next-line no-unused-vars
    let node = stack.pop()
    // todo:校验标签是否合法
    // 再把currentParent指向栈的最后一个元素
    currentParent = stack[stack.length - 1]
  }
  // 匹配成功后删除对应的内容
  function advance(n) {
    html = html.substring(n)
  }
  // 匹配标签
  function parseStartTag() {
    const start = html.match(startTagOpen)
    if (start) {
      const match = {
        tagName: start[1], //标签名
        attrs: []
      }
      // 匹配完成后就把匹配过的数据删除掉,
      advance(start[0].length)
      // 如果不是开始标签的结束，就一直匹配下去
      let attr, end
      // 拿到标签的属性。
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        advance(attr[0].length)
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] || true
        })
      }
      if (end) {
        advance(end[0].length)
      }
      return match
    }

    return false
  }
  // 一直循环标签， 直到html中什么都没有
  while (html) {
    // <div>dwdawd</div>
    // 1. 如果textEnd == 0 说明是一个开始标签或者结束标签。
    // 如果textEnd > 0说明就是文本的结束位置
    let textEnd = html.indexOf('<') //如果indexOf中的索引是0 则说明是个标签。
    if (textEnd == 0) {
      // 开始标签的匹配结果
      const startTagMatch = parseStartTag()
      // console.log("startTagMatch", startTagMatch)
      if (startTagMatch) {
        // 解析到了开始标签
        // todo: 解析开始标签。
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue //直接跳过当前循环，进入下一次循环。节省性能。
      }
      // 结束标签匹配
      let endTagMatch = html.match(endTag)
      if (endTagMatch) {
        end(endTagMatch[1])
        advance(endTagMatch[0].length)
        continue
      }
    }
    // 2. textEnd>=0说明有文本了。开始匹配文本
    if (textEnd >= 0) {
      let text = html.substring(0, textEnd)
      if (text) {
        chars(text)
        advance(text.length)
      }
    }
  }
  return root
}
