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

interface OssSign {
    policy: string;
    signature: string;
    accessid: string;
    expire: number;
    host: string;
    dir: string;
}

export function sign(): OssSign {
    const { accessKeyId, accessKeySecret, oss } = config.aliyun;
    const { bucket, host, region } = oss;
    const expire = Date.now() + 60 * 30 * 1000;
    const dir = '';
    const policyString = JSON.stringify({
        expiration: new Date(expire).toISOString(),
        conditions: [
            { bucket },
            ['content-length-range', 0, 1048576000 * 2], 
            ['starts-with', '$key', dir],
            ['eq', '$success_action_status', '200']
        ]
    });
    
    console.log('生成的policy内容:', policyString);
    console.log('配置文件中的 accessKeyId:', accessKeyId);
    console.log('配置文件中的 accessKeySecret:', accessKeySecret ? `${accessKeySecret.substring(0, 8)}...` : 'undefined');
    const policy = Buffer.from(policyString).toString('base64');
    const signature = crypto
        .createHmac('sha1', accessKeySecret)
        .update(policy)
        .digest('base64');

    // 使用配置的host，如果没有则根据region构造
    let ossHost = host;
    if (!ossHost) {
        if (region.includes('aliyuncs.com')) {
            // region已经是完整的endpoint
            ossHost = region.startsWith('http') ? region : `https://${bucket}.${region}`;
        } else {
            // region是简短格式如 oss-ap-southeast-1
            ossHost = `https://${bucket}.${region}.aliyuncs.com`;
        }
    }
    
    // 确保host以https://开头
    if (ossHost && !ossHost.startsWith('http')) {
        ossHost = `https://${ossHost}`;
    }
    
    console.log('OSS配置信息:', { 
        bucket, 
        region, 
        originalHost: host,
        constructedHost: ossHost,
        accessKeyId: accessKeyId ? `${accessKeyId.substring(0, 8)}...` : 'undefined'
    });
    
    return {
        policy,
        signature,
        accessid: accessKeyId,
        expire,
        host: ossHost,
        dir
    };
}
