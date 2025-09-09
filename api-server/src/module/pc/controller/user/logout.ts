/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020~2022  All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: 
 * +----------------------------------------------------------------------
 */

import { Action } from '~/types/action';
import { SUCCESS } from '~/constant/code';

const PcUserLogoutAction = <Action>{
    router: {
        path: '/user/logout',
        method: 'get',
        authRequired: true
    },
    response: async ctx => {
        await ctx.model
            .from('ejyy_property_company_auth')
            .where({ property_company_user_id: ctx.pcUserInfo.id })
            .update({
                token: null
            });

        ctx.body = {
            code: SUCCESS,
            message: '账号已退出'
        };
    }
};

export default PcUserLogoutAction;
