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

import crypto from 'crypto';
import config from '~/config';

export function md5(str: string, upperCase = false): string {
    const hash = crypto.createHash('md5');

    hash.update(str, 'utf8');

    const ret = hash.digest('hex');

    return upperCase ? ret.toUpperCase() : ret;
}

export function encrypt(str: string): string {
    const cipher = crypto.createCipheriv('aes-256-cbc', config.crypto.key, config.crypto.iv);
    let crypted = cipher.update(str, 'utf8', 'hex');

    crypted += cipher.final('hex');

    return crypted;
}

export function decrypt(str: string): string {
    let result = null;

    try {
        const cipher = crypto.createDecipheriv('aes-256-cbc', config.crypto.key, config.crypto.iv);
        const decrypted = cipher.update(str, 'hex', 'utf8');
        result = decrypted + cipher.final('utf8');
    } catch (e) {
        return result;
    }

    return result;
}
