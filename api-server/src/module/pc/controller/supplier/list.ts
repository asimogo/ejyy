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
import * as ROLE from '~/constant/role_access';

interface RequestBody {
    page_num: number;
    page_size: number;
}

const PcSupplierListAction = <Action>{
    router: {
        path: '/supplier/list',
        method: 'post',
        authRequired: true,
        roles: [ROLE.ANYONE]
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
            .from('ejyy_material_supplier')
            .leftJoin(
                'ejyy_property_company_user',
                'ejyy_property_company_user.id',
                'ejyy_material_supplier.created_by'
            )
            .select(ctx.model.raw('SQL_CALC_FOUND_ROWS ejyy_material_supplier.id'))
            .select(
                'ejyy_material_supplier.id',
                'ejyy_material_supplier.title',
                'ejyy_material_supplier.linkman',
                'ejyy_material_supplier.phone',
                'ejyy_material_supplier.business',
                'ejyy_material_supplier.bank_name',
                'ejyy_material_supplier.bank_id',
                'ejyy_material_supplier.bank_address',
                'ejyy_material_supplier.business',
                'ejyy_material_supplier.created_at',
                'ejyy_material_supplier.created_by',
                'ejyy_property_company_user.real_name'
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .orderBy('ejyy_material_supplier.id', 'desc');

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

export default PcSupplierListAction;
