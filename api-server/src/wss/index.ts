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

import WebSocket from 'ws';
import http from 'http';
import quertString from 'query-string';
import model from '~/model';
import { Role } from '~/constant/role_access';

export interface CwWebSocket extends WebSocket {
    access?: Role[];
    user_id?: number;
}

export interface PcData {
    id: number;
    community_id: number;
    type: Role;
    urge: boolean;
}

class ws {
    static ws: WebSocket.Server;

    static init(server: http.Server) {
        this.ws = new WebSocket.Server({ server, path: '/cws' });

        this.ws.on('connection', async (ws: CwWebSocket, request: http.IncomingMessage) => {
            const {
                query: { token }
            } = quertString.parseUrl(request.url);

            if (!token) {
                return ws.close();
            }

            const userInfo = await model
                .table('ejyy_property_company_auth')
                .leftJoin(
                    'ejyy_property_company_user',
                    'ejyy_property_company_user.id',
                    'ejyy_property_company_auth.property_company_user_id'
                )
                .leftJoin(
                    'ejyy_property_company_access',
                    'ejyy_property_company_access.id',
                    'ejyy_property_company_user.access_id'
                )
                .where('ejyy_property_company_auth.token', token)
                .select('ejyy_property_company_user.id', 'ejyy_property_company_access.content')
                .first();

            if (!userInfo) {
                return ws.close();
            }

            ws.user_id = userInfo.id;
            // 统一将 access 规范为 Role[]，防止为 null 或字符串导致 .includes 崩溃
            try {
                let access: any = (userInfo as any).content;

                if (typeof access === 'string' && access.length) {
                    try {
                        access = JSON.parse(access);
                    } catch (_) {
                        // 兼容逗号分隔的存储格式
                        access = access.split(',').map((x: string) => Number(x.trim())).filter((x: any) => !Number.isNaN(x));
                    }
                }

                if (!Array.isArray(access)) {
                    access = [];
                }

                ws.access = access as Role[];
            } catch (_) {
                ws.access = [];
            }
        });
    }

    static sendToPc(data: PcData) {
        if (!(this.ws instanceof WebSocket.Server)) {
            return;
        }

        this.ws.clients.forEach((client: CwWebSocket) => {
            try {
                if (client.readyState !== WebSocket.OPEN) return;

                const access = Array.isArray(client.access) ? client.access : [];

                if (access.includes(data.type) || access.includes(Role.ANYONE)) {
                    client.send(JSON.stringify(data));
                }
            } catch (err) {
                console.error('WS sendToPc error:', (err as Error).message);
            }
        });
    }
}

export default ws;
