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
import utils from '../../utils/index';
import $toast from '../../components/toast/toast';
import { ASSETS_HOST } from '../../config';

CwPage({
    data: {
        ASSETS_HOST,
        // form data start
        nick_name: '',
        signature: '',
        avatar_url: '',
        // form data end
        avatarDisplayUrl: '',
        submiting: false,
        // avatar choose sheet
        showAvatarSheet: false,
        avatarSheetIn: false,
        uploadingAvatar: false
    },
    validator: {
        formFields: ['nick_name', 'signature', 'avatar_url'],
        formRule: {
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
    selectImage() {
        if (this.data.uploadingAvatar) return;
        this.setData({ showAvatarSheet: true }, () => {
            // 下一帧触发进入动画
            setTimeout(() => this.setData({ avatarSheetIn: true }), 0);
        });
    },
    closeAvatarSheet() {
        if (this.data.uploadingAvatar) return;
        this.setData({ avatarSheetIn: false });
        // 等待过渡结束后卸载
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
            // 优先使用系统API获取MD5，兼容 http(s)://tmp/ 与 wxfile://
            if (wx.getFileInfo) {
                wx.getFileInfo({
                    filePath,
                    digestAlgorithm: 'md5',
                    success: res => resolve(res.digest),
                    fail: () => {
                        // 回退到读取文件计算
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
                        success: res => resolve(sign.key),
                        fail: err => reject(err)
                    });
                }))
                .then(key => {
                    const avatarPath = key.startsWith('/') ? key : `/${key}`;
                    this.setData({ avatar_url: avatarPath, uploadingAvatar: false }, () => {
                        this.updateAvatarDisplayUrl();
                        if (typeof this.onChange === 'function') this.onChange();
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
        const useChooseMedia = !!wx.chooseMedia;
        const handlePath = (path) => this._uploadAvatarFromFile(path);

        if (useChooseMedia) {
            wx.chooseMedia({ count: 1, mediaType: ['image'], sizeType: ['compressed'], sourceType: ['album'],
                success: res => handlePath(res.tempFiles[0].tempFilePath),
                fail: () => {}
            });
        } else {
            wx.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['album'],
                success: res => handlePath(res.tempFilePaths[0]),
                fail: () => {}
            });
        }
    },
    // 选择：拍照
    takePhoto() {
        if (this.data.uploadingAvatar) return;
        const useChooseMedia = !!wx.chooseMedia;
        const handlePath = (path) => this._uploadAvatarFromFile(path);

        if (useChooseMedia) {
            wx.chooseMedia({ count: 1, mediaType: ['image'], sizeType: ['compressed'], sourceType: ['camera'],
                success: res => handlePath(res.tempFiles[0].tempFilePath),
                fail: () => {}
            });
        } else {
            wx.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['camera'],
                success: res => handlePath(res.tempFilePaths[0]),
                fail: () => {}
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
                    this.updateAvatarDisplayUrl();
                    if (typeof this.onChange === 'function') this.onChange();
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
    
    // 更新头像显示URL
    updateAvatarDisplayUrl() {
        const { avatar_url } = this.data;
        let avatarDisplayUrl = '';
        
        if (avatar_url) {
            if (avatar_url.startsWith('http://') || avatar_url.startsWith('https://')) {
                // 微信头像或其他完整URL
                avatarDisplayUrl = avatar_url;
            } else {
                // OSS相对路径
                avatarDisplayUrl = ASSETS_HOST + avatar_url;
            }
        }
        
        console.log('更新头像显示URL:', {
            原始avatar_url: avatar_url,
            计算后avatarDisplayUrl: avatarDisplayUrl
        });
        
        this.setData({
            avatarDisplayUrl: avatarDisplayUrl
        });
    },
    onChange() {
        const { nick_name, signature, userInfo, avatar_url } = this.data;

        // 更新头像显示URL
        this.updateAvatarDisplayUrl();

        if (
            nick_name.length === 0 ||
            signature.length === 0 ||
            !avatar_url ||
            (nick_name === userInfo.nick_name && signature === userInfo.signature && avatar_url === userInfo.avatar_url)
        ) {
            this.setData({
                disabled: true
            });
        } else {
            this.setData({
                disabled: false
            });
        }
    },
    onGlobalDataUpdate() {
        // 只在本地值未初始化时使用全局userInfo填充，避免返回本页时覆盖用户刚刚选择的头像
        const { userInfo, nick_name, signature, avatar_url } = this.data;
        const nextData = {};

        if (!nick_name) nextData.nick_name = userInfo.nick_name;
        if (!signature) nextData.signature = userInfo.signature;
        if (!avatar_url) nextData.avatar_url = userInfo.avatar_url;

        if (Object.keys(nextData).length) {
            this.setData(nextData, () => {
                // 更新头像显示URL
                this.updateAvatarDisplayUrl();
            });
        } else {
            // 更新头像显示URL
            this.updateAvatarDisplayUrl();
        }
    },
    save() {
        this.validate(() => {
            const { nick_name, signature, userInfo, avatar_url } = this.data;
            if (
                nick_name === userInfo.nick_name &&
                signature === userInfo.signature &&
                avatar_url === userInfo.avatar_url
            ) {
                return;
            }

            $toast.loading({
                duration: 0,
                forbidClick: true,
                message: '保存中…'
            });

            this.setData({
                submiting: true
            });

            utils
                .request({
                    url: '/user/profile',
                    method: 'post',
                    data: {
                        nick_name,
                        signature,
                        avatar_url
                    }
                })
                .then(res => {
                    console.log('个人资料更新成功:', res);
                    this.bridge.updateData({
                        userInfo: {
                            ...userInfo,
                            nick_name,
                            signature,
                            avatar_url
                        }
                    });

                    this.setData({
                        submiting: false
                    });

                    $toast.clear();

                    $toast.success({
                        forbidClick: true,
                        message: '修改成功'
                    });

                    this.onChange();
                })
                .catch(err => {
                    console.log('个人资料更新失败:', err);
                    this.setData({
                        submiting: false
                    });

                    $toast.clear();

                    $toast.fail({
                        forbidClick: true,
                        message: err.message || '修改失败，请重试'
                    });
                });
        });
    }
});
