export interface Location {
    lat: number;
    lng: number;
}

export interface SearchParams {
    keyword?: string;
    boundary: string; // e.g., nearby(lat,lng,radius,1)
    category?: string;
    page_size: number;
    page_index: number;
}

export interface SearchResultItem {
    id: string;
    title: string;
    address: string;
    tel: string;
    category: string;
    type: number;
    location: Location;
    _distance: number;
}

export interface SearchResult {
    status: number;
    count: number;
    data: SearchResultItem[];
}

export interface MapProvider {
    getLocation(ip: string): Promise<Location>;
    search(params: SearchParams): Promise<SearchResult>;
}

export function parseNearby(boundary: string): { lat: number; lng: number; radius: number } | null {
    // format: nearby(lat,lng,radius,1)
    const m = boundary.match(/nearby\(([-\d.]+),([-.\d]+),([\d.]+),\d+\)/);
    if (!m) return null;
    return { lat: parseFloat(m[1]), lng: parseFloat(m[2]), radius: parseFloat(m[3]) };
}

