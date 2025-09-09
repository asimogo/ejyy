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

import { Action } from '~/types/action';
import { SUCCESS, REPAIR_RATE_EXIST, QUERY_ILLEFAL } from '~/constant/code';

interface RequestBody {
    rate: 1 | 2 | 3 | 4 | 5;
    rate_content?: string;
}

interface RequestParams {
    id: number;
}

const MpRepairRateAction = <Action>{
    router: {
        path: '/repair/rate/:id',
        method: 'post',
        authRequired: true,
        verifyIntact: true
    },
    validator: {
        body: [
            {
                name: 'rate',
                required: true,
                min: 1,
                max: 5
            },
            {
                name: 'rate_content',
                max: 128
            }
        ],
        params: [
            {
                name: 'id',
                required: true
            }
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;
        const { rate, rate_content } = <RequestBody>ctx.request.body;

        const record = await ctx.model
            .from('ejyy_repair')
            .where('id', id)
            .andWhere('wechat_mp_user_id', ctx.mpUserInfo.id)
            .first();

        if (!record) {
            return (ctx.body = {
                code: QUERY_ILLEFAL
            });
        }

        if (record.rate !== null) {
            return (ctx.body = {
                code: REPAIR_RATE_EXIST,
                message: '请勿多次提交评论'
            });
        }

        await ctx.model
            .from('ejyy_repair')
            .update({ rate, rate_content, rated_at: Date.now() })
            .where('id', id);

        ctx.body = {
            code: SUCCESS,
            message: '评论成功'
        };
    }
};

export default MpRepairRateAction;
