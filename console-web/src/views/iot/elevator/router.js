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

const ROLES = require('@/constants/role');

module.exports = {
    path: 'elevator',
    meta: {
        title: '智能梯控',
        authRequired: true,
        layout: 'sider',
        nav: true,
        icon: 'elevator',
        roles: [ROLES.ANYONE]
    },
    component: () => import('./index'),
    children: [
        {
            path: '',
            meta: {
                title: '通行记录',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ANYONE]
            },
            component: () => import('./log')
        },
        {
            path: 'manage',
            meta: {
                title: '梯控管理',
                authRequired: true,
                layout: 'sider',
                nav: true,
                roles: [ROLES.ZNTK]
            },
            component: () => import('./manage')
        }
    ]
};
