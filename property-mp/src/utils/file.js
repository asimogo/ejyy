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

import SMD5 from '../libs/md5';

export function ext(filename) {
    const pos = filename.lastIndexOf('.');
    let suffix = '';

    if (pos != -1) {
        suffix = filename.substring(pos);
    }
    return suffix;
}

export function md5(filePath) {
    return new Promise((resolve, reject) => {
        wx.getFileSystemManager().readFile({
            filePath,
            success: res => {
                try {
                    const spark = new SMD5.ArrayBuffer();
                    spark.append(res.data);
                    const hexHash = spark.end(false);
                    resolve(hexHash);
                } catch (error) {
                    console.error('MD5计算失败:', error);
                    reject(error);
                }
            },
            fail: res => {
                console.error('读取文件失败:', res);
                reject(new Error('读取文件失败'));
            }
        });
    });
}
