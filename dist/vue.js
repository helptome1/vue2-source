(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  // Regular Expressions for parsing tags and attributes
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); //匹配到的是一个标签名 <xxx匹配到的是开始标签的名字

  var attribute = // eslint-disable-next-line no-useless-escape
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/

  var startTagClose = /^\s*(\/?)>/;
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); //匹配到的是</xxxx>结束标签。
  // vue3并没有使用正则

  function parseHTML(html) {
    //html最开始肯定是一个<
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var stack = []; //用于存放元素

    var currentParent; //指向栈中的最后一个
    // 根节点

    var root; // 最终转化成一颗抽象的语法树

    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    } // 解析开始标签，使用栈来构造一棵树。


    function start(tag, attrs) {
      var node = createASTElement(tag, attrs);

      if (!root) {
        // 如果树为空，
        root = node; //则作为根节点
      }

      if (currentParent) {
        node.parent = currentParent;
        currentParent.children.push(node);
      }

      stack.push(node); // 压入栈中

      currentParent = node; // currentParent指向栈中的最后一个。
    } // 解析文本


    function chars(text) {
      text = text.replace(/\s/g, '');
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    } // 结束标签处理


    function end(tag) {
      // 标签匹配结束时，弹出最后一个
      // eslint-disable-next-line no-unused-vars
      stack.pop(); // todo:校验标签是否合法
      // 再把currentParent指向栈的最后一个元素

      currentParent = stack[stack.length - 1];
    } // 匹配成功后删除对应的内容


    function advance(n) {
      html = html.substring(n);
    } // 匹配标签


    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          //标签名
          attrs: []
        }; // 匹配完成后就把匹配过的数据删除掉,

        advance(start[0].length); // 如果不是开始标签的结束，就一直匹配下去

        var attr, _end; // 拿到标签的属性。


        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
        }

        if (_end) {
          advance(_end[0].length);
        }

        return match;
      }

      return false;
    } // 一直循环标签， 直到html中什么都没有


    while (html) {
      // <div>dwdawd</div>
      // 1. 如果textEnd == 0 说明是一个开始标签或者结束标签。
      // 如果textEnd > 0说明就是文本的结束位置
      var textEnd = html.indexOf('<'); //如果indexOf中的索引是0 则说明是个标签。

      if (textEnd == 0) {
        // 开始标签的匹配结果
        var startTagMatch = parseStartTag(); // console.log("startTagMatch", startTagMatch)

        if (startTagMatch) {
          // 解析到了开始标签
          // todo: 解析开始标签。
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue; //直接跳过当前循环，进入下一次循环。节省性能。
        } // 结束标签匹配


        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          end(endTagMatch[1]);
          advance(endTagMatch[0].length);
          continue;
        }
      } // 2. textEnd>=0说明有文本了。开始匹配文本


      if (textEnd >= 0) {
        var text = html.substring(0, textEnd);

        if (text) {
          chars(text);
          advance(text.length);
        }
      }
    }

    return root;
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g
  // 把attrs对象转换为字符串

  function genProps(attrs) {
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === 'style') {
        (function () {
          var obj = {};
          attr.value.split(';').forEach(function (item) {
            var _item$split = item.split(':'),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
        })();
      } // a:b,c:d


      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    } // 去掉最后一个,


    return "{".concat(str.slice(0, -1), "}");
  } // 生成dom节点


  function gen(node) {
    // 如果是dom节点就继续生成dom结构
    if (node.type === 1) {
      return codegen(node);
    } else {
      // 如果是文本
      var text = node.text; // 匹配是不是普通文本，还是插值字符串

      if (!defaultTagRE.test(text)) {
        // _v是创建文本的函数
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        /**
         * 处理插值内容
         * 如果是插值字符串，要使用这种方式来拼接字符
         */
        //_v(_s(name) + "hello")
        var tokens = [];
        var match; // 正则的lastIndex 属性用于规定下次匹配的起始位置。不然匹配不到。

        defaultTagRE.lastIndex = 0;
        var lastIndex = 0;

        while (match = defaultTagRE.exec(text)) {
          // 匹配的位置{{name}}  hezg {{age}} demo
          var index = match.index;

          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          } // 放入匹配的结果。_s({{name}})


          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }

  function genChildren(children) {
    return children.map(function (child) {
      return gen(child);
    }).join(',');
  } // 生成render函数


  function codegen(ast) {
    var children = genChildren(ast.children);
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length ? ",".concat(children) : '', ")");
    return code;
  }

  function compileToFunction(template) {
    // 1. 就是将template转化为ast语法树
    var ast = parseHTML(template); // 2. 生成render方法（render方法执行后的返回的结果就是 虚拟dom）

    var code = codegen(ast); // 这里使用with是因为，方便取值。因为code中的代码有传参数。使用render.call(vm)就可以改变with中this的指向。

    code = "with(this){return ".concat(code, "}"); // render() {
    //   return _c('div', {id:'app'}, _c('div', {style: {color: 'red'}}, _v(_s(name)+'hello'), _v('span', undefined, -v(_s(name)))))
    // }

    var render = new Function(code);
    /**
     * 模版引擎的实现原理都是with + new Function
     */

    return render;
  }

  // 静态方法
  // 1. 策略模式---->使用策略减少if else
  // 2. 创建生命周期
  var strats = {};
  var LIFECYCLE = ['beforeCreate', 'created'];
  LIFECYCLE.forEach(function (hook) {
    strats[hook] = function (p, c) {
      // 1. {} {created: function() {}} => {created: [fn]}
      // 2. {created: [fn]} {created: function() {}} => {created: [fn, fn]}
      if (c) {
        //如果有儿子
        if (p) {
          // 如果有父亲, 优先使用呢儿子的方法，所以使用覆盖。
          return p.concat(c);
        } else {
          // 只有儿子
          return [c];
        }
      } else {
        // 没有儿子
        return p;
      }
    };
  });
  function mergeOptions(parent, child) {
    var options = {};

    for (var key in parent) {
      mergeField(key);
    }

    for (var _key in child) {
      if (!parent.hasOwnProperty(_key)) {
        mergeField(_key);
      }
    }

    function mergeField(key) {
      // 使用策略模式，减少if else
      if (strats[key]) {
        options[key] = strats[key](parent[key], child[key]);
      } else {
        options[key] = child[key] || parent[key]; // 优先采用儿子，再采用父亲
      }
    }

    return options;
  }

  function initGlobalAPI(Vue) {
    Vue.options = {};

    Vue.mixin = function (mixin) {
      // debugger
      // 把用户选项和全局的options合并
      this.options = mergeOptions(this.options, mixin);
      return this;
    };
  }

  var id$1 = 0; // 观察者，观察某个属性的变化。每个属性都有一个dep(被观察者)，watcher就是观察者。属性变化会通知观察者更新。
  // 1. 不同的组件有不同的watcher。 目前只有一个，渲染跟实例

  var Watch = /*#__PURE__*/function () {
    function Watch(vm, exprOrFn, options, cb) {
      _classCallCheck(this, Watch);

      this.id = id$1++;
      this.renderWatcher = options;

      if (typeof exprOrFn === 'string') {
        this.getter = function () {
          return vm[exprOrFn];
        };
      } else {
        this.getter = exprOrFn;
      }

      this.deps = []; //后续实现计算属性，和一些清理工作时使用。记住dep

      this.depsId = new Set();
      this.lazy = options.lazy;
      this.dirty = this.lazy; // 缓存值

      this.vm = vm;
      this.cb = cb;
      this.user = options.user; // 标识是否是用户自己的watcher

      this.value = this.lazy ? undefined : this.get();
    } // 用户获取computed计算后的值


    _createClass(Watch, [{
      key: "evaluate",
      value: function evaluate() {
        this.value = this.get();
        this.dirty = false;
      }
    }, {
      key: "get",
      value: function get() {
        pushTarget(this); // 静态属性只有一份
        // 回去vm上取值, 渲染函数vm._update(vm._render)或者计算属性的方法，
        // 这里用call来执行函数是因为this可能为空

        var value = this.getter.call(this.vm);
        popTarget(); // watcher已经记住了dep了，而且去重了，此时让dep也记住watcher.

        return value;
      } // 一个组件 对应着多个属性。重复的属性也不用记录。

    }, {
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id;

        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this); // watcher已经记住了dep，而且去重复了，可以让dep记住了watcher
        }
      }
    }, {
      key: "depend",
      value: function depend() {
        var i = this.deps.length;

        while (i--) {
          // dep.depend()
          this.deps[i].depend(); // 让计算属性watcher，也收集渲染watcher.
        }
      } // 更新视图

    }, {
      key: "update",
      value: function update() {
        if (this.lazy) {
          // 计算属性依赖的值发生了变化，就标识计算属性是脏值（旧值）
          this.dirty = true;
        } else {
          // 更新渲染
          queueWatcher(this);
        }
      }
    }, {
      key: "run",
      value: function run() {
        var oldValue = this.value;
        var newValue = this.get(); // 执行刷新

        if (this.user) {
          this.cb.call(this.vm, newValue, oldValue);
        }
      }
    }]);

    return Watch;
  }(); // 以下代码用来，更新数据的时候，等到最后修改完，只刷新一次节约性能。


  var queue = [];
  var has = {};
  var pending = false; // 防抖

  function flushScheduleQueue() {
    // 拷贝了一份。
    var flushQueue = queue.slice(0); // 清空队列

    queue = [];
    has = {};
    pending = false; // 在刷新的过程中，可能有新的wathcer，回重新放到queue中。

    flushQueue.forEach(function (item) {
      item.run();
    });
  }

  function queueWatcher(watcher) {
    var id = watcher.id;

    if (!has[id]) {
      queue.push(watcher);
      has[id] = true; // 不管我们的update执行多少次，但是最终只执行一轮刷新操作。

      if (!pending) {
        setTimeout(flushScheduleQueue, 0);
        pending = true;
      }
    }
  }
  /**
      nextTick实现方式
  */
  // nextTick并不是创建一个异步任务，而是将这个任务维护到了队列中去。
  // 使用p处理，使多次使用nextTick而执行一次。


  var callbacks = [];
  var waiting = false;

  function flushCallbacks() {
    // 拷贝一份
    var cbs = callbacks.slice(0);
    waiting = false;
    callbacks = [];
    cbs.forEach(function (cb) {
      return cb();
    }); // 按照次序执行
  } // nextTick 没有直接使用某个api，来使用异步。而是优雅降级
  // 内部先采用的是promise（ie不兼容） MutationObserver(h5的api) 可以考虑ie专享setImmediate ---> setTimeout


  var timerFunc;

  if (Promise) {
    timerFunc = function timerFunc() {
      Promise.resolve().then(flushCallbacks);
    };
  } else if (MutationObserver) {
    var observer = new MutationObserver(flushCallbacks); //这里传入的回调是异步执行的。

    var textNode = document.createTextNode(1);
    observer.observe(textNode, {
      characterData: true
    });

    timerFunc = function timerFunc() {
      textNode.textContent = 2;
    };
  } else if (setImmediate) {
    timerFunc = function timerFunc() {
      setImmediate(flushCallbacks);
    };
  } else {
    timerFunc = setTimeout(function () {
    }, 0);
  }

  function nextTick(cb) {
    callbacks.push(cb);

    if (!waiting) {
      setTimeout(function () {
        timerFunc(); // 多次使用nextTick，最后一起刷新。
      }, 0);
      waiting = true;
    }
  }

  var id = 0; // dep用来收集watcher，而且，dep和watcher是多对多的关系。
  // 重点：只有在模版中使用的变量，才会被收集

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id++;
      this.subs = [];
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // 需要对watcher去重。只是一个单向的关系.dep -> watcher, 所以不能简单的把wathcer直接记录下来。
        // this.subs.push(Dep.target)
        // 调用watcher的addDep方法。把当前dep传给wathcer
        Dep.target.addDep(this);
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      } // 通知更新, 告诉watcher，去更新视图

    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (item) {
          return item.update();
        });
      }
    }]);

    return Dep;
  }(); // 静态属性。
  // 记录的是wathcer， 先把它维护成栈


  Dep.target = null;
  var stack = [];
  function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
  }
  function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  // 获取 数组的原型
  var oldArrayProto = Array.prototype; // 拷贝一份数组原型，修改数组方法，不会影响Array的方法。

  var newArrayProto = Object.create(oldArrayProto); // 这里是改变元素组的方法。

  var methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'];
  methods.forEach(function (method) {
    newArrayProto[method] = function () {
      var _oldArrayProto$method;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // 这里重写了数组的方法。
      // 调用原型上的方法。
      // 这里的this指向的是谁调用的，this指向arr
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); // 需要对新增的数据再次劫持。


      var inserted;
      var ob = this.__ob__;

      switch (method) {
        case 'push':
          break;

        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          inserted = args.slice(2);
          break;
      }

      if (inserted) {
        // 对新增的数组内容再次劫持
        ob.observeArray(inserted);
      } // 数组变化了，通知对应的wathcer实现更新逻辑


      ob.dep.notify();
      return result;
    };
  });

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);

      // 给每个对象增加依赖收集功能。
      this.dep = new Dep(); // Object.defineProperty只能劫持已经存在的属性，不能劫持新增的属性（为此vue会新增一些方法例如：$set, $delete）
      // 把Observe挂载到__ob__上，做一个标识（识别是否已经监听），同时可以使用walk和observeArray方法。
      // 使用Object.defineProperty方法加上__ob__属性，表示已经监听，并且让这个属性不可枚举，防止死循环。

      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false
      });

      if (Array.isArray(data)) {
        // 为了解决数组中新增的属性不能劫持的问题，需要重写素组方法，并且不可以影响之前的数组方法。
        // 新建一个array.js实现新增属性的方法重写。
        data.__proto__ = newArrayProto; // 修改数组的每一项时进行修改，不管是基本数据类型，还是引用数据类型。

        this.observeArray(data);
      } else {
        this.walk(data);
      }
    } // 遍历对象，对每一个属性进行劫持


    _createClass(Observe, [{
      key: "walk",
      value: function walk(data) {
        Object.keys(data).forEach(function (key) {
          defineReactive(data, key, data[key]);
        });
      } // 遍历数组，对每一项进行劫持

    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);

    return Observe;
  }();

  function dependArray(val) {
    for (var i = 0; i < val.length; i++) {
      var current = val[i];
      current.__ob__ && current.__ob__.dep.depend();

      if (Array.isArray(current)) {
        // 递归收集依赖
        dependArray(current);
      }
    }
  } // 劫持数据的逻辑，响应式数据， 这是一个闭包


  function defineReactive(target, key, val) {
    // 如果val是对象，则递归调用，进行属性劫持。 childOb.dep用来收集依赖。
    var childOb = observe(val); // 每一个属性都会有一个dep

    var dep = new Dep(); // 对对象重新定义了。

    Object.defineProperty(target, key, {
      // 用户取值的时候
      get: function get() {
        if (Dep.target) {
          // 让这个属性是让收集器记住当前的watcher
          dep.depend();

          if (childOb) {
            childOb.dep.depend(); // 让数组和对象本身也实现依赖收集

            if (Array.isArray(val)) {
              //这种用来处理数组里嵌套数组的更新
              dependArray(val);
            }
          }
        }

        return val;
      },
      // 设置或者修改值时执行
      set: function set(newVal) {
        if (val !== newVal) {
          if (newVal === val) return; // 对修改的对象属性进行劫持。

          observe(newVal);
          val = newVal;
          dep.notify(); //通知更新
        }
      }
    });
  } // 劫持数据

  function observe(data) {
    // 1. 判断data是否是对象。不是对象，或者为空，不用劫持。
    if (_typeof(data) !== 'object' || data === null) {
      return; //只对对象进行劫持
    } // 2. 如果一个对象已经被劫持了，那么它就不需要再次被劫持。（判断方法是：添加一个实例，用实例来判断）
    // 如果已经被劫持，就不需要再劫持了


    if (data.__ob__ instanceof Observe) {
      return data.__ob__;
    } // 3. 新增了Observer实例，判断这个对象是否已经被劫持
    // 劫持数据


    return new Observe(data);
  }

  function initState(vm) {
    var option = vm.$options; // 如果用户vue({data: {}}), 有data属性。就执行initData

    if (option.data) {
      initData(vm);
    } // 如果用户vue({computed: {}}), 有computed属性。就执行initComputed


    if (option.computed) {
      initComputed(vm);
    } // 如果用户vue({watch: {}}), 有watch属性。就执行initWatch


    if (option.watch) {
      initWatch(vm);
    }
  }

  function initWatch(vm) {
    var watch = vm.$options.watch;

    var _loop = function _loop(key) {
      var handler = watch[key]; // 如果用户传递的是数组，就循环执行。

      if (Array.isArray(handler)) {
        handler.forEach(function (handle) {
          createWatcher(vm, key, handle);
        });
      } else {
        createWatcher(vm, key, handler);
      }
    };

    for (var key in watch) {
      _loop(key);
    }
  }

  function createWatcher(vm, key, handler) {
    // handler可能是字符串或者函数.如果是字符串，就是methods中的方法。
    if (typeof handler === 'string') {
      handler = vm[handler];
    }

    return vm.$watch(key, handler);
  }

  function proxy(vm, target) {
    // vm[target])===vm._data
    Object.keys(vm[target]).forEach(function (key) {
      Object.defineProperty(vm, key, {
        get: function get() {
          return vm[target][key];
        },
        set: function set(newVal) {
          vm[target][key] = newVal;
        }
      });
    });
  } // 初始化data


  function initData(vm) {
    var data = vm.$options.data; // 1. 拿到data属性。由于data可能是函数，所以需要判断一下data的类型。

    data = typeof data === 'function' ? data.call(this) : data; // 2. 把返回的对象放到vue实例的_data上。

    vm._data = data; // 对vue2的数据进行劫持，使用js的api->defineProperty

    observe(data); // 3. 将vm._data中的数据都挂载到vm上,用vm来代理

    proxy(vm, '_data');
  }

  function initComputed(vm) {
    var computeds = vm.$options.computed; // 将计算属性保存到vm上，方便后续执行。

    var watchers = vm._computedWatchers = {};

    for (var key in computeds) {
      var userDef = computeds[key]; // 我们需要监控 计算属性中get的变化。

      var fn = typeof userDef === 'function' ? userDef : userDef.get; // lazy是暂时不执行fn方法, 再将key和wathcer对应起来。

      watchers[key] = new Watch(vm, fn, {
        lazy: true
      });
      defineComputed(vm, key, userDef);
    }
  }

  function defineComputed(target, key, userDef) {
    // 获取getter或者setter
    // const getter = typeof userDef === 'function' ? userDef : userDef.get
    var setter = userDef.set || function () {}; // 通过实例拿到对应的属性。
    // 为了让计算属性在使用时再去执行，执行的fn要写在get函数中。


    Object.defineProperty(target, key, {
      get: createComputedGetter(key),
      set: setter
    });
  }

  function createComputedGetter(key) {
    // 需要检测是否执行这个getter
    return function () {
      // this指向的是vm
      var watcher = this._computedWatchers[key];

      if (watcher.dirty) {
        // 如果是脏的就去执行computed计算属性，用户传入的计算属性
        watcher.evaluate(); // 求值后把dirty变为false，下次就不会执行了。
      }

      if (Dep.target) {
        watcher.depend();
      } // 返回计算属性求得的值。


      return watcher.value;
    };
  }

  function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick;

    Vue.prototype.$watch = function (expOrFn, cb) {
      new Watch(this, expOrFn, {
        user: true
      }, cb);
    };
  }

  // h()  _C()都是这个方法
  function createElementVNode(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (data == null) {
      data = {};
    }

    var key = data.key;
    !!key && delete data.key;

    for (var _len = arguments.length, chidren = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      chidren[_key - 3] = arguments[_key];
    }

    return vNode(vm, tag, key, data, chidren);
  } // _v();

  function createTextVNode(vm, text) {
    return vNode(vm, undefined, undefined, undefined, undefined, text);
  } // ast做的是语法层面的转换，它描述的是语法本身；（可以描述js，css，html）
  // 而vNode的虚拟dom是描述dom的元素，可以增加一些自定义属性。（只描述dom元素）

  function vNode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text // 事件，插槽，等等一系列

    };
  } // 判断两个节点是否是同一个


  function isSameVnode(oldVnode, newVnode) {
    return newVnode.tag === oldVnode.tag && newVnode.key === oldVnode.key;
  }

  function createElm(vnode) {
    var tag = vnode.tag,
        data = vnode.data,
        children = vnode.children,
        text = vnode.text;

    if (typeof tag === 'string') {
      //tag如果是标签
      // 这里把虚拟节点和真实节点联系起来。
      vnode.el = document.createElement(tag); // 更新data中的属性。

      patchProps(vnode.el, {}, data); // 如果有children，就使用递归来循环创建children里面的内容

      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      // 如果是文本
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }
  /**
   * 比较新旧节点的属性和样式，进行属性的赋值操作。
   * @param {*} el dom节点
   * @param {*} props 属性
   */

  function patchProps(el, oldProps, props) {
    var oldStyles = oldProps.style || {};
    var newStyles = props.style || {}; // 老的样式对象中有，新的样式对象中没有，要删除老的样式中的属性。

    for (var key in oldStyles) {
      if (!newStyles[key]) {
        el.style[key] = '';
      }
    } // 老的属性中有该属性。


    for (var _key in oldProps) {
      // 新的属性中没有
      if (!props[_key]) {
        // 则删除节点上的属性。
        el.removeAttribute(_key);
      }
    } // 设置样式和属性。


    for (var _key2 in props) {
      if (_key2 === 'style') {
        // style: {color: 'red'}
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(_key2, props[_key2]);
      }
    }
  }
  /**
   * 用于更新dom节点，比较虚拟节点。
   * @param {*} oldVnode 旧的dom节点
   * @param {*} vnode 新的dom节点
   */

  function patch(oldVnode, vnode) {
    // 写的是初渲染流程
    var isRealElement = oldVnode.nodeType;

    if (isRealElement) {
      var elm = oldVnode;
      var parentElm = elm.parentNode; //拿到父级元素。==> body

      var newEle = createElm(vnode);
      parentElm.insertBefore(newEle, elm.nextSibing);
      parentElm.removeChild(elm);
      return newEle;
    } else {
      patchVnode(oldVnode, vnode);
    }
  }

  function patchVnode(oldVnode, vnode) {
    // 1. 先判断两个节点是否是同一个节点。如果是同一个节点就删除老节点，换上新的真实节点。
    if (!isSameVnode(oldVnode, vnode)) {
      // tag == tag, key == key
      var _el = createElm(vnode);

      oldVnode.el.parentNode.replaceChild(_el, oldVnode.el);
      return _el;
    } // 2. 当两个节点是一个节点，比较两个节点的属性差异（复用老的节点，将新的属性添加上去。）
    // 2.1 文本需要特殊处理, 比较一下文本的内容，复用老的节点。


    var el = vnode.el = oldVnode.el;

    if (!oldVnode.tag) {
      if (oldVnode.text !== vnode.text) {
        el.textContent = vnode.text; // 用新的文本覆盖掉老的文本
      }
    } // 2.2 是标签时，我们需要比较标签的属性。


    patchProps(el, oldVnode.data, vnode.data); // 3. 比较儿子节点，一方有，一方没有儿子；或者两房都有儿子。

    var oldChildren = oldVnode.children || [];
    var newChildren = vnode.children || [];

    if (oldChildren.length > 0 && newChildren.length > 0) {
      // 完整的diff算法。
      updateChildren(el, oldChildren, newChildren);
    } // 新的有，老的没有，挂载dom
    else if (newChildren.length > 0) {
      mountChildren(el, newChildren);
    } // 老的有，新的没有，删除
    else if (oldChildren.length > 0) {
      el.innerHTML = ''; //也可以循环删除。
    }

    return el;
  }

  function mountChildren(el, newChildren) {
    for (var i = 0; i < newChildren.length; i++) {
      var child = newChildren[i];
      el.appendChild(createElm(child));
    }
  }

  function updateChildren(el, oldChildren, newChildren) {
    var oldEndIndex = oldChildren.length - 1;
    var newEndIndex = newChildren.length - 1;
    var oldStartVnode = oldChildren[0];
    var newStartVnode = newChildren[0];
    var oldEndVnode = oldChildren[oldEndIndex];
    var newEndVnode = newChildren[newEndIndex];
    console.log(oldStartVnode, newStartVnode, oldEndVnode, newEndVnode);
  }

  /**
   * 但是现在有个问题，就是每次更新数据都需要手动的去执行_update和_render函数。
   * 为了解决这一问题，引入了观察者模式。为了节约性能，引入了diff算法。
   * @param {*} Vue
   */

  function initLifeCycle(Vue) {
    // _update接收一个dom节点。把虚拟dom装为真实dom
    Vue.prototype._update = function (vnode) {
      // 将虚拟dom转换为真实dom
      var vm = this;
      var el = vm.$el; // patch既有初始化的功能，又更新新的值

      vm.$el = patch(el, vnode);
    };
    /**
     * 底下的这些_c，_v, _s都是用来转换dom节点的。
     */
    // _c('div', {}, ...children)


    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    }; // _v(text)


    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    }; //


    Vue.prototype._s = function (value) {
      if (_typeof(value) != 'object') {
        return value;
      }

      return JSON.stringify(value);
    }; // 创建虚拟dom


    Vue.prototype._render = function () {
      var vm = this; // 使用call让with中的this指向vm,并且执行函数
      // console.log('options', vm.$options.render.call(vm))

      return vm.$options.render.call(vm);
    };
  }
  function mountComponent(vm, el) {
    // 把el也挂宅到vm实例上
    vm.$el = el; // 1. 调用render方法产生虚拟节点，虚拟DOM
    // vm._render() = vm.$options.render() 虚拟节点
    // vm._update就是把虚拟节点变成真实的节点。

    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    }; // 启动观察者模式


    new Watch(vm, updateComponent, true); // 2. 根据虚拟DOM产生真是DOM
    // 3. 插入到el元素中
  } // vue的核心：1。创建了响应式数据；2.html模版转换成ast语法树；
  // 3.将ast语法树转换为render函数；4.后续每次更新html只需要执行render函数（无需再次执行ast语法树），节省性能。
  // 重点：render函数会产生虚拟节点。（使用响应式数据）
  // 5. 根据生成的虚拟节点创建真是的dom
  // 调用钩子函数和生命周期

  function callHook(vm, hook) {
    // 调用钩子函数
    var handlers = vm.$options[hook];

    if (handlers) {
      handlers.forEach(function (handler) {
        return handler.call(vm);
      });
    }
  }

  function initMixin(Vue) {
    // 1. 给vue添加一个用于初始化操作的_init方法
    Vue.prototype._init = function (options) {
      // vm.$options就是获取用户的配置
      // 使用vue时的$nextTick()，$data， $attr等等，将用户的选项挂载到实例上
      var vm = this; // 我们 定义的全局指令和过滤器。。。都会挂载到实例上。
      // this.constructor.options拿到vue实例的options

      vm.$options = mergeOptions(this.constructor.options, options); // 生命周期beforeCreate

      callHook(vm, 'beforeCreate'); // 初始化状态,挂载数据,计算属性。

      initState(vm);
      callHook(vm, 'created');

      if (options.el) {
        vm.$mount(options.el); //实现数据的挂载
      }
    };
    /**
     * 解析dom元素
     * @param {*} el dom挂载点
     */


    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var options = vm.$options;

      if (!options.render) {
        //先看一下用户是否传入了render方法
        var template; // 没有render看一下是否写了template,没写采用外部的template

        if (!options.template && el) {
          template = el.outerHTML;
        } else {
          if (el) {
            template = options.template; //如果有el采用模板、
          }
        } // 如果写了template就需要对模板进行编译，最终生成一个render函数。


        if (template) {
          var render = compileToFunction(template);
          options.render = render; // jsx最终会被编译成h('xxx')
        }
      } // 最终可以获取到render方法。


      mountComponent(vm, el); // 组件的挂载
    };
  }

  function Vue(options) {
    // 这个_init函数在Vue的原型对象上。
    this._init(options); //用户的配置

  }

  initMixin(Vue); // 将initMixin方法添加到Vue的原型上

  initLifeCycle(Vue); // vm_update vm._render

  initGlobalAPI(Vue); // 初始化api——mixin，全局api

  initStateMixin(Vue); // 实现了nextTick $watch
  // -------------------方便调试-----------

  var render1 = compileToFunction("<ul key='a' style=\"color:green\">\n  <li key=\"a\">a</li>\n  <li key=\"b\">b</li>\n  <li key=\"c\">c</li>\n</ul>");
  var vm1 = new Vue({
    data: {
      name: 'hzg'
    }
  });
  var preVnode = render1.call(vm1); // 渲染到document上s

  var el = createElm(preVnode);
  document.body.appendChild(el);
  var render2 = compileToFunction("<ul key='a' style=\"color:red;\">\n  <li key=\"a\">a</li>\n  <li key=\"b\">b</li>\n  <li key=\"c\">c</li>\n  <li key=\"d\">d</li>\n</ul>");
  var vm2 = new Vue({
    data: {
      name: 'demo'
    }
  });
  var nextVnode = render2.call(vm2);
  setTimeout(function () {
    // 直接将老的替换新的，比较消耗性能；可以先比较两个节点的区别之后在进行比较。
    // 而diff算法就就是一个平级比较。父亲比较父亲，儿子和儿子进行比较。
    // let newEle = createElm(nextVnode)
    // el.parentNode.replaceChild(newEle, el)
    patch(preVnode, nextVnode);
  }, 1000);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
