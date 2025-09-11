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

import config from '~/config';
import cwlog from 'chowa-log';
import { MapProvider, Location, SearchParams, SearchResult } from './map/types';
import tencentProvider from './map/provider/tencent';
import googleProvider from './map/provider/google';

// 统一距离计算，提供给各业务模块使用
export function distance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const radLat1 = (lat1 * Math.PI) / 180.0;
    const radLat2 = (lat2 * Math.PI) / 180.0;
    const a = radLat1 - radLat2;
    const b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0;
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137;
    return Math.abs(Math.round(s * 10000) / 10);
}

// 根据环境变量或配置选择地图服务提供方
const providerName = String(process.env.MAP_PROVIDER || config.map.provider || 'tencent').toLowerCase();
const provider: MapProvider = providerName === 'google' ? googleProvider : tencentProvider;

if (config.debug) {
    cwlog.info(`[map] provider selected: ${providerName}`);
}

export async function getLocation(ip: string): Promise<Location> {
    return provider.getLocation(ip);
}

export async function search(params: SearchParams): Promise<SearchResult> {
    return provider.search(params);
}

// 将业务上的中文类目在 Google 提供商下映射为更易命中的英文关键词
const GOOGLE_KEYWORD_MAP: Record<string, string> = {
    '家政': 'housekeeping cleaning handyman',
    '保洁钟点工': 'cleaning service',
    '开锁': 'locksmith',
    '送水': 'water delivery',
    '家电维修': 'appliance repair',
    '管道疏通打孔': 'plumber plumbing',
    '搬家': 'moving company',
    '月嫂保姆': 'nanny babysitter',
    '其它家政': 'handyman'
};

export function keywordForSearch(rawCategory: string): string {
    if (!rawCategory) return rawCategory;
    if (providerName === 'google') {
        return GOOGLE_KEYWORD_MAP[rawCategory] || rawCategory;
    }
    return rawCategory;
}

export function getProviderName(): 'tencent' | 'google' {
    return (providerName === 'google' ? 'google' : 'tencent') as 'tencent' | 'google';
}
