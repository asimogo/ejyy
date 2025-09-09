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

import redis from 'redis';
import wss, { PcData } from '~/wss';
import config from '~/config';

let pub = null;
let sub = null;

if (!config.debug) {
    try {
        pub = redis.createClient(config.redis);
        sub = redis.createClient(config.redis);

        // 处理连接错误
        pub.on('error', (err: Error) => {
            console.error('Redis Pub Client Error:', err.message);
        });

        sub.on('error', (err: Error) => {
            console.error('Redis Sub Client Error:', err.message);
        });

        // 确保连接成功
        pub.on('connect', () => {
            console.log('Redis Pub Client Connected');
        });

        sub.on('connect', () => {
            console.log('Redis Sub Client Connected');
        });
    } catch (error) {
        console.error('Redis Client Creation Failed:', error);
        pub = null;
        sub = null;
    }
}

export const WS_NOTICE_TO_PROPERTY_COMPANY = 'WS_NOTICE_TO_PROPERTY_COMPANY';
export const WS_NOTICE_TO_REMOTE_SERVER = 'WS_NOTICE_TO_REMOTE_SERVER';

// todo
interface RsData {
    remote_id: number;
    door_id: number;
}

function sendToRs(data: RsData) {
    console.log(data);
}

function dispatch(channel: string, data: Object) {
    switch (channel) {
        case WS_NOTICE_TO_PROPERTY_COMPANY:
            return wss.sendToPc(data as PcData);

        case WS_NOTICE_TO_REMOTE_SERVER:
            return sendToRs(data as RsData);
    }
}

export function pubish(channel: string, data: Object) {
    if (!config.debug && pub) {
        try {
            pub.publish(channel, JSON.stringify(data));
        } catch (error) {
            console.error('Redis Publish Error:', error);
            dispatch(channel, data);
        }
    } else {
        dispatch(channel, data);
    }
}

export async function subscribe() {
    if (!config.debug && sub) {
        try {
            sub.subscribe(WS_NOTICE_TO_PROPERTY_COMPANY);
            sub.subscribe(WS_NOTICE_TO_REMOTE_SERVER);

            sub.on('message', (channel: string, message: string) => {
                const data = <PcData | RsData>JSON.parse(message);

                dispatch(channel, data);
            });
        } catch (error) {
            console.error('Redis Subscribe Error:', error);
        }
    }
}
