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

import request from './request';

let accessid = '';
let signature = '';
let policy = '';
let dir = '';
let expire = 0;
let host = '';
let saveName = '';
let now = Date.now();

function setFileName(filename) {
    saveName = `${dir}${filename}`;
}

function ossHeaders() {
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
    console.log('OSS 获取签名开始，文件名:', filename);
    now = Date.now();

    if (expire < now + 3) {
        console.log('需要获取新的OSS签名');
        return request({
            url: '/upload/sign',
            method: 'get'
        }).then(res => {
            console.log('OSS签名请求成功:', res);
            policy = res.data.policy;
            accessid = res.data.accessid;
            signature = res.data.signature;
            expire = parseInt(res.data.expire, 10);
            host = res.data.host;
            dir = res.data.dir;

            setFileName(filename);
            const headers = ossHeaders();
            console.log('OSS上传头信息:', headers);
            return headers;
        }).catch(err => {
            console.error('获取OSS签名失败:', err);
            throw err;
        });
    } else {
        console.log('使用缓存的OSS签名');
        setFileName(filename);
        const headers = ossHeaders();
        console.log('OSS上传头信息(缓存):', headers);
        return Promise.resolve(headers);
    }
};
