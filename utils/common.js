/* 公用方法，其他项目可直接复用 */

/**
 * 将 Map 转为 Object
 * @param {Map} map
 * @returns {Object}}
 * **/

export const mapToObj = (map) => {
  if (map.constructor !== Map) {
    throw new Error('参数类型不为Map类型');
  }
  let temp = {};
  for (const [k, v] of map) {
    temp[k] = v;
  }
  return temp;
}

/**
 * 将 Object 转为 Map
 * @param {Object} obj
 * @returns {Map}
 * **/

export const objToMap = (obj) => {
  if (obj.constructor !== Object) {
    throw new Error('参数类型不为Object类型');
  }
  let temp = new Map();
  for (const [k, v] of Object.entries(obj)) {
    temp.set(k, v);
  }
  return temp;
}

/**
 * 将对象数组中的特定key转换为对象
 * @param {Object[]} arr
 * @param {String} key
 * @returns {Object}
 * **/

export const arrObjToObj = (arr, key) => {
  if (!Array.isArray(arr)) {
    throw new Error('参数arr类型不为Array类型');
  }
  let temp = {};
  arr.forEach(item => {
    if (item[key] === undefined) {
      return;
    }
    temp[item[key]] = item;
  });
  return temp;
}


/**
 * 深克隆
 *
 * @param {object} obj 要复制的对象
 *
 * @returns {object}
 */
export const deepClone = (obj) => {
  var _toString = Object.prototype.toString;

  // null, undefined, non-object, function
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  // DOM Node
  if (obj.nodeType && 'cloneNode' in obj) {
    return obj.cloneNode(true);
  }

  // Date
  if (_toString.call(obj) === '[object Date]') {
    return new Date(obj.getTime());
  }

  // RegExp
  if (_toString.call(obj) === '[object RegExp]') {
    var flags = [];
    if (obj.global) { flags.push('g'); }
    if (obj.multiline) { flags.push('m'); }
    if (obj.ignoreCase) { flags.push('i'); }

    return new RegExp(obj.source, flags.join(''));
  }

  var result = Array.isArray(obj) ? [] :
    obj.constructor ? new obj.constructor() : {};

  for (var key in obj) {
    result[key] = deepClone(obj[key]);
  }

  return result;
}


/**
 * 字段检验
 *
 * @param {Object} params 需要检验的参数对象
 * {
 *   k1: v1,
 *   k2: v2
 * }
 * @param {Object} rule 校验规则
 * {
 *  k1: [
 *    {
 *      useFnName: 'require',
 *      msg: '不能为空'
 *    }
 *  ]
 * }
 *
 * @returns {Object} {
 *    result 校验结果
 *    field  第一个检验不通过的字段
 *  }
 */
export const validator = (params, rule) => {
  let _params = params || {};
  let _rule = rule || {};
  if (!Object.keys(_params).length || !Object.keys(_rule).length) {
    return true;
  }
  let ruleFn = getRuleFn();
  let result = true;
  let field = '';
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
          field = key;
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
  return {
    result,
    field
  };
}

function getRuleFn() {
  return {
    'require': function (v) {
      if (typeof v === 'string') {
        return !!v;
      } else if (typeof v === 'object') {
        if (v.constructor === 'Array') {
          return !!v.length
        } else {
          return !!Object.keys(v).length
        }
      } else if (typeof v === 'number') {
        return true;
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
