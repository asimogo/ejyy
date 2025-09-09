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

import utils from './index';

/**
 * 上传文件到OSS
 * @param {string} filePath 文件路径
 * @param {string} directory 目录名(如: avatar, pet等)
 * @returns {Promise}
 */
export function uploadFileToOSS(filePath, directory = 'temp') {
    return utils.file.md5(filePath).then(hash => {
        const fileName = `${directory}/${hash}${utils.file.ext(filePath)}`;

        return utils.oss(fileName).then(sign => {
            return new Promise((resolve, reject) => {
                wx.uploadFile({
                    url: sign.host,
                    filePath: filePath,
                    name: 'file',
                    formData: sign,
                    success: (res) => {
                        if (res.statusCode === 200) {
                            resolve({
                                success: true,
                                url: `/${sign.key}`,
                                key: sign.key,
                                response: res
                            });
                        } else {
                            reject(new Error(`上传失败，状态码: ${res.statusCode}`));
                        }
                    },
                    fail: (err) => {
                        reject(err);
                    }
                });
            });
        });
    });
}

export default {
    uploadFileToOSS
};