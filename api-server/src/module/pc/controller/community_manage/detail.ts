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
import { SUCCESS, QUERY_ILLEFAL } from '~/constant/code';

interface RequestParams {
    id: number;
}

const PcCommunityManageDetailAction = <Action>{
    router: {
        path: '/community_manage/detail/:id',
        method: 'get',
        authRequired: true,
        roles: []
    },
    validator: {
        params: [
            {
                name: 'id',
                required: true,
                regex: /^\d+$/
            }
        ]
    },
    response: async ctx => {
        const { id } = <RequestParams>ctx.params;

        const communityInfo = await ctx.model
            .from('ejyy_community_info')
            .where('ejyy_community_info.id', id)
            .select('id', 'name', 'banner', 'phone', 'province', 'city', 'district', 'created_by', 'created_at')
            .first();

        if (!communityInfo) {
            return (ctx.body = {
                code: QUERY_ILLEFAL,
                message: '不存在该小区'
            });
        }

        const creatorInfo = await ctx.model
            .from('ejyy_property_company_user')
            .leftJoin(
                'ejyy_property_company_department',
                'ejyy_property_company_department.id',
                'ejyy_property_company_user.department_id'
            )
            .leftJoin('ejyy_property_company_job', 'ejyy_property_company_job.id', 'ejyy_property_company_user.job_id')
            .where('ejyy_property_company_user.id', communityInfo.created_by)
            .select(
                'ejyy_property_company_user.avatar_url',
                'ejyy_property_company_user.phone',
                'ejyy_property_company_department.name as department',
                'ejyy_property_company_job.name as job',
                'ejyy_property_company_user.real_name',
                'ejyy_property_company_user.created_at'
            )
            .first();

        const setting = await ctx.model
            .from('ejyy_community_setting')
            .where('community_id', id)
            .first();

        const convenientList = await ctx.model
            .from('ejyy_convenient')
            .where('community_id', id)
            .select('id', 'title', 'location', 'phone')
            .orderBy('id', 'desc');

        ctx.body = {
            code: SUCCESS,
            data: {
                communityInfo,
                creatorInfo,
                setting,
                convenientList
            }
        };
    }
};

export default PcCommunityManageDetailAction;
