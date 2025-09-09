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

import * as utils from './';

export function parse(file) {
    return new Promise((resolve, reject) => {
        utils.file.parse(file).then(params => {
            const fr = new FileReader();

            fr.onload = () => {
                const src = fr.result;
                const img = new Image();

                img.onload = () => {
                    resolve({
                        width: img.width,
                        height: img.height,
                        base64: src,
                        instance: img,
                        ...params
                    });
                };

                img.onerror = () => {
                    console.error('图像加载失败');
                    reject(new Error('图像加载失败'));
                };

                img.src = src;
            };

            fr.onerror = (error) => {
                console.error('文件读取失败:', error);
                reject(new Error('文件读取失败'));
            };

            fr.readAsDataURL(file);
        }).catch(error => {
            console.error('文件解析失败:', error);
            reject(error);
        });
    });
}
