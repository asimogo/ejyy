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

import { CwPage } from '../common/page';
import utils from '../../utils/index';
import $toast from '../../components/toast/toast';
import $notify from '../../components/notify/notify';
import { ASSETS_HOST } from '../../config';
import * as common from '../common/common';

CwPage({
    data: {
        ASSETS_HOST,
        // form data start
        repairType: null,
        repairLocal: null,
        description: '',
        imgList: [],
        // form data end
        uploadImgList: [],
        submiting: false,
        repairTypeActionVisible: false,
        repairTypeName: '',
        repairTypeActions: [
            { name: '水暖', id: 1 },
            { name: '电路', id: 2 },
            { name: '门窗', id: 3 },
            { name: '公共设施', id: 4 }
        ],
        repairLocalActionVisible: false,
        repairLocalName: '',
        repairLocalActions: []
    },
    validator: {
        formFields: ['repairType', 'repairLocal', 'description'],
        formRule: {
            repairLocal: [{ required: true, message: '请选择维修位置' }],
            repairType: [{ required: true, message: '请选择维修类型' }],
            description: [
                { required: true, message: '请输入问题描述' },
                { min: 5, message: '问题描述应大于5个字' },
                { max: 200, message: '问题描述不能超过200个字' }
            ]
        }
    },
    onShow() {
        this.updateRepairLocalActions();
    },
    onGlobalDataUpdate() {
        this.updateRepairLocalActions();
    },
    updateRepairLocalActions() {
        const repairLocalActions = [];
        const { communityInfo } = this.data;

        if (!communityInfo.current) {
            return;
        }

        []
            .concat(communityInfo.current.houses, communityInfo.current.carports, communityInfo.current.warehouses)
            .forEach(item => {
                repairLocalActions.push({
                    id: item.building_id,
                    name: common.building(item)
                });
            });

        repairLocalActions.push({
            id: 0,
            name: '公共区域'
        });

        this.setData({ repairLocalActions });
    },
    showRepairTypeAction() {
        this.setData({ repairTypeActionVisible: true });
    },
    hideRepairTypeAction() {
        this.setData({ repairTypeActionVisible: false });
    },
    showRepairLocalAction() {
        this.setData({ repairLocalActionVisible: true });
    },
    hideRepairLocalAction() {
        this.setData({ repairLocalActionVisible: false });
    },
    onRepairLocalChange(e) {
        this.setData({
            repairLocal: e.detail.id,
            repairLocalName: e.detail.name
        });
    },
    onRepairTypeChange(e) {
        this.setData({
            repairType: e.detail.id,
            repairTypeName: e.detail.name
        });
    },
    deleteImg(e) {
        const { index } = e.detail;
        const { uploadImgList, imgList } = this.data;

        imgList.splice(index, 1);
        uploadImgList.splice(index, 1);

        this.setData({
            imgList,
            uploadImgList
        });
    },
    afterRead(e) {
        const { file } = e.detail;
        const { ASSETS_HOST, uploadImgList, imgList } = this.data;

        $toast.loading({
            duration: 0,
            forbidClick: true,
            message: '上传中…'
        });

        utils.file.md5(file.url).then(hash => {
            const fileName = `repair/${hash}${utils.file.ext(file.url)}`;

            utils.oss(fileName).then(sign => {
                wx.uploadFile({
                    url: sign.host,
                    filePath: file.url,
                    name: 'file',
                    formData: sign,
                    success: () => {
                        $toast.clear();
                        this.setData({
                            uploadImgList: [].concat(uploadImgList, [
                                {
                                    url: `${ASSETS_HOST}/${sign.key}`
                                }
                            ]),
                            imgList: [].concat(imgList, [`/${sign.key}`])
                        });
                    },
                    fail: () => {
                        $toast.clear();
                        $notify({
                            type: 'danger',
                            message: '上传图片失败，请重试'
                        });
                    }
                });
            });
        });
    },
    submit() {
        this.validate(() => {
            $toast.loading({
                duration: 0,
                forbidClick: true,
                message: '提交中…'
            });

            this.setData({
                submiting: true
            });

            const send = data => {
                const { repairType, repairLocal, description, imgList, communityInfo } = this.data;

                utils
                    .request({
                        url: '/repair/create',
                        data: {
                            ...data,
                            repair_type: repairType,
                            building_id: repairLocal,
                            description,
                            repair_imgs: imgList,
                            community_id: communityInfo.current.community_id
                        },
                        method: 'post'
                    })
                    .then(
                        res => {
                            this.setData({ submiting: false });
                            $toast.clear();
                            wx.redirectTo({ url: `/pages/repair/detail?id=${res.data.id}` });
                        },
                        res => {
                            $notify({
                                type: 'danger',
                                message: res.message
                            });
                            $toast.clear();
                            this.setData({ submiting: false });
                        }
                    );
            };

            wx.getSetting({
                withSubscriptions: true,
                success: res => {
                    utils
                        .request({
                            url: '/repair/tpl',
                            method: 'get'
                        })
                        .then(({ data: tpls }) => {
                            const entries = Object.entries(tpls);
                            const keys = entries.map(([k]) => k);
                            const values = entries.map(([, tpl]) => tpl);
                            const validTpls = entries.filter(([, tpl]) => !!tpl).map(([, tpl]) => tpl);
                            const data = {};
                            let gloablSetting = false;

                            // 默认置 0
                            keys.forEach(k => (data[k] = 0));

                            // 全局设置（系统层订阅项）
                            if (res.subscriptionsSetting && res.subscriptionsSetting.itemSettings) {
                                values.forEach((tpl, index) => {
                                    if (tpl && tpl in res.subscriptionsSetting.itemSettings) {
                                        data[keys[index]] = res.subscriptionsSetting.itemSettings[tpl] === 'accept' ? 1 : 0;
                                        gloablSetting = true;
                                    }
                                });
                            }

                            // 已有全局设置或无有效模板时，直接提交
                            if (gloablSetting || validTpls.length === 0) {
                                send(data);
                            } else {
                                wx.requestSubscribeMessage({
                                    tmplIds: validTpls,
                                    success: res => {
                                        entries.forEach(([key, tpl]) => {
                                            if (tpl) data[key] = res[tpl] === 'accept' ? 1 : 0;
                                        });
                                        send(data);
                                    },
                                    // 订阅授权失败不再阻断提交，降级为不订阅直接提交
                                    fail: () => {
                                        send(data);
                                    }
                                });
                            }
                        }, () => {
                            // 拉取模板失败不再阻断，直接提交（不订阅）
                            send({});
                        });
                },
                // 获取设置失败也不阻断，直接提交（不订阅）
                fail: () => {
                    // 继续提交，不弹错误
                    send({});
                }
            });
        });
    }
});
