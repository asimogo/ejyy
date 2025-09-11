/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2024 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { CwPage } from '../common/page';
import $notify from '../../components/notify/notify';
import utils from '../../utils/index';

CwPage({
    data: {
        loading: false,
        agree: true,
        redirect: null
    },
    onLoad(opts) {
        this.setData({
            redirect: opts.redirect ? decodeURIComponent(opts.redirect) : null
        });
    },
    onShow() {
        if (wx.canIUse('hideHomeButton')) {
            wx.hideHomeButton();
        }
    },
    onAgreeChange(e) {
        if (this.data.loading) {
            return;
        }

        this.setData({
            agree: e.detail
        });
    },
    login() {
        const { agree, loading } = this.data;

        if (loading) {
            return;
        }

        if (!agree) {
            return $notify({
                customNavBar: true,
                type: 'danger',
                message: '请阅读并同意用户协议'
            });
        }

        this.setData({
            loading: true
        });

        wx.login({
            success: ({ code }) => {
                console.log('wx.login成功获取code:', code);
                const { brand, model, system, platform } = this.data.systemInfo;
                
                console.log('系统信息:', { brand, model, system, platform });

                utils
                    .request({
                        url: '/user/login',
                        method: 'post',
                        data: {
                            code,
                            brand,
                            model,
                            system,
                            platform
                        }
                    })
                    .then(
                        res => {
                            console.log('登录成功响应:', res);
                            this.setData({
                                loading: false
                            });

                            console.log('bridge对象:', this.bridge);
                            if (this.bridge && this.bridge.updateData) {
                                this.bridge.updateData({
                                    userInfo: res.data.userInfo,
                                    communityInfo: res.data.communityInfo,
                                    globalFetching: false
                                });
                                console.log('bridge数据更新完成');
                            } else {
                                console.error('bridge对象不存在或updateData方法不存在');
                            }

                            utils.storage.login(res.data.token);
                            utils.storage.setUserId(res.data.userInfo.id);
                            
                            console.log('登录状态保存:', {
                                token: utils.storage.token(),
                                userId: utils.storage.userId(),
                                isLogin: utils.storage.isLogin()
                            });

                            if (!res.data.userInfo.intact) {
                                console.log('用户信息不完整，跳转补充页面');
                                wx.redirectTo({
                                    url: '/pages/zone/supplement'
                                });
                            } else if (res.data.communityInfo.list.length === 0) {
                                console.log('未绑定社区，跳转绑定页面');
                                wx.redirectTo({
                                    url: '/pages/community/binding'
                                });
                            } else if (this.data.redirect !== null) {
                                console.log('有重定向地址:', this.data.redirect);
                                const tbasRoute = ['/pages/home/index', '/pages/service/index', '/pages/zone/index'];

                                if (tbasRoute.includes(this.data.redirect)) {
                                    wx.switchTab({
                                        url: this.data.redirect
                                    });
                                } else {
                                    wx.redirectTo({
                                        url: this.data.redirect
                                    });
                                }
                            } else {
                                console.log('登录成功，跳转首页');
                                wx.switchTab({
                                    url: '/pages/home/index'
                                });
                            }
                        },
                        res => {
                            console.log('登录失败:', res);
                            this.setData({
                                loading: false
                            });
                            return $notify({
                                customNavBar: true,
                                type: 'danger',
                                message: res.message
                            });
                        }
                    );
            },
            fail: (error) => {
                console.log('wx.login失败:', error);
                this.setData({
                    loading: false
                });
                return $notify({
                    customNavBar: true,
                    type: 'danger',
                    message: '登录失败，请重试'
                });
            }
        });
    }
});
