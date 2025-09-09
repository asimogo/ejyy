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

import { CwPage } from '../common/page';
import utils from '../../utils/index';
import $notify from '../../components/notify/notify';
import $toast from '../../components/toast/toast';
import $dialog from '../../components/dialog/dialog';
import { ASSETS_HOST } from '../../config';

CwPage({
    data: {
        ASSETS_HOST,
        fetching: true,
        id: null,
        detail: {},
        canceling: false,
        activeCollapse: 0
    },
    onLoad(opt) {
        this.setData({
            id: parseInt(opt.id, 10)
        });
    },
    onGlobalDataUpdate() {
        this.getDetail();
    },
    getDetail() {
        if (!this.data.postInfo.default_community_id) {
            return Promise.reject();
        }

        this.setData({
            fetching: true
        });

        return utils
            .request({
                url: '/refound/detail',
                method: 'post',
                data: {
                    id: this.data.id,
                    community_id: this.data.postInfo.default_community_id
                }
            })
            .then(
                res => {
                    this.setData({
                        fetching: false,
                        detail: res.data
                    });
                },
                res => {
                    if (res.code === -130) {
                        $notify({
                            type: 'danger',
                            message: '请返回首页修改默认小区后查看'
                        });

                        return setTimeout(() => {
                            wx.redirectTo({ url: '/pages/home/index' });
                        }, 3000);
                    }

                    this.setData({
                        fetching: false,
                        detail: {}
                    });

                    $notify({
                        type: 'danger',
                        message: res.message
                    });
                }
            );
    },
    onApproved(e) {
        const data = {
            id: this.data.id,
            community_id: this.data.postInfo.default_community_id,
            ...e.detail
        };

        utils
            .request({
                url: '/refound/flow',
                method: 'post',
                data: {
                    id: this.data.id,
                    community_id: this.data.postInfo.default_community_id,
                    ...e.detail
                }
            })
            .then(
                res => {
                    this.getDetail();
                },
                res => {
                    $notify({
                        type: 'danger',
                        message: res.message
                    });
                }
            );
    },
    onRelationed(e) {
        utils
            .request({
                url: '/refound/assign',
                method: 'post',
                data: {
                    id: this.data.id,
                    community_id: this.data.postInfo.default_community_id,
                    ...e.detail
                }
            })
            .then(
                res => {
                    this.getDetail();
                },
                res => {
                    $notify({
                        type: 'danger',
                        message: res.message
                    });
                }
            );
    },
    doCancel() {
        $dialog
            .confirm({
                title: '请确认',
                message: '确认要撤销本次报销流程吗？'
            })
            .then(() => {
                this.setData({ canceling: true });
                utils
                    .request({
                        url: '/refound/cancel',
                        method: 'post',
                        data: {
                            id: this.data.id,
                            community_id: this.data.postInfo.default_community_id
                        }
                    })
                    .then(
                        res => {
                            this.setData({
                                canceling: false,
                                detail: {
                                    ...this.data.detail,
                                    info: {
                                        ...this.data.detail.info,
                                        cancel: 1,
                                        canceled_at: res.data.canceled_at
                                    }
                                }
                            });

                            $notify({
                                type: 'success',
                                message: '撤销报销流程成功'
                            });
                        },
                        res => {
                            $notify({
                                type: 'danger',
                                message: res.message
                            });
                            this.setData({ canceling: false });
                        }
                    );
            })
            .catch(() => {});
    },
    onCollapseChange(e) {
        this.setData({
            activeCollapse: e.detail
        });
    },
    showImg(e) {
        const { src } = e.currentTarget.dataset;

        wx.previewImage({
            current: 0,
            urls: [src]
        });
    }
});
