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

import SMD5 from '../libs/md5';

export function ext(filename) {
    const pos = filename.lastIndexOf('.');
    let suffix = '';

    if (pos != -1) {
        suffix = filename.substring(pos);
    }
    
    // 如果没有扩展名，默认为jpg
    if (!suffix) {
        suffix = '.jpg';
    }
    
    console.log('文件扩展名解析:', filename, '->', suffix);
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
                    console.log('MD5计算错误:', error);
                    reject(error);
                }
            },
            fail: res => {
                console.log('读取文件失败:', res);
                reject(res);
            }
        });
    });
}
