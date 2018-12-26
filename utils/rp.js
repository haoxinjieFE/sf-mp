import { CSTOKEN, CUSS, LOGOUT_ERR } from './constant.js';

let isConnected = true;
let networkType = 'wifi';
const ERROR_CODE = {
  413: '上传文件过大，请更换!',
  500: '服务器错误'
}
/**
 * 封装wx.request接口用于发送Ajax请求，
 *
 */
class Ajax {

  constructor() {
    this.header = {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    }
  }

  /**
   * Ajax Get方法
   *
   * @param {String} url 请求接口地址
   * @param {Object} data 请求数据
   *
   * @returns Promise
   */
  get(url, data = {}) {

    return new Promise((resolve, reject) => {
      if (!isConnected) {
        reject(new Error('当前网络已断开，请检查网络设置！'));
        return;
      }
      request(url, data,'GET', this.header, resolve, reject);
    });
  }

  /**
   * Ajax Post方法
   *
   * @param {String} url 请求接口地址
   * @param {Object} data 请求数据
   *
   * @returns Promise
   */
  post(url, data = {}) {

    return new Promise((resolve, reject) => {
      if (!isConnected) {
        reject(new Error('当前网络已断开，请检查网络设置！'));
        return;
      }

      request(url, data,'POST', this.header, resolve, reject);
    });
  }

  upload(url, opt) {
    return new Promise((resolve, reject) => {
      if (!isConnected) {
        reject(new Error('当前网络已断开，请检查网络设置！'));
        return;
      }

      upload(url, opt.filePath, opt.name, resolve, reject);
    });
  }
  /**
   * 设置网络状态监听，启用时，会将网络连接状态，同步用于控制接口请求。
   *
   * @static
   * @memberof Ajax
   */
  static setupNetworkStatusChangeListener() {
    wx.getNetworkType({
      success: (res) => {
        networkType = res.networkType;
        isConnected = networkType === 'none' ? false : true;
      }
    });
    if (wx.onNetworkStatusChange) {
      wx.onNetworkStatusChange(res => {
        isConnected = !!res.isConnected;
        networkType = res.networkType;
        if (!res.isConnected) {
          toast('当前网络已断开');
          const getCurrentPagePath = function () {
            let pages = getCurrentPages();
            let idx = pages.length - 1;
            return pages[idx].route;
          }
          if (getCurrentPagePath() !== 'pages/noNetWork/noNetWork') {
            wx.navigateTo({
              url: '/pages/noNetWork/noNetWork'
            })
          }

        } else {
          if ('2g, 3g, 4g'.includes(res.networkType)) {
            toast(`已切到数据网络`);
          }
        }
      });
    }
  }

  static getNetworkConnection() {
    return !!isConnected;
  }

  /**
   * 设置小程序版本更新事件监听，根据小程序版本更新机制说明
   *
   * @static
   * @returns
   * @memberof Ajax
   */
  static setupAppUpdateListener() {
    let updateManager = null;
    if (wx.getUpdateManager) {
      updateManager = wx.getUpdateManager();
    } else {
      return;
    }

    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      //console.debug('是否有新版本：', res.hasUpdate);
    });

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        confirmText: '重 启',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate();
          }
        }
      });
    });

    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
      //console.error("新的版本下载失败！");
    });
  }


}

function request(url, data, method, header, resolve, reject) {
  header = {
    ...header,
     Cookie: `${CSTOKEN}=${wx.getStorageSync(CSTOKEN)};${CUSS}=${wx.getStorageSync(CUSS)}`,
  }
  return wx.request({
    url,
    data: serial(data),
    header,
    method,
    success: res => {
      let { data, statusCode } = res;
      if (String(statusCode).startsWith('2')) {
        if (data && data.errno == 0) {
          resolve(data);
        } else {
          let msg = data.errmsg || '系统错误';
          toast(msg);
          reject(new Error(msg));
        }
      } else {
        let msg = `错误码:${statusCode} ${ERROR_CODE[statusCode] || '未定义错误'}`
        toast(msg);
        reject(new Error(msg));
      }

    },
    fail: error => {
      let msg = '';
      if (typeof error === 'object') {
        if (error.constructor === Error) {
          msg = error.message;
        } else {
          let { errMsg } = error;
          msg = errMsg ? errMsg : JSON.stringify(error);
        }
      } else {
        msg = error;
      }
      toast(msg);
      reject(new Error(msg));
    },
    complete: () => {

    }
  });
}
function upload(url, filePath, name, resolve, reject, header = {}, formData = {}) {
  header = {
    ...header,
    Cookie: `${CSTOKEN}=${wx.getStorageSync(CSTOKEN)};${CUSS}=${wx.getStorageSync(CUSS)}`,
  }
  return  wx.uploadFile({
    url,
    filePath,
    name,
    header,
    formData,
    success: res => {
      let { data, statusCode } = res;
      if (String(statusCode).startsWith('2')) {
        data = typeof data === 'object' ? data : JSON.parse(data);
        if (data && data.errno == 0) {
          resolve(data);
        } else {
          let msg = data.errmsg || '上传失败！请重试';
          toast(msg);
          reject(new Error(msg));
        }
      } else {
        let msg = `错误码:${statusCode} ${ERROR_CODE[statusCode] || '未定义错误'}`
        toast(msg);
        reject(new Error(msg));
      }


    },
    fail: error => {
      let msg = '';
      if (typeof error === 'object') {
        if (error.constructor === Error) {
          msg = error.message;
        } else {
          let { errMsg } = error;
          msg = errMsg ? errMsg : JSON.stringify(error);
        }
      } else {
        msg = error;
      }
      toast(msg);
      reject(new Error(msg));
    }

  });
}
function toast(title, duration = 2000) {
  wx.showToast({
    icon: 'none',
    title,
    duration
  });
}

function serial(obj) {
  let temp = Array.isArray(obj) ? [] : {};
  for (let k in obj) {
    temp[k] = typeof(obj[k]) === 'object' ? JSON.stringify(obj[k]) : obj[k];
  }
  return temp;
}
export default Ajax;
