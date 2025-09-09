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
import { TRUE } from '~/constant/status';

interface RequestBody {
    page_num: number;
    page_size: number;
}

const MpQuestionnaireAnsweredAction = <Action>{
    router: {
        path: '/questionnaire/answered',
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
            .from('ejyy_questionnaire')
            .leftJoin(
                'ejyy_questionnaire_answer',
                'ejyy_questionnaire_answer.questionnaire_id',
                'ejyy_questionnaire.id'
            )
            .leftJoin('ejyy_community_info', 'ejyy_community_info.id', 'ejyy_questionnaire.community_id')
            .where('ejyy_questionnaire_answer.wechat_mp_user_id', ctx.mpUserInfo.id)
            .andWhere('ejyy_questionnaire.published', TRUE)
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_questionnaire.id'))
            .select(
                'ejyy_questionnaire.id',
                'ejyy_questionnaire.title',
                'ejyy_questionnaire.expire',
                'ejyy_questionnaire.published_at',
                'ejyy_questionnaire.created_at',
                'ejyy_community_info.name as community_name',
                'ejyy_questionnaire_answer.created_at as answered_at'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_questionnaire.id', 'desc');

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

export default MpQuestionnaireAnsweredAction;
