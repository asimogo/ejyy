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

import request from './request';

let accessid = '';
let signature = '';
let policy = '';
let expire = 0;
let host = '';
let saveName = '';
let now = Date.now();

function ossRes() {
    return {
        host,
        key: saveName,
        policy,
        OSSAccessKeyId: accessid,
        success_action_status: '200',
        signature
    };
}

export default filename => {
    now = Date.now();
    saveName = filename;

    if (expire < now + 10000) {
        return request.get('/upload/sign').then(res => {
            console.log('获取OSS签名响应:', res);
            policy = res.data['policy'];
            accessid = res.data['accessid'];
            signature = res.data['signature'];
            expire = parseInt(res.data['expire']);
            host = res.data['host'];

            console.log('OSS配置:', { policy, accessid, signature, expire, host, saveName });
            return ossRes();
        }).catch(error => {
            console.error('获取OSS签名失败:', error);
            throw error;
        });
    } else {
        return Promise.resolve(ossRes());
    }
};
