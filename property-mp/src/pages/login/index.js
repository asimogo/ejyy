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

import { CwPage } from '../common/page';
import $notify from '../../components/notify/notify';
import utils from '../../utils/index';

CwPage({
    data: {
        loading: false,
        redirect: null,
        phone: ''
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
    onPhoneInput(e) {
        this.setData({ phone: e.detail });
    },
    submit() {
        const { loading, phone } = this.data;

        if (loading) return;

        if (!/^1\d{10}$/.test(phone)) {
            return $notify({
                customNavBar: true,
                type: 'danger',
                message: '请输入正确的手机号'
            });
        }

        this.setData({ loading: true });

        const { brand, model, system, platform } = this.data.systemInfo || {};

        utils
            .request({
                url: '/user/phone_login',
                method: 'post',
                data: {
                    phone,
                    brand,
                    model,
                    system,
                    platform
                }
            })
            .then(
                res => {
                    this.setData({ loading: false });

                    this.bridge.updateData({
                        userInfo: res.data.userInfo,
                        postInfo: res.data.postInfo,
                        globalFetching: false
                    });

                    utils.storage.login(res.data.token);
                    utils.storage.setUserId(res.data.userInfo.id);

                    wx.redirectTo({
                        url: this.data.redirect == null ? '/pages/home/index' : this.data.redirect
                    });
                },
                res => {
                    this.setData({ loading: false });
                    return $notify({
                        customNavBar: true,
                        type: 'danger',
                        message: res.message
                    });
                }
            );
    }
});
