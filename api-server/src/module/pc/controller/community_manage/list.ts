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
import { SUCCESS } from '~/constant/code';

interface RequestBody {
    page_num: number;
    page_size: number;
}

const PcCommunityManageListAction = <Action>{
    router: {
        path: '/community_manage/list',
        method: 'post',
        authRequired: true,
        roles: []
    },
    validator: {
        body: [
            {
                name: 'page_num',
                regex: /^\d+$/,
                required: true
            },
            {
                name: 'page_size',
                regex: /^\d+$/,
                required: true
            }
        ]
    },
    response: async ctx => {
        const { page_num, page_size } = <RequestBody>ctx.request.body;

        const list = await ctx.model
            .from('ejyy_community_info')
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS id'))
            .select('id', 'name', 'province', 'city', 'district', 'created_at')
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('id', 'desc');

        const [res] = await ctx.model.select(ctx.model.raw('found_rows() AS total'));

        ctx.body = {
            code: SUCCESS,
            data: {
                list,
                total: res.total,
                page_amount: Math.ceil(res.total / page_size),
                page_num,
                page_size
            }
        };
    }
};

export default PcCommunityManageListAction;
