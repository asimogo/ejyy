import axios from 'axios';
import config from '~/config';
import { MapProvider, Location, SearchParams, SearchResult, parseNearby } from '../types';

const DEFAULT_LOCATION: Location = { lat: 43.26624, lng: 117.54421 };

const tencentKey = config.map.tencentKey || config.map.key;

const tencentProvider: MapProvider = {
    async getLocation(ip: string): Promise<Location> {
        if (!tencentKey) return DEFAULT_LOCATION;
        try {
            const res = await axios({
                url: 'https://apis.map.qq.com/ws/location/v1/ip',
                params: {
                    key: tencentKey,
                    ip: ip === '127.0.0.1' ? undefined : ip
                },
                method: 'get',
                timeout: 2000
            });
            if (res.data && res.data.status === 0) {
                return res.data.result.location as Location;
            }
        } catch (_) {}
        return DEFAULT_LOCATION;
    },
    async search(params: SearchParams): Promise<SearchResult> {
        const { keyword, boundary, category, page_size, page_index } = params;
        if (!tencentKey) return { status: 0, count: 0, data: [] } as SearchResult;
        try {
            const res = await axios({
                url: 'https://apis.map.qq.com/ws/place/v1/search',
                params: {
                    keyword: keyword ? keyword : undefined,
                    boundary,
                    filter: `category=${category}&tel<>null`,
                    page_size,
                    page_index,
                    key: tencentKey
                },
                method: 'get',
                timeout: 2000
            });
            if (res.data && res.data.status === 0) {
                return res.data as SearchResult;
            }
        } catch (_) {}
        return { status: 0, count: 0, data: [] } as SearchResult;
    }
};

export default tencentProvider;

