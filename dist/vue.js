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

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);

      // Object.defineProperty只能劫持已经存在的属性，不能劫持新增的属性（为此vue会新增一些方法例如：$set, $delete）
      if (Array.isArray(data)) {
        //  修改数组的每一项时进行修改，不管是基本数据类型，还是引用数据类型。
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
