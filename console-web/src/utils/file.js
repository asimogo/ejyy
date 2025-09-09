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

import SparkMD5 from 'spark-md5';

export function size(bytes, si = false, dp = 1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }

    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

    return bytes.toFixed(dp) + ' ' + units[u];
}

export function parse(file) {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();

        fr.onload = () => {
            try {
                const filename = file.name;
                const pos = filename.lastIndexOf('.');
                const ext = filename.substring(pos);

                resolve({
                    name: filename,
                    pos,
                    ext,
                    hash: SparkMD5.hash(fr.result)
                });
            } catch (error) {
                console.error('文件解析失败:', error);
                reject(new Error('文件解析失败'));
            }
        };

        fr.onerror = (error) => {
            console.error('文件读取失败:', error);
            reject(new Error('文件读取失败'));
        };

        fr.readAsBinaryString(file);
    });
}
