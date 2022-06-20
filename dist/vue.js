(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  // Regular Expressions for parsing tags and attributes
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); //匹配到的是一个标签名

  console.log(startTagOpen);
  function compileToFunctions(template) {// 1. 就是将template转化为ast语法树
    // 2. 生成render方法（render方法执行后的返回的结果就是 虚拟dom）
  }

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

  // 获取 数组的原型
  var oldArrayProto = Array.prototype; // 拷贝一份数组原型，修改数组方法，不会影响Array的方法。

  var newArrayProto = Object.create(oldArrayProto); // 这里是改变元素组的方法。

  var methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'];
  methods.forEach(function (method) {
    // arr.push([1,2,3])
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
      }

      return result;
    };
  });

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);

      // Object.defineProperty只能劫持已经存在的属性，不能劫持新增的属性（为此vue会新增一些方法例如：$set, $delete）
      // 把Observe挂载到__ob__上，做一个标识（识别是否已经监听），同时可以使用walk和observeArray方法。
      // 使用Object.defineProperty方法加上__ob__属性，表示已经监听，并且让这个属性不可枚举，防止死循环。
      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false
      });

      if (Array.isArray(data)) {
        // 为了解决数组中新增的属性不能劫持的问题，需要重写素组方法，并且不可以影响之前的数组方法。
        // 新建一个array.js实现新增属性的方法重写。
        data.__proto__ = newArrayProto; //  修改数组的每一项时进行修改，不管是基本数据类型，还是引用数据类型。

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
  }(); // 劫持数据，响应式数据， 这是一个闭包


  function defineReactive(target, key, val) {
    // 如果val是对象，则递归调用，劫持对象。
    observe(val); // 对对象重新定义了。

    Object.defineProperty(target, key, {
      // 取值的时候
      get: function get() {
        // console.log('用户取值了',key)
        return val;
      },
      // 设置或者修改值时执行
      set: function set(newVal) {
        if (val !== newVal) {
          // console.log('用户设置，修改了值')
          // 对修改的对象属性进行劫持。
          observe(newVal);
          val = newVal;
        }
      }
    });
  }
  function observe(data) {
    // 对这个对象进行劫持
    if (_typeof(data) !== 'object' || data === null) {
      return; //只对对象进行劫持
    }

    if (data.__ob__ instanceof Observe) {
      return data.__ob__;
    } // 如果一个对象已经被劫持了，那么它就不需要再次被劫持。（判断方法是：添加一个实例，用实例来判断）
    // 新增了Observer实例，判断这个对象是否已经被劫持


    return new Observe(data);
  }

  function initState(vm) {
    var option = vm.$options;

    if (option.data) {
      initData(vm);
    }
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
  }

  function initData(vm) {
    var data = vm.$options.data; // data可能是函数

    data = typeof data === 'function' ? data.call(this) : data; // 把返回的对象放到_data上。

    vm._data = data; // 对vue2的数据进行劫持，采用一个api，defineProperty

    observe(data); // 将vm._data挂载到vm上,用vm来代理

    proxy(vm, '_data');
  }

  function initMixin(Vue) {
    // 给vue添加一个用于初始化操作的_init方法
    Vue.prototype._init = function (options) {
      var vm = this; // 使用vue时的$nextTick()，$data等等，将用户的选项挂载到实例上

      vm.$options = options; // 初始化状态

      initState(vm);

      if (options.el) {
        vm.$mount(options.el); //实现数据的挂载
      }
    };

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
        } // 如果写了template就需要对模板进行编译


        if (template) {
          var render = compileToFunctions();
          options.render = render; // jsx最终会被编译成h('xxx')
        }
      }
    };
  }

  function Vue(options) {
    // 这个_init函数在Vue的原型对象上。
    this._init(options); //用户的配置

  }

  initMixin(Vue); // 将initMixin方法添加到Vue的原型上

  return Vue;

}));
//# sourceMappingURL=vue.js.map
