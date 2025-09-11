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
    avatar_url: string;
}

const MpUserUpdateAvatarAction = <Action>{
    router: {
        path: '/user/update_avatar',
        method: 'post',
        authRequired: true
    },
    validator: {
        body: [
            {
                name: 'avatar_url',
                required: true,
                validator: val => /^\/avatar\/[a-z0-9]{32}|default\.(jpg|jpeg|png)$/.test(val)
            }
        ]
    },
    response: async ctx => {
        const { avatar_url } = <RequestBody>ctx.request.body;

        await ctx.model
            .from('ejyy_wechat_mp_user')
            .where('id', ctx.mpUserInfo.id)
            .update({ avatar_url });

        ctx.body = {
            code: SUCCESS,
            message: '头像更新成功'
        };
    }
};

export default MpUserUpdateAvatarAction;