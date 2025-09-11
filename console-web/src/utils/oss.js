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
    console.log('开始获取OSS签名，文件名:', filename);
    now = Date.now();
    saveName = filename;

    if (expire < now + 10000) {
        console.log('OSS签名已过期，重新获取...');
        return request.get('/upload/sign').then(res => {
            console.log('获取OSS签名成功，响应:', res);
            
            if (!res.data) {
                throw new Error('OSS签名响应数据为空');
            }
            
            policy = res.data['policy'];
            accessid = res.data['accessid'];
            signature = res.data['signature'];
            expire = parseInt(res.data['expire']);
            host = res.data['host'];

            if (!policy || !accessid || !signature || !host) {
                throw new Error('OSS签名数据不完整: ' + JSON.stringify(res.data));
            }

            console.log('OSS配置解析成功:', { 
                policy: policy ? 'OK' : 'MISSING', 
                accessid: accessid ? 'OK' : 'MISSING', 
                signature: signature ? 'OK' : 'MISSING', 
                host: host, 
                expire: new Date(expire).toLocaleString(),
                saveName 
            });
            
            const result = ossRes();
            console.log('返回OSS配置:', result);
            return result;
        }).catch(error => {
            console.error('获取OSS签名失败，详细错误:', error);
            if (error.response) {
                console.error('错误响应数据:', error.response.data);
                console.error('错误状态码:', error.response.status);
            }
            throw error;
        });
    } else {
        console.log('使用缓存的OSS签名');
        const result = ossRes();
        console.log('返回缓存的OSS配置:', result);
        return Promise.resolve(result);
    }
};
