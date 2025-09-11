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

CwPage({
    data: {
        ASSETS_HOST,
        // form data start
        complainType: null,
        complainCateogry: null,
        description: '',
        imgList: [],
        // form data end
        uploadImgList: [],
        submiting: false,
        complainTypeActionVisible: false,
        complainTypeName: '',
        complainTypeActions: [
            { name: '投诉', id: 1 },
            { name: '建议', id: 2 }
        ],
        complainCateogryActionVisible: false,
        complainCateogryName: '',
        complainCateogryActions: [
            { name: '卫生', id: 1 },
            { name: '噪音', id: 2 },
            { name: '服务态度', id: 3 },
            { name: '违建', id: 4 },
            { name: '占用消防通道', id: 5 },
            { name: '小区设施', id: 6 },
            { name: '其他', id: 7 }
        ]
    },
    validator: {
        formFields: ['complainType', 'complainCateogry', 'description'],
        formRule: {
            complainType: [{ required: true, message: '请选择反馈类型' }],
            complainCateogry: [{ required: true, message: '请选择反馈分类' }],
            description: [
                { required: true, message: '请输入问题描述' },
                { min: 5, message: '问题描述应大于5个字' },
                { max: 200, message: '问题描述不能超过5个字' }
            ]
        }
    },
    showComplainTypeAction() {
        this.setData({ complainTypeActionVisible: true });
    },
    hideComplainTypeAction() {
        this.setData({ complainTypeActionVisible: false });
    },
    showComplainCategoryAction() {
        this.setData({ complainCateogryActionVisible: true });
    },
    hideComplainCategoryAction() {
        this.setData({ complainCateogryActionVisible: false });
    },
    onComplainCategoryChange(e) {
        this.setData({
            complainCateogry: e.detail.id,
            complainCateogryName: e.detail.name
        });
    },
    onComplainTypeChange(e) {
        this.setData({
            complainType: e.detail.id,
            complainTypeName: e.detail.name
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
            const fileName = `complain/${hash}${utils.file.ext(file.url)}`;

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
                const { communityInfo, description, complainType, complainCateogry, imgList } = this.data;

                utils
                    .request({
                        url: '/complain/create',
                        data: {
                            ...data,
                            type: complainType,
                            category: complainCateogry,
                            description,
                            complain_imgs: imgList,
                            community_id: communityInfo.current.community_id
                        },
                        method: 'post'
                    })
                    .then(
                        res => {
                            this.setData({ submiting: false });
                            $toast.clear();
                            wx.redirectTo({ url: `/pages/complain/detail?id=${res.data.id}` });
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
                            url: '/complain/tpl',
                            method: 'get'
                        })
                        .then(({ data: tpls }) => {
                            const entries = Object.entries(tpls); // [ [key, tpl], ... ]
                            const keys = entries.map(([k]) => k);
                            const values = entries.map(([, tpl]) => tpl);
                            const validTpls = entries.filter(([, tpl]) => !!tpl).map(([, tpl]) => tpl);
                            const data = {};

                            // 默认置 0
                            keys.forEach(k => (data[k] = 0));

                            const settings = res.subscriptionsSetting || {};
                            const itemSettings = settings.itemSettings || {};

                            // 如果系统层已存在订阅设置（命中任意模板），直接按设置填充并发送
                            let hasGlobal = false;
                            entries.forEach(([key, tpl]) => {
                                if (tpl && Object.prototype.hasOwnProperty.call(itemSettings, tpl)) {
                                    data[key] = itemSettings[tpl] === 'accept' ? 1 : 0;
                                    hasGlobal = true;
                                }
                            });

                            if (hasGlobal || validTpls.length === 0) {
                                // 没有可用模板或已从全局设置读取，直接提交
                                send(data);
                            } else {
                                wx.requestSubscribeMessage({
                                    tmplIds: validTpls,
                                    success: subRes => {
                                        entries.forEach(([key, tpl]) => {
                                            if (tpl) data[key] = subRes[tpl] === 'accept' ? 1 : 0;
                                        });
                                        send(data);
                                    },
                                    fail: () => {
                                        // 订阅失败不阻断提交流程，按未订阅处理
                                        send(data);
                                    }
                                });
                            }
                        });
                },
                fail: () => {
                    // 获取系统订阅设置失败时，仍尽量继续流程
                    utils
                        .request({
                            url: '/complain/tpl',
                            method: 'get'
                        })
                        .then(({ data: tpls }) => {
                            const entries = Object.entries(tpls);
                            const keys = entries.map(([k]) => k);
                            const validTpls = entries.filter(([, tpl]) => !!tpl).map(([, tpl]) => tpl);
                            const data = {};
                            keys.forEach(k => (data[k] = 0));

                            if (validTpls.length === 0) {
                                send(data);
                            } else {
                                wx.requestSubscribeMessage({
                                    tmplIds: validTpls,
                                    success: subRes => {
                                        entries.forEach(([key, tpl]) => {
                                            if (tpl) data[key] = subRes[tpl] === 'accept' ? 1 : 0;
                                        });
                                        send(data);
                                    },
                                    fail: () => {
                                        send(data);
                                    }
                                });
                            }
                        });
                }
            });
        });
    }
});
