import { transformRpxToPx } from "../../../utils/tools";

let markAnimation = null;
let infoAnimation = null;
const DURATION = 300;

/* 生命周期 */
const componentLifeCycle = {

    created() {
      this.createAnimation();

    },
    attached() {

    },
    ready() {

    },
    moved() {

    },
    detached() {

    },
};

/* 事件函数 */
const bindEvent = {
  onTouchPreventDef() {}, // 阻止模态窗出现之后，屏下滑动
  onClickCancel() {
    this.triggerEvent('hideDialog');
  }
};

/* 通用方法 */
const customedEvent = {
  getInfoStyleHeight(cb) {
    const query = this.createSelectorQuery();
    query.select('.info').fields({
      size: true,
    }, (res) => {
      this.setData({
        dialogHeight: res ? res.height : 0
      }, cb);
    }).exec();
  },
  createAnimation() { // 创建两个动画对象
    markAnimation = wx.createAnimation({
      duration: DURATION,
      timingFunction: 'ease',
    });

    infoAnimation = wx.createAnimation({
      duration: DURATION,
      timingFunction: 'ease',
      transformOrigin: '0 0 0'
    });
  },
  initAnimation() { // 动画进入动作
    markAnimation.opacity(0.4).step();
    infoAnimation.translateY(0).step();
  },
  destoryAnimation() { // 动画退出动作
    markAnimation.opacity(0).step();
    infoAnimation.translateY(this.data.dialogHeight).step();
  },
  setAnimationData() { // 产生动画
    this.setData({
      markAnimation: markAnimation.export(),
      infoAnimation: infoAnimation.export(),
    });
  },
};

/* data值 */
const wxData = {
  isShow: false,
  markAnimation: null,
  infoAnimation: null,
  dialogHeight: 0, // 单位px
}

/* 属性 */
const properties = {
  isShowDialog: {
    type: Boolean,
    observer: function(isShow){
      if (isShow) {
        this.setData({
          isShow, // 在页面渲染出来之后，在开始动画
        }, () => {
          this.getInfoStyleHeight(() => {
            this.initAnimation();
            this.setAnimationData();
          });
        });
      } else {
        this.destoryAnimation();
        this.setAnimationData();
        setTimeout(() => this.setData({isShow,}), DURATION);
      }
    }
  }
}


Component({
    data: wxData,
    behaviors: [],
    options: {
      multipleSlots: true // 在组件定义时的选项中启用多slot支持
    },
    properties,
    methods: {
        ...bindEvent,
        ...customedEvent,
    },
    ...componentLifeCycle,
})
