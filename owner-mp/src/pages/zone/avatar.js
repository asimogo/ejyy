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
import $notify from '../../components/notify/notify';
// 无需引入 ASSETS_HOST，上传后仅回传相对路径

CwPage({
    data: {
        uploading: false,
        defaultAvatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
    },
    onLoad() {},
    
    // 处理微信头像选择结果：支持本地临时路径与远程URL
    onChooseAvatar(e) {
        const { avatarUrl } = e.detail;

        if (!avatarUrl || avatarUrl === this.data.defaultAvatarUrl) {
            return $notify({ type: 'danger', message: '请选择有效的微信头像' });
        }

        const isLocalPath = (p) =>
            typeof p === 'string' && (
                p.startsWith('wxfile://') ||
                p.startsWith('http://tmp/') ||
                p.startsWith('https://tmp/')
            );

        const proceedWithFile = (filePath) => {
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

            computeFileHash(filePath).then(hash => {
                const fileName = `avatar/${hash}${utils.file.ext(filePath)}`;
                utils.oss(fileName).then(sign => {
                    wx.uploadFile({
                        url: sign.host,
                        filePath: filePath,
                        name: 'file',
                        formData: sign,
                        success: () => {
                            this.handleUploadSuccess(sign.key);
                        },
                        fail: err => {
                            console.error('微信头像上传失败:', err);
                            $toast.clear();
                            $notify({ type: 'danger', message: '上传头像失败，请重试' });
                        }
                    });
                }).catch(err => {
                    console.error('获取OSS签名失败:', err);
                    $toast.clear();
                    $notify({ type: 'danger', message: '上传签名获取失败' });
                });
            }).catch(err => {
                console.error('计算文件MD5失败:', err);
                $toast.clear();
                $notify({ type: 'danger', message: '头像处理失败，请重试' });
            });
        };

        $toast.loading({ duration: 0, forbidClick: true, message: '保存中…' });

        // 优先直接使用本地临时文件路径
        if (isLocalPath(avatarUrl)) {
            return proceedWithFile(avatarUrl);
        }

        // 若为远程URL，尝试用 getImageInfo 获取本地路径，失败再回退 downloadFile
        wx.getImageInfo({
            src: avatarUrl,
            success: info => {
                proceedWithFile(info.path);
            },
            fail: err1 => {
                wx.downloadFile({
                    url: avatarUrl,
                    success: res => {
                        proceedWithFile(res.tempFilePath);
                    },
                    fail: err2 => {
                        console.error('下载微信头像失败:', err2);
                        $toast.clear();
                        $notify({ type: 'danger', message: '下载微信头像失败' });
                    }
                });
            }
        });
    },
    
    
    
    handleUploadSuccess(avatarKey) {
        const pages = getCurrentPages();
        const prePage = pages[pages.length - 2];
        
        // 保持与全站一致：avatar_url 以/开头，便于与ASSETS_HOST拼接
        const avatarUrl = avatarKey.startsWith('/') ? avatarKey : `/${avatarKey}`;
        
        prePage.setData({
            avatar_url: avatarUrl
        });
        
        // 触发onChange更新按钮状态
        if (prePage.onChange) {
            prePage.onChange();
        }

        $toast.clear();
        this.setData({
            uploading: false
        });

        wx.navigateBack({ delta: 1 });
    },
    
    handleUploadError(message) {
        console.error('上传错误:', message);
        $toast.clear();
        this.setData({ uploading: false });
        
        $notify({
            type: 'danger',
            message: message
        });
    },
    
    
});
