export interface KakaoLatLng {
    getLat: () => number
    getLng: () => number
}

export interface KakaoLatLngBounds {
    extend: (latLng: KakaoLatLng) => void
}

export interface KakaoMapOptions {
    center: KakaoLatLng
    level: number
    mapTypeId?: string
    draggable?: boolean
    scrollwheel?: boolean
    disableDoubleClick?: boolean
    disableDoubleClickZoom?: boolean
    projectionId?: string
}

export interface KakaoMap {
    panTo: (latLng: KakaoLatLng) => void
    setBounds: (bounds: KakaoLatLngBounds) => void
    getLevel: () => number
    setLevel: (level: number) => void
}

export interface KakaoMarker {
    setMap: (map: KakaoMap | null) => void
    albumId?: string
}

export interface KakaoCustomOverlay {
    setMap: (map: KakaoMap | null) => void
    getContent: () => HTMLElement | null
}

export interface KakaoMarkerClusterer {
    clear: () => void
    addMarker: (marker: KakaoMarker) => void
    addMarkers: (markers: KakaoMarker[]) => void
}

export interface Location {
    latitude: number
    longitude: number
}

// 카카오맵 전역 객체 타입 선언
declare global {
    interface Window {
        kakao: {
            maps: {
                LatLng: new (lat: number, lng: number) => KakaoLatLng
                LatLngBounds: new () => KakaoLatLngBounds
                Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap
                Marker: new (options: any) => KakaoMarker
                CustomOverlay: new (options: any) => KakaoCustomOverlay
                MarkerClusterer: new (options: any) => KakaoMarkerClusterer
                load: (callback: () => void) => void

                event: {
                    addListener: (target: any, type: string, handler: () => void) => void
                    removeListener: (target: any, type: string, handler: () => void) => void
                }
                MapTypeId: {
                    ROADMAP: string
                }
                ProjectionId: {
                    WCONG: string
                }
            }
        }
    }
}
