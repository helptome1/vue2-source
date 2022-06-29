// Regular Expressions for parsing tags and attributes
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`) //匹配到的是一个标签名 <xxx匹配到的是开始标签的名字

console.log(startTagOpen)

const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const dynamicArgAttribute =
  /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) //匹配到的是</xxxx>结束标签。

// vue3并没有使用正则
function parseHTML(html) { //html最开始肯定是一个<
  const ELEMENT_TYPE = 1;
  const TEXT_TYPE = 3;
  const stack = []; //用于存放元素
  let currentParent; //指向栈中的最后一个
  // 根节点
  let root;

  // 最终转化成一颗抽象的语法树
  function createASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      children,
      attrs,
      parent: null
    }
  }

  // 解析开始标签，
  function start(tag, attrs) {
    console.log(tag, attrs, '开始')
    let node = createASTElement(tag, attrs)
    if (!root) { // 如果树为空，
      root = node //则作为根节点
    }
    if(){}
    
    stack.push(node) // 压入栈中
    currentParent = node; // currentParent为栈中的最后一个。

  }
  // 解析文本
  function chars(text) {
    console.log(text, '文本');
    currentParent.children.push({
      type: TEXT_TYPE,
      text
    })
  }
  // 结束标签处理
  function end(tag) {
    console.log(tag, '结束')
    stack.pop();
    currentParent = stack[stack.length - 1]
  }
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
      let attr, end;
      // 拿到标签的属性。
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length);
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
    let textEnd = html.indexOf("<") //如果indexOf中的索引是0 则说明是个标签。
    if (textEnd == 0) {
      const startTagMatch = parseStartTag(); // 开始标签的匹配结果
      // console.log("startTagMatch", startTagMatch)
      if (startTagMatch) {// 解析到了开始标签
        // todo: 解析开始标签。
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue; //直接跳过当前循环，进入下一次循环。节省性能。
      }
      // 结束标签匹配
      let endTagMatch = html.match(endTag)
      if (endTagMatch) {
        end(endTagMatch[1])
        advance(endTagMatch[0].length)
        continue;
      }

    }
    // 2. textEnd>=0说明有文本了。开始匹配文本
    if (textEnd >= 0) {
      let text = html.substring(0, textEnd);
      if (text) {
        chars(text)
        advance(text.length)
      }
    }
  }
}

export function compileToFunctions(template) {

  // 1. 就是将template转化为ast语法树
  let ast = parseHTML(template);
  // 2. 生成render方法（render方法执行后的返回的结果就是 虚拟dom）

}