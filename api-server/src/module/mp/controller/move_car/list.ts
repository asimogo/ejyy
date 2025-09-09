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

const MpMoveCarListAction = <Action>{
    router: {
        path: '/move_car/list',
        method: 'post',
        authRequired: true,
        verifyIntact: true
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
            .from('ejyy_move_car')
            .leftJoin('ejyy_community_info', 'ejyy_community_info.id', 'ejyy_move_car.community_id')
            .where('ejyy_move_car.wechat_mp_user_id', ctx.mpUserInfo.id)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_move_car.id'))
            .select(
                'ejyy_community_info.name as community_name',
                'ejyy_move_car.car_number',
                'ejyy_move_car.move_reason',
                'ejyy_move_car.responsed_at',
                'ejyy_move_car.created_at'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_move_car.id', 'desc');

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

export default MpMoveCarListAction;
