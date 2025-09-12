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

import utils from './utils/index';

App({
    data: {
        globalFetching: true,
        userInfo: {
            access: []
        },
        postInfo: {
            community_list: [],
            default_community_id: null
        },
        systemInfo: {},
        navBarHeight: 'auto'
    },

    onLaunch() {
        // 检查更新
        this.checkUpdate();

        // 适配
        this.adaptive();

        // 检查网络
        this.checkNetwork();
    },

    onShow(opts) {
        if (utils.storage.isLogin()) {
            this.getUserInfo();
        } else {
            const query = [];
            for (let key in opts.query) {
                query.push(`${key}=${opts.query[key]}`);
            }
            const redirect = encodeURIComponent(`/${opts.path}${query.length ? '?' : ''}${query.join('&')}`);

            return wx.redirectTo({
                url: `/pages/login/index?redirect=${redirect}`
            });
        }
    },

    onPageNotFound() {
        wx.redirectTo({
            url: '/pages/error/general'
        });
    },

    checkUpdate() {
        const updateManager = wx.getUpdateManager();

        updateManager.onCheckForUpdate(res => {
            if (!res.hasUpdate) {
                return;
            }

            wx.showLoading({
                title: '版本更新中…',
                mask: true
            });

            updateManager.onUpdateReady(() => {
                wx.hideLoading();
                wx.showModal({
                    title: '更新提示',
                    content: '新版本已经准备好，是否重启应用？',
                    success(res) {
                        if (res.confirm) {
                            updateManager.applyUpdate();
                        }
                    }
                });
            });

            updateManager.onUpdateFailed(() => {
                wx.hideLoading();
                wx.showToast({
                    title: '更新失败',
                    icon: 'error'
                });
            });
        });
    },

    adaptive() {
        // 使用新 API 获取信息，兼容旧版本回退到 getSystemInfoSync
        let deviceInfo = {};
        let windowInfo = {};
        let appBaseInfo = {};

        try {
            if (typeof wx.getDeviceInfo === 'function') {
                deviceInfo = wx.getDeviceInfo();
            }
        } catch (e) {}

        try {
            if (typeof wx.getWindowInfo === 'function') {
                windowInfo = wx.getWindowInfo();
            }
        } catch (e) {}

        try {
            if (typeof wx.getAppBaseInfo === 'function') {
                appBaseInfo = wx.getAppBaseInfo();
            }
        } catch (e) {}

        let systemInfo = {
            ...deviceInfo,
            ...windowInfo,
            ...appBaseInfo
        };

        // 兼容：若关键字段缺失，则回退
        if (systemInfo.statusBarHeight == null || !systemInfo.brand) {
            try {
                const legacy = wx.getSystemInfoSync();
                systemInfo = { ...legacy, ...systemInfo };
            } catch (e) {}
        }

        // 导航胶囊尺寸
        let navBarHeight = 'auto';
        try {
            if (typeof wx.getMenuButtonBoundingClientRect === 'function') {
                const { top, height } = wx.getMenuButtonBoundingClientRect();
                if (systemInfo.statusBarHeight != null) {
                    navBarHeight = (top - systemInfo.statusBarHeight) * 2 + height;
                }
            }
        } catch (e) {}

        this.data.systemInfo = {
            ...systemInfo,
            navBarHeight
        };
    },

    checkNetwork() {
        wx.getNetworkType({
            success: res => {
                // 未连接网络
                if (res.networkType === 'none') {
                    wx.redirectTo({ url: '/pages/error/network' });
                }
            }
        });
    },

    getUserInfo() {
        return utils
            .request({
                url: '/user/info',
                method: 'get'
            })
            .then(res => {
                this.updateData({
                    userInfo: res.data.userInfo,
                    postInfo: res.data.postInfo,
                    globalFetching: false
                });
            });
    },

    onDataFuns: [],

    on(event, fn) {
        if (event === 'data') {
            this.onDataFuns.push(fn);
            this.dataEmitter();
        }
    },
    off(event, fn) {
        if (event === 'data') {
            this.onDataFuns.splice(
                this.onDataFuns.findIndex(rfn => fn === rfn),
                1
            );
        }
    },
    dataEmitter() {
        this.onDataFuns.forEach(fn => {
            fn(this.data);
        });
    },
    updateData(data) {
        this.data = {
            ...this.data,
            ...data
        };

        this.dataEmitter();
    }
});
