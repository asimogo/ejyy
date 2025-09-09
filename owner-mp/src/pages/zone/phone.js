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
import $toast from '../../components/toast/toast';
import utils from '../../utils/index';

let timer = null;

CwPage({
    data: {
        loginCode: null
    },
    onShow() {
        if (!this.data.userInfo.phone && !timer) {
            this.getLoginCode();
        }
    },
    onHide() {
        this.clearGetLoginCode();
    },
    getLoginCode() {
        wx.login({
            success: ({ code }) => {
                this.setData({ loginCode: code });

                if (!this.data.userInfo.phone) {
                    timer = setTimeout(() => {
                        this.getLoginCode();
                    }, 4.5 * 60 * 10000);
                } else {
                    this.clearGetLoginCode();
                }
            }
        });
    },
    clearGetLoginCode() {
        clearTimeout(timer);
        timer = null;
    },
    bindPhone(e) {
        console.log('bindPhone event detail:', e.detail);
        
        if (!e.detail.iv || !e.detail.encryptedData) {
            return $notify({
                type: 'danger',
                message: '请同意获取你的手机号码'
            });
        }

        // 检查是否在开发者工具中
        const systemInfo = wx.getSystemInfoSync();
        if (systemInfo.platform === 'devtools') {
            console.warn('在开发者工具中，获取手机号功能可能无法正常工作');
            $notify({
                type: 'warning',
                message: '开发者工具中无法获取真实手机号，请在真机中测试'
            });
            return;
        }

        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '手机绑定中…'
        });

        utils
            .request({
                url: '/user/bind_phone',
                method: 'post',
                data: {
                    code: this.data.loginCode,
                    encryptedData: e.detail.encryptedData,
                    iv: e.detail.iv
                }
            })
            .then(
                res => {
                    $toast.clear();

                    this.bridge.updateData({
                        userInfo: {
                            ...this.data.userInfo,
                            phone: res.data.phone
                        }
                    });

                    $toast.success({
                        message: '手机绑定成功'
                    });
                },
                () => {
                    $toast.clear();
                }
            );
    }
});
