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
import * as ossService from '~/service/oss';
import config from '~/config';

const PcUploadSignAction = <Action>{
    router: {
        path: '/upload/sign',
        method: 'get',
        authRequired: config.inited
    },

    response: async ctx => {
        ctx.body = {
            code: SUCCESS,
            data: {
                ...ossService.sign()
            }
        };
    }
};

export default PcUploadSignAction;
