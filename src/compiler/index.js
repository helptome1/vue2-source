import { parseHTML } from "./parse";

export function compileToFunctions(template) {

  // 1. 就是将template转化为ast语法树
  let ast = parseHTML(template);
  // 2. 生成render方法（render方法执行后的返回的结果就是 虚拟dom）
  console.log(ast)

}