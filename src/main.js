// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

require("./less/style.less");

/* eslint-disable no-new */
Date.prototype.format = function (format) {
    const zeros = ['', '0', '00', '000'];
    const c = {
        'M+': this.getMonth() + 1,
        'd+': this.getDate(),
        'h+': this.getHours(),
        'm+': this.getMinutes(),
        's+': this.getSeconds(),
        'q+': Math.floor((this.getMonth() + 3) / 3),
        'S+': this.getMilliseconds(),
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (`${this.getFullYear()}`).substr(4 - RegExp.$1.length));
    }

    for (const k in c) {
        if (new RegExp(`(${k})`).test(format)) {
            format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (c[k]) : ((zeros[RegExp.$1.length] + c[k]).substr((`${c[k]}`).length)));
        }
    }
    return format;
};
new Vue({
    el: '#app',
    template: '<App/>',
    components: {
        App
    }
})
