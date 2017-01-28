// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Chat from './Chat'
import Login from './Login'

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

import VueRouter from 'vue-router'

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        component: Chat
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/chat',
        component: Chat
    }
];

const router = new VueRouter({
    routes // short for routes: routes
});

new Vue({
    router
}).$mount('#app');