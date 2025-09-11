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

import $toast from '../../components/toast/toast';
import $dialog from '../../components/dialog/dialog';
import utils from '../../utils/index';
import * as config from '../../config';

// wx.redirectTo({ url: `/pages/error/general?msg=微信授权登录失败 ${res.errMsg}` });

Page({
    data: {
        message: '很抱歉，系统出现了点小问题'
    },
    onLoad(options) {
        if (options.msg) {
            this.setData({
                message: options.msg
            });
        }
    },
    onShow() {
        if (wx.canIUse('hideHomeButton')) {
            wx.hideHomeButton();
        }
    },
    checkError() {
        const toast = $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '正在检测……'
        });

        setTimeout(() => {
            let version, SDKVersion;
            try {
                const appBaseInfo = wx.getAppBaseInfo();
                version = appBaseInfo.version;
                SDKVersion = appBaseInfo.SDKVersion;
            } catch (e) {
                const info = wx.getSystemInfoSync();
                version = info.version;
                SDKVersion = info.SDKVersion;
            }

            toast.clear();

            if (
                utils.compare.version(config.WECHAT_VERSION, version) ||
                utils.compare.version(config.SDK_VERSION, SDKVersion)
            ) {
                $dialog
                    .confirm({
                        title: '请升级您的客户端',
                        message: '您的微信客户端版本过低，无法正常使用某些功能，请升级'
                    })
                    .then(() => {
                        if (wx.canIUse('updateWeChatApp')) {
                            wx.updateWeChatApp({
                                fail: () => {
                                    $dialog.alert({
                                        message: '客户端升级失败，请手动前往App Store或应用市场更新'
                                    });
                                }
                            });
                        } else {
                            $dialog.alert({
                                message: '请前往App Store或应用市场更新微信客户端'
                            });
                        }
                    })
                    .catch(() => {
                        $dialog.alert({
                            message: '为了能为您提供更好的体验，请及时升级微信客户端'
                        });
                    });
            } else {
                $dialog.alert({
                    message: '请重启微信客户端后尝试'
                });
            }
        }, 2000);
    }
});
