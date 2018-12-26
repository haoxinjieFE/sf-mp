import { checkLogin, getApproveInfo, getShopCartSum, uploadFormId } from '../api/common';
import { wxLoginPr } from "./wxApiPromise";
const regeneratorRuntime = require('../vendor/runtime');
import { CSTOKEN, CUSS, LOGOUT_ERR, PHONE, APPROVE_STATUS_MAP, SUCCESS } from './constant';
const appInstance = getApp();
/**
 * 更新Global 里的登录状态 和 账户状态
 *
 */
export const updateGlobalIsloginAndStatus = async function () {
  try {
    if (wx.getStorageSync(CSTOKEN) && wx.getStorageSync(CUSS)) { // 兼容后端，缺少参数，会报错, 如果缺少参数，直接返回 false
      appInstance.global.isLogin = !!(await checkLogin()).data;
    } else {
      appInstance.global.isLogin = false;
    }

    if (wx.getStorageSync(PHONE)) { // 兼容后端，缺少参数，会报错, 如果缺少参数，直接返回 ''
      appInstance.global.accountStatus = (await getApproveInfo()).data.status;
    } else {
      appInstance.global.accountStatus = '';
    }

  } catch (err) {
    console.log(err.message)
  }
}
/**
 * 更新Global 购物车上商品数量
 * @returns {String} 商品数量
 */
export const updateGlobalCartNum = async () => {
  const { isLogin, accountStatus } = appInstance.global;
  let numStr = '';
  if (isLogin && APPROVE_STATUS_MAP[accountStatus] === SUCCESS) {
    try {
      let num = (await getShopCartSum()).data;
      numStr = num > 999 ? '999+' : num + '';

    } catch (err) {
      console.log(err.message)
    }
  }
  appInstance.global.shoppingCartNum = numStr;
  return numStr;
}
/**
 * 根据Global 购物车数量 设置 Tab 页 购物车展示数量
 *
 */
export const setTabCartNumByGloba = function () {
  const { shoppingCartNum } = appInstance.global;
  if (+shoppingCartNum) {
    wx.setTabBarBadge({
      index: 2,
      text: shoppingCartNum,
    })
  } else {
    wx.removeTabBarBadge({
      index: 2,
    })
  }
}

/**
 * 字段检验
 *
 * @param {object} params 需要检验的参数对象
 * {
 *   k1: v1,
 *   k2: v2
 * }
 * @param {object} rule 校验规则
 *
 * @returns {boolean} 通过返回true 不通过返回false
 */
export const validator = (params, rule) => {
  let _params = params || {};
  let _rule = rule || {};
  if (!Object.keys(_params).length || !Object.keys(_rule).length) {
    return true;
  }
  let ruleFn = getRuleFn();
  let result = true;
  for (let key in _rule) {
    if (!_params.hasOwnProperty(key)) {
      continue;
    }
    for (var i = 0; i < _rule[key].length; i++) {
      let item = _rule[key][i];
      if (typeof item.useFnName === 'string' && ruleFn[item.useFnName]) {
        if (!ruleFn[item.useFnName](_params[key])) {
          wx.showToast({
            title: item.msg,
            icon: 'none'
          });
          break;
        }
      } else {
        throw new Error('未定义检验函数');
      }
    }
    if (i !== _rule[key].length) {
      result = false;
      break;
    }

  }
  return result;
}

function getRuleFn() {
  return {
    'require': function (v) {
      if (typeof v === 'string') {
        return !!v;
      } else {
        if (v.constructor === 'Array') {
          return !!v.length
        } else {
          return !!Object.keys(v).length
        }
      }

    },
    'isMobile': function (v) {
      let reg = /^1[3,4,5,6,7,8,9]\d{9}$/;
      return reg.test(v);
    },
    'isTel': function (v) {
      let reg = /^(\d{2,4}[-_－—]?)?\d{3,8}([-_－—]?\d{3,8})?([-_－—]?\d{1,7})?$/;
      return reg.test(v);
    }
  }
}

/**
 * 类似于vue的watch
 *
 * @param {object} ctx page 的this
 * @param {object} obj 需要监听的值
 * {
 *   key: callback(newVale){}
 * }
 *
 *
 */
export const watch = (target, obj) => {
  Object.keys(obj).forEach((key) => {
    defineReactive(target, key, target[key], function (newVal) {
      obj[key](newVal);
    });
  });
}

function observe(obj, fn) {
  if (typeof obj === 'object') {
    for (var i in obj) {
      defineReactive(obj, i, obj[i], fn);
    }
  }
}

function defineReactive(data, key, val, fn) {
  observe(val, fn);
  Object.defineProperty(data, key, {
    configurable: true,
    enumerable: true,
    get: function () {
      return val
    },
    set: function (newVal) {
      if (newVal === val) return
      val = newVal
      fn && fn(newVal)
    },
  })
}

/**
 * 获取当前页面路径
 *
 * @returns {String} path
 */

export const getCurrentPagePath = function () {
  let pages = getCurrentPages();
  let page = pages[pages.length - 1];
  let pageRoute = page.route;
  let pageOptions = page.options || {};
  let args = Object.entries(pageOptions).reduce((res, [k, v], idx, arr) => res += `${k}=${v}${idx === arr.length - 1 ? '' : '&'}`, '');

  return `${pageRoute}${args ? '/?' + args : ''}`;
}

/**
 * 获取跳转到当前页面的path
 *
 * @returns {String} path
 */

export const getFromPath = function () {
  let pages = getCurrentPages();
  let idx = pages.length - 2 >= 0 ? pages.length - 2 : pages.length - 1;
  return pages[idx].route;
}


export const checkAccountByGlobaStatus = function () {
  const appInstance = getApp();
  const { isLogin, accountStatus } = appInstance.global;
  const preventRepeatPath = ["pages/login/login", "pages/approve/approve"]; // 防止无限跳转
  console.log(getFromPath())
  if (!isLogin) { // 账号未登录
    preventRepeatPath.includes(getFromPath()) || wx.navigateTo({
      url: '/pages/login/login',
    });
  } else if (APPROVE_STATUS_MAP[accountStatus] !== SUCCESS) { // 账号已登录 未通过审核
    preventRepeatPath.includes(getFromPath()) || wx.navigateTo({
      url: '/pages/approve/approve',
    });
  } else {
    return true;
  }
}

/**
 * 补零
 *
 * @param {string|number} target 操作的目标
 * @param {number} len 补充完之后的长度，如果超出会截取
 * @param {string} str 要添加的东东
 * @param {string} dir 添加的方向 default:right
 *
 * @returns {string}
 */
export const paddingStr = (target, len, str, dir = 'right') => {

  if (dir !== 'right' && dir !== 'left') {
    throw new Error('dir 方向只能为right 或者 left');
  }
  let _target = target + '';
  let _len = len;
  let _str = str + '';
  let _dir = dir;
  let result = '';
  if (_target.length >= len) {
    return _target;
  }
  while (true) {
    if (_dir === 'right') {
      result = _target + str;
    } else {
      result = str + _target;
    }
    if (result.length == len) {
      break;
    } else if (result.length > len) {
      result = result.substr(0, len);
      break;
    }
  }
  return result;
}

/**
 * 时间格式化
 *
 * @param {object} opt
 * {
 *   rule: 'y-M-d' 可选字符( y|Y, M, d|D, h|H, m, s|S ) 对应年、月、日、时、分、秒
 *   isPadding: true 是否补0，比如5月份 返回05
 * }
 * @param {object} date
 *   default: new Date()
 * @returns {string} 格式化时间的结果
 */
export const formatDate = (opt, date = new Date()) => {
  const _toString = Object.prototype.toString;
  if (opt.toString() !== '[object Object]') {
    throw new Error('日期格式配置参数为object!');
  }
  let _rule = opt.rule || 'y-M-d';
  let _isPadding = opt.isPadding || true;
  let _date = null;

  if (typeof date === 'object' && _toString.call(date) === '[object Date]') {
    _date = date;
  } else {
    // 兼容ios
    _date = new Date(date.replace(/-/g, "/"));
    if (_date == 'Invalid Date') {
      throw new Error('无效的日期参数!');
    }
  }
  let result = '';
  _rule.split('').forEach((item) => {
    let temp = '';
    if (item !== 'm' && item !== 'M') {
      temp = item.toLocaleLowerCase();
    } else {
      temp = item;
    }
    switch (temp) {
      case 'y':
        result += _date.getFullYear();
        break;
      case 'M':
        let M = _isPadding ? paddingStr((_date.getMonth() + 1), 2, '0', 'left') : (_date.getMonth() + 1);
        result += M;
        break;
      case 'd':
        let d = _isPadding ? paddingStr(_date.getDate(), 2, '0', 'left') : _date.getDate();
        result += d;
        break;
      case 'h':
        let h = _isPadding ? paddingStr(_date.getHours(), 2, '0', 'left') : _date.getHours();
        result += h;
        break;
      case 'm':
        let m = _isPadding ? paddingStr(_date.getMinutes(), 2, '0', 'left') : _date.getMinutes();
        result += m;
        break;
      case 's':
        let s = _isPadding ? paddingStr(_date.getSeconds(), 2, '0', 'left') : _date.getSeconds();
        result += s;
        break;
      default:
        result += item;
    }
  });
  return result;

}

/**
 * 延迟
 *
 * @param {Number} time 单位 秒
 */
export const delay = (time) => new Promise((resolve, reject) => {
  setTimeout(resolve, time * 1000);
});

/**
 * 价格处理函数
 * 入参 price 单位 分
 * 出参 price 单位 元 (支持输出 完整价格/整数部分/小数部分)
 * @param {String} price 转换的类型
 * @param {String} type 转换的类型
 * @returns {String} 转换后的价格
 * **/
export const formatPrice = function (price, type = 'normal') {
  let resultPrice = 0;
  switch (type) {
    case 'normal':
      resultPrice = (price / 100).toFixed(2); // 保留两位有效数字
      break;
    case 'int':
      resultPrice = parseInt(price / 100); // 保留整数
      break;
    case 'float':
      resultPrice = (price % 100).toString().length === 1 ? ('0' + (price % 100)) : Math.round(price % 100);
      break;
    case 'full':
      resultPrice = parseInt(price / 100) + '.' + ((price % 100).toString().length === 1 ? ('0' + (price % 100)) : Math.round(price % 100));
  }
  return resultPrice;
};

/**
 * 根据商品的类型,是否打折，返回商品的单位价格
 *
 * @param {Object} sku 商品数据
 * @returns {String} 单位价格
 */
export const getUnitPrice = (sku) => {
  let { discount_info: { is_discounted, discounted_weight_price, discounted_main_price }, sku_type, weight_price, main_price, weight_unit, main_unit } = sku;
  let res = '';
  if (is_discounted) { // 是否打折
    switch (sku_type) {
      case '标品': res = jointPrice(discounted_main_price, main_unit); break;
      case '非标品': res = jointPrice(discounted_weight_price, weight_unit); break;
    }
  } else {
    switch (sku_type) {
      case '标品': res = jointPrice(main_price, main_unit); break;
      case '非标品': res = jointPrice(weight_price, weight_unit); break;
    }
  }
  return res;

}

function jointPrice(price, unit) {
  return `${formatPrice(price, 'int')}.${formatPrice(price, 'float')}/${unit}`;
}

/**
 * Global 中是否有退货数据，有的话，清除
 *
 * **/
export const clearGlobalReturnsList = function () {
  let { returnsList } = getApp().global;
  returnsList.size && returnsList.clear();
};

/**
 * 将Global 中的 formIds 上传到后台
 * @returns {Object} promise
 */
export const submitFormIds = function () {
  let { formIds } = getApp().global;
  if (!formIds.size) {
    return Promise.reject('formIds不足!');
  }
  return wxLoginPr()
  .then(code => {
    return uploadFormId({
      code,
      form_ids: [...formIds]
    })
  })
  .then(res => {
    formIds.clear();
  })
  .catch(err => {
    toast(err.message);
  });

};

function toast(title, duration = 2000) {
  wx.showToast({
    icon: 'none',
    title,
    duration
  });
}
