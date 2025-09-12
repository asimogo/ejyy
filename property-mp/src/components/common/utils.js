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

import { isDef, isNumber, isPlainObject, isPromise } from './validator';
import { canIUseGroupSetData, canIUseNextTick } from './version';
export function range(num, min, max) {
    return Math.min(Math.max(num, min), max);
}
export function nextTick(cb) {
    if (canIUseNextTick()) {
        wx.nextTick(cb);
    } else {
        setTimeout(() => {
            cb();
        }, 1000 / 30);
    }
}
let systemInfo;
export function getSystemInfoSync() {
    if (systemInfo != null) {
        return systemInfo;
    }
    let deviceInfo = {};
    let windowInfo = {};
    let appBaseInfo = {};

    try {
        if (typeof wx.getDeviceInfo === 'function') {
            deviceInfo = wx.getDeviceInfo();
        }
    } catch (e) {}

    try {
        if (typeof wx.getWindowInfo === 'function') {
            windowInfo = wx.getWindowInfo();
        }
    } catch (e) {}

    try {
        if (typeof wx.getAppBaseInfo === 'function') {
            appBaseInfo = wx.getAppBaseInfo();
        }
    } catch (e) {}

    systemInfo = {
        ...deviceInfo,
        ...windowInfo,
        ...appBaseInfo
    };

    // 回退以确保兼容性和字段完整
    if (systemInfo.statusBarHeight == null || systemInfo.windowWidth == null) {
        try {
            const legacy = wx.getSystemInfoSync();
            systemInfo = { ...legacy, ...systemInfo };
        } catch (e) {}
    }

    return systemInfo;
}
export function addUnit(value) {
    if (!isDef(value)) {
        return undefined;
    }
    value = String(value);
    return isNumber(value) ? `${value}px` : value;
}
export function requestAnimationFrame(cb) {
    const systemInfo = getSystemInfoSync();
    if (systemInfo.platform === 'devtools') {
        return setTimeout(() => {
            cb();
        }, 1000 / 30);
    }
    return wx
        .createSelectorQuery()
        .selectViewport()
        .boundingClientRect()
        .exec(() => {
            cb();
        });
}
export function pickExclude(obj, keys) {
    if (!isPlainObject(obj)) {
        return {};
    }
    return Object.keys(obj).reduce((prev, key) => {
        if (!keys.includes(key)) {
            prev[key] = obj[key];
        }
        return prev;
    }, {});
}
export function getRect(context, selector) {
    return new Promise(resolve => {
        wx.createSelectorQuery()
            .in(context)
            .select(selector)
            .boundingClientRect()
            .exec((rect = []) => resolve(rect[0]));
    });
}
export function getAllRect(context, selector) {
    return new Promise(resolve => {
        wx.createSelectorQuery()
            .in(context)
            .selectAll(selector)
            .boundingClientRect()
            .exec((rect = []) => resolve(rect[0]));
    });
}
export function groupSetData(context, cb) {
    if (canIUseGroupSetData()) {
        context.groupSetData(cb);
    } else {
        cb();
    }
}
export function toPromise(promiseLike) {
    if (isPromise(promiseLike)) {
        return promiseLike;
    }
    return Promise.resolve(promiseLike);
}
export function getCurrentPage() {
    const pages = getCurrentPages();
    return pages[pages.length - 1];
}
