/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2024  All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: 
 * +----------------------------------------------------------------------
 */

import Vue from 'vue';
import VueRouter from 'vue-router';
import { LoadingBar } from 'view-design';
import * as utils from '@/utils';
import * as config from '@/config';

Vue.use(VueRouter);

const originalPush = VueRouter.prototype.push;
const originalReplace = VueRouter.prototype.replace;

VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err);
};
VueRouter.prototype.replace = function replace(location) {
    return originalReplace.call(this, location).catch(err => err);
};

export const routes = [
    require('@/views/home/router'),
    require('@/views/user/router'),
    require('@/views/basic/router'),
    require('@/views/iot/router'),
    require('@/views/oa/router'),
    require('@/views/statistic/router'),
    require('@/views/setting/router'),
    require('@/views/print/router'),
    require('@/views/404/router')
];

const router = new VueRouter({
    mode: 'history',
    routes
});

router.beforeEach((to, from, next) => {
    const titles = [];

    to.matched.forEach(({ meta }) => titles.push(meta.title));

    document.title = `${titles.reverse().join('-')} | ${config.SITE_TITLE} `;
    LoadingBar.start();
    if (to.meta.authRequired && !utils.auth.isLogin()) {
        next({
            path: '/user/login',
            query: {
                redirect: to.path
            }
        });
    } else {
        next();
    }
});

router.afterEach(() => {
    LoadingBar.finish();
});

export default router;
