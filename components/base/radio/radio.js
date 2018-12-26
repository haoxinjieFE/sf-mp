
/* 生命周期 */
const componentLifeCycle = {

    created() {

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
  onChangeSelect() {
    if (this.data.isDisabled) {
      return;
    }
    this.triggerEvent('changeChecked', {isChecked: !this.data.isChecked});
  }
};

/* 通用方法 */
const customedEvent = {

};

/* data值 */
const wxData = {
}

/* 属性 */
const properties = {
  isChecked: {
    type: Boolean,
  },
  isDisabled: {
    type: Boolean,
    value: false,
  }
}


Component({
    data: wxData,
    behaviors: [],
    properties,
    methods: {
        ...bindEvent,
        ...customedEvent,
    },
    ...componentLifeCycle,
})
