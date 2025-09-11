import axios from 'axios';
import config from '~/config';
import { MapProvider, Location, SearchParams, SearchResult, SearchResultItem, parseNearby } from '../types';

const DEFAULT_LOCATION: Location = { lat: 43.26624, lng: 117.54421 };

const googleKey = config.map.googleKey;

function distance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const radLat1 = (lat1 * Math.PI) / 180.0;
    const radLat2 = (lat2 * Math.PI) / 180.0;
    const a = radLat1 - radLat2;
    const b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0;
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137;
    return Math.abs(Math.round(s * 10000) / 10);
}

const googleProvider: MapProvider = {
    async getLocation(_ip: string): Promise<Location> {
        // Google Geolocation API 通常需要更复杂的信息，IP 定位不稳定；这里统一返回默认坐标
        return DEFAULT_LOCATION;
    },
    async search(params: SearchParams): Promise<SearchResult> {
        const { boundary, category, page_size, page_index, keyword } = params;

        if (!googleKey) {
            return { status: 0, count: 0, data: [] } as SearchResult;
        }

        const parsed = parseNearby(boundary);
        if (!parsed) {
            return { status: 0, count: 0, data: [] } as SearchResult;
        }

        const { lat, lng, radius } = parsed;

        try {
            const res = await axios({
                url: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
                params: {
                    location: `${lat},${lng}`,
                    radius,
                    keyword: keyword || category || undefined,
                    key: googleKey
                },
                method: 'get',
                timeout: 2000
            });

            if (!res.data || res.data.status !== 'OK') {
                return { status: 0, count: 0, data: [] } as SearchResult;
            }

            const results = Array.isArray(res.data.results) ? res.data.results : [];

            const mappedAll: SearchResultItem[] = results.map((r: any) => ({
                id: r.place_id,
                title: r.name,
                address: r.vicinity || r.formatted_address || '',
                tel: '', // 需要 Place Details 才能拿到，先置空
                category: (r.types && r.types[0]) || (keyword || category || ''),
                type: 0,
                location: { lat: r.geometry?.location?.lat || lat, lng: r.geometry?.location?.lng || lng },
                _distance: distance(lat, lng, r.geometry?.location?.lat || lat, r.geometry?.location?.lng || lng)
            }));

            // 仅为当前页的结果补充电话号码，避免过多外部请求
            const start = (page_index - 1) * page_size;
            const pageItems = mappedAll.slice(start, start + page_size);

            // 并发请求 Place Details（限制请求超时，失败则忽略）
            await Promise.all(
                pageItems.map(async item => {
                    try {
                        const detailRes = await axios({
                            url: 'https://maps.googleapis.com/maps/api/place/details/json',
                            params: {
                                place_id: item.id,
                                fields: 'formatted_phone_number,international_phone_number',
                                key: googleKey
                            },
                            method: 'get',
                            timeout: 2000
                        });
                        if (detailRes.data && detailRes.data.status === 'OK') {
                            const phone =
                                detailRes.data.result?.formatted_phone_number ||
                                detailRes.data.result?.international_phone_number ||
                                '';
                            if (phone) item.tel = phone;
                        }
                    } catch (_) {
                        // ignore details fetch error
                    }
                })
            );

            return { status: 0, count: mappedAll.length, data: pageItems } as SearchResult;
        } catch (_) {
            return { status: 0, count: 0, data: [] } as SearchResult;
        }
    }
};

export default googleProvider;
