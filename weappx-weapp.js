!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports["weappx-weapp"]=e():t["weappx-weapp"]=e()}("undefined"!=typeof self?self:this,function(){return function(n){var o={};function r(t){if(o[t])return o[t].exports;var e=o[t]={i:t,l:!1,exports:{}};return n[t].call(e.exports,e,e.exports,r),e.l=!0,e.exports}return r.m=n,r.c=o,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:n})},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=0)}([function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var u=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(t[o]=n[o])}return t},s=n(1);function o(e){return Array.isArray(e)?e.map(function(t){return{key:t,val:t}}):Object.keys(e).map(function(t){return{key:t,val:e[t]}})}function f(t){var o=this,r={},a=(0,s.getStore)().getState();return t.forEach(function(t){var e=t.key,n=t.val;r[e]="function"==typeof n?n.call(o,a):a[n]}),r}var r={connectPage:function(){var c=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{};return c=o(c),function(t){var e=null,n=t.onLoad,o=t.onUnload,r=t.onShow,a=t.onHide,i=function(){var n=this;if(!this.$hide){var o=f(c),r=!1;Object.keys(o).forEach(function(t){var e=o[t];n.data[t]!==e&&(r=!0)}),r&&this.setData(o)}};return u({},t,{data:Object.assign(t.data||{},f(c)),onLoad:function(){var t=(0,s.getStore)();e=t.subscribe(i.bind(this)),i.call(this),n&&n.apply(this,arguments)},onUnload:function(){e&&e(),e=null,o&&o.apply(this,arguments)},onShow:function(){this.$hide=!1,i.call(this),r&&r.apply(this,arguments)},onHide:function(){this.$hide=!0,a&&a.apply(this,arguments)}})}},connectComponent:function(){var i=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{};return i=o(i),function(t){var e=null,n=t.methods||{},o=n.attached||t.attached,r=n.detached||t.detached;n.attached&&delete n.attached,n.detached&&delete n.detached;var a=function(){var n=this,o=f(i),r=!1;Object.keys(o).forEach(function(t){var e=o[t];n.data[t]!==e&&(r=!0)}),r&&this.setData(o)};return u({},t,{data:Object.assign(t.data||{},f(i)),attached:function(){var t=(0,s.getStore)();e=t.subscribe(a.bind(this)),a.call(this),o&&o.apply(this,arguments)},detached:function(){e&&e(),e=null,r&&r.apply(this,arguments)}})}},setStore:s.setStore,getStore:s.getStore};e.default=r,t.exports=e.default},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.getStore=function(){return o},e.setStore=function(t){o=t};var o=void 0}])});