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
import utils from '../../utils/index';
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';

CwPage({
    onLoad() {
        this.cropper = this.selectComponent('#cw-image-cropper');

        this.cropper.upload();
    },
    cropperload() {},
    loadimage(e) {
        this.cropper.imgReset();
    },
    clickcut(e) {
        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '保存中…'
        });

        utils.file.md5(e.detail.url).then(hash => {
            const fileName = `pet/${hash}${utils.file.ext(e.detail.url)}`;

            return utils.oss(fileName).then(sign => {
                return new Promise((resolve, reject) => {
                    wx.uploadFile({
                        url: sign.host,
                        filePath: e.detail.url,
                        name: 'file',
                        formData: sign,
                        success: (res) => {
                            if (res.statusCode === 200) {
                                const pages = getCurrentPages();
                                //获取所需页面
                                const prePage = pages[pages.length - 2];
                                prePage.setData({
                                    photo: `/${sign.key}`
                                });

                                $toast.clear();
                                wx.navigateBack({ delta: 1 });
                                resolve(res);
                            } else {
                                reject(new Error('上传失败'));
                            }
                        },
                        fail: (err) => {
                            reject(err);
                        }
                    });
                });
            });
        }).catch(error => {
            console.error('处理失败:', error);
            $toast.clear();
            $notify({
                type: 'danger',
                message: '保存照片失败'
            });
        });
    }
});
