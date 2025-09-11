/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022 https://www.chowa.cn All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: contact@chowa.cn
 * +----------------------------------------------------------------------
 */

import { CwPage } from '../common/page';
import utils from '../../utils/index';
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';
import { ASSETS_HOST } from '../../config';

let timer = null;

CwPage({
    data: {
        ASSETS_HOST,
        // form data start
        real_name: '',
        idcard: '',
        phone: '',
        nick_name: `业主_${parseInt(Math.random() * 1000, 10)}`,
        signature: '',
        avatar_url: '/avatar/default.png',
        // form data end
        submiting: false,
        // avatar choose sheet
        showAvatarSheet: false,
        avatarSheetIn: false,
        uploadingAvatar: false
    },
    validator: {
        formFields: ['real_name', 'idcard', 'phone', 'nick_name', 'signature', 'avatar_url'],
        formRule: {
            real_name: [
                { required: true, message: '请输入真实姓名' },
                { max: 8, message: '真实姓名不能超过8个字' }
            ],
            idcard: [
                { required: true, message: '请输入身份证号码' },
                { pattern: /^\d{17}(x|X|\d){1}$/, message: '请输入正确的身份证号码' }
            ],
            //phone: [{ required: true, message: '请授权获取您的手机号码' }],
            nick_name: [
                { required: true, message: '请输入昵称' },
                { max: 12, message: '昵称不能超过12个字' }
            ],
            signature: [
                { required: true, message: '请输入签名' },
                { max: 36, message: '昵称不能超过36个字' }
            ],
            avatar_url: [{ required: true, message: '请上传头像' }]
        }
    },
    onShow() {
        if (wx.canIUse('hideHomeButton')) {
            wx.hideHomeButton();
        }

        this.getLoginCode();
    },
    onHide() {
        this.clearGetLoginCode();
    },
    clearGetLoginCode() {
        clearTimeout(timer);
        timer = null;
    },
    getLoginCode() {
        wx.login({
            success: ({ code }) => {
                this.setData({ loginCode: code });

                if (!this.data.phone) {
                    timer = setTimeout(() => {
                        this.getLoginCode();
                    }, 4.5 * 60 * 10000);
                } else {
                    this.clearGetLoginCode();
                }
            }
        });
    },
    onGlobalDataUpdate() {
        this.setData({
            nick_name: this.data.nick_name ? this.data.nick_name : this.data.userInfo.nick_name,
            signature: this.data.signature ? this.data.signature : this.data.userInfo.signature,
            phone: this.data.userInfo.phone
        });
    },
    getPhoneNumber(e) {
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
                },
                () => {
                    $toast.clear();
                }
            );
    },
    selectImage() {
        if (this.data.uploadingAvatar) return;
        this.setData({ showAvatarSheet: true }, () => setTimeout(() => this.setData({ avatarSheetIn: true }), 0));
    },
    closeAvatarSheet() {
        if (this.data.uploadingAvatar) return;
        this.setData({ avatarSheetIn: false });
        setTimeout(() => this.setData({ showAvatarSheet: false }), 220);
    },
    // 选择：用微信头像（chooseAvatar）
    onChooseAvatar(e) {
        if (this.data.uploadingAvatar) return;
        const { avatarUrl } = e.detail || {};
        if (!avatarUrl) return;

        const isLocalPath = p => typeof p === 'string' && (p.startsWith('wxfile://') || p.startsWith('http://tmp/') || p.startsWith('https://tmp/'));
        $toast.loading({ duration: 0, forbidClick: true, message: '设置中…' });

        const computeFileHash = (filePath) => new Promise((resolve) => {
            if (wx.getFileInfo) {
                wx.getFileInfo({
                    filePath,
                    digestAlgorithm: 'md5',
                    success: res => resolve(res.digest),
                    fail: () => {
                        utils.file.md5(filePath).then(resolve).catch(() => resolve(String(Date.now())));
                    }
                });
            } else {
                utils.file.md5(filePath).then(resolve).catch(() => resolve(String(Date.now())));
            }
        });

        const proceedWithFile = (filePath) => {
            this.setData({ uploadingAvatar: true });
            computeFileHash(filePath)
                .then(hash => utils.oss(`avatar/${hash}${utils.file.ext(filePath)}`))
                .then(sign => new Promise((resolve, reject) => {
                    wx.uploadFile({
                        url: sign.host,
                        filePath,
                        name: 'file',
                        formData: sign,
                        success: () => resolve(sign.key),
                        fail: reject
                    });
                }))
                .then(key => {
                    const avatarPath = key.startsWith('/') ? key : `/${key}`;
                    this.setData({ avatar_url: avatarPath, uploadingAvatar: false }, () => {
                        $toast.clear();
                        this.closeAvatarSheet();
                    });
                })
                .catch(err => {
                    console.error('设置微信头像失败:', err);
                    $toast.clear();
                    $toast({ message: '头像设置失败，请重试' });
                    this.setData({ uploadingAvatar: false });
                });
        };

        if (isLocalPath(avatarUrl)) {
            return proceedWithFile(avatarUrl);
        }

        wx.getImageInfo({
            src: avatarUrl,
            success: info => proceedWithFile(info.path),
            fail: () => {
                wx.downloadFile({
                    url: avatarUrl,
                    success: res => proceedWithFile(res.tempFilePath),
                    fail: () => {
                        $toast.clear();
                        $toast({ message: '下载微信头像失败' });
                    }
                });
            }
        });
    },
    // 选择：从相册选择
    chooseFromAlbum() {
        if (this.data.uploadingAvatar) return;
        const handlePath = (p) => this._uploadAvatarFromFile(p);
        if (wx.chooseMedia) {
            wx.chooseMedia({ count: 1, mediaType: ['image'], sizeType: ['compressed'], sourceType: ['album'],
                success: res => handlePath(res.tempFiles[0].tempFilePath)
            });
        } else {
            wx.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['album'],
                success: res => handlePath(res.tempFilePaths[0])
            });
        }
    },
    // 选择：拍照
    takePhoto() {
        if (this.data.uploadingAvatar) return;
        const handlePath = (p) => this._uploadAvatarFromFile(p);
        if (wx.chooseMedia) {
            wx.chooseMedia({ count: 1, mediaType: ['image'], sizeType: ['compressed'], sourceType: ['camera'],
                success: res => handlePath(res.tempFiles[0].tempFilePath)
            });
        } else {
            wx.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['camera'],
                success: res => handlePath(res.tempFilePaths[0])
            });
        }
    },
    // 通用上传流程
    _uploadAvatarFromFile(filePath) {
        $toast.loading({ duration: 0, forbidClick: true, message: '上传中…' });
        this.setData({ uploadingAvatar: true });

        const computeFileHash = (filePath) => new Promise((resolve) => {
            if (wx.getFileInfo) {
                wx.getFileInfo({
                    filePath,
                    digestAlgorithm: 'md5',
                    success: res => resolve(res.digest),
                    fail: () => {
                        utils.file.md5(filePath).then(resolve).catch(() => resolve(String(Date.now())));
                    }
                });
            } else {
                utils.file.md5(filePath).then(resolve).catch(() => resolve(String(Date.now())));
            }
        });

        computeFileHash(filePath)
            .then(hash => utils.oss(`avatar/${hash}${utils.file.ext(filePath)}`))
            .then(sign => new Promise((resolve, reject) => {
                wx.uploadFile({
                    url: sign.host,
                    filePath,
                    name: 'file',
                    formData: sign,
                    success: () => resolve(sign.key),
                    fail: reject
                });
            }))
            .then(key => {
                const avatarPath = key.startsWith('/') ? key : `/${key}`;
                this.setData({ avatar_url: avatarPath, uploadingAvatar: false }, () => {
                    $toast.clear();
                    this.closeAvatarSheet();
                });
            })
            .catch(err => {
                console.error('上传头像失败:', err);
                $toast.clear();
                $toast({ message: '上传失败，请稍后重试' });
                this.setData({ uploadingAvatar: false });
            });
    },
    useWechatInfo() {
        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '获取中…'
        });

        wx.getUserProfile({
            desc: '用于完善用户信息',
            success: res => {
                this.setData({
                    nick_name: res.userInfo.nickName
                });

                wx.downloadFile({
                    url: res.userInfo.avatarUrl,
                    success: res => {
                        utils.file.md5(res.tempFilePath).then(hash => {
                            const fileName = `avatar/${hash}${utils.file.ext(res.tempFilePath)}`;

                            utils.oss(fileName).then(sign => {
                                wx.uploadFile({
                                    url: sign.host,
                                    filePath: res.tempFilePath,
                                    name: 'file',
                                    formData: sign,
                                    success: () => {
                                        this.setData({
                                            avatar_url: `/${sign.key}`
                                        });
                                        $toast.clear();
                                    },
                                    fail: res => {
                                        $toast.clear();
                                        $notify({
                                            type: 'danger',
                                            message: '获取微信头像失败'
                                        });
                                    }
                                });
                            });
                        });
                    },
                    fail: () => {
                        $notify({
                            type: 'danger',
                            message: '获取微信头像失败'
                        });
                        $toast.clear();
                    }
                });
            },
            fail: () => {
                $toast.clear();
            }
        });
    },
    save() {
        this.validate(() => {
            $toast.loading({
                duration: 0,
                forbidClick: true,
                message: '提交中…'
            });

            this.setData({
                submiting: true
            });

            const { nick_name, signature, real_name, idcard, avatar_url, userInfo } = this.data;

            utils
                .request({
                    url: '/user/supplement',
                    method: 'post',
                    data: {
                        nick_name,
                        signature,
                        real_name,
                        idcard,
                        avatar_url
                    }
                })
                .then(
                    res => {
                        this.bridge.updateData({
                            userInfo: {
                                ...userInfo,
                                nick_name,
                                signature,
                                avatar_url,
                                intact: true,
                                gender: res.data.gender
                            }
                        });

                        this.setData({
                            submiting: false
                        });

                        $toast.clear();

                        wx.redirectTo({
                            url: '/pages/community/binding'
                        });
                    },
                    res => {
                        this.setData({
                            submiting: false
                        });
                        $notify({
                            type: 'danger',
                            message: res.message
                        });
                        $toast.clear();
                    }
                );
        });
    }
});
