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
import { SUCCESS, ILLEGAL_PROPERTY_COMPANY_USER } from '~/constant/code';
import { FALSE } from '~/constant/status';
import * as propertyCompanyService from '~/service/property_company';
import utils from '~/utils';

interface RequestBody {
    phone: string;
    brand?: string;
    model?: string;
    system?: string;
    platform?: string;
}

const PcUserPhoneLoginAction = <Action>{
    router: {
        path: '/user/phone_login',
        method: 'post',
        authRequired: false
    },
    validator: {
        body: [
            {
                name: 'phone',
                required: true,
                regex: /^1\d{10}$/
            },
            {
                name: 'brand',
                required: false
            },
            {
                name: 'model',
                required: false
            },
            {
                name: 'system',
                required: false
            },
            {
                name: 'platform',
                required: false
            }
        ]
    },
    response: async ctx => {
        const { phone, brand, model, system, platform } = <RequestBody>ctx.request.body;

        let pcUserInfo = await ctx.model
            .table('ejyy_property_company_user')
            .leftJoin(
                'ejyy_wechat_official_accounts_user',
                'ejyy_wechat_official_accounts_user.union_id',
                'ejyy_property_company_user.union_id'
            )
            .leftJoin(
                'ejyy_property_company_access',
                'ejyy_property_company_access.id',
                'ejyy_property_company_user.access_id'
            )
            .where('ejyy_property_company_user.leave_office', FALSE)
            .where('ejyy_property_company_user.phone', phone)
            .select(
                'ejyy_property_company_user.id',
                'ejyy_property_company_user.account',
                'ejyy_property_company_user.real_name',
                'ejyy_property_company_user.gender',
                'ejyy_property_company_user.avatar_url',
                'ejyy_property_company_user.phone',
                'ejyy_property_company_user.admin',
                'ejyy_property_company_user.join_company_at',
                'ejyy_property_company_user.created_at',
                'ejyy_wechat_official_accounts_user.subscribed',
                'ejyy_property_company_access.content'
            )
            .first();

        if (!pcUserInfo) {
            return (ctx.body = {
                code: ILLEGAL_PROPERTY_COMPANY_USER,
                message: '未查询到任职信息'
            });
        }

        // 生成并下发 token
        const token = utils.crypto.md5(`${pcUserInfo.account || pcUserInfo.phone}${Date.now()}`);

        pcUserInfo.phone = utils.phone.hide(pcUserInfo.phone);
        pcUserInfo.access = pcUserInfo.content ? pcUserInfo.content : [];
        delete pcUserInfo.content;

        await ctx.model
            .from('ejyy_property_company_auth')
            .where({ property_company_user_id: pcUserInfo.id })
            .update({ token });

        await ctx.model.from('ejyy_property_company_user_login').insert({
            property_company_user_id: pcUserInfo.id,
            ip: ctx.request.ip,
            user_agent: `brand/${brand || ''},model/${model || ''},system/${system || ''},platform/$${
                platform || ''
            }`,
            login_at: Date.now()
        });

        const postInfo = await propertyCompanyService.postInfo(ctx.model, pcUserInfo.id);

        ctx.body = {
            code: SUCCESS,
            data: {
                token,
                postInfo,
                userInfo: pcUserInfo
            }
        };
    }
};

export default PcUserPhoneLoginAction;

