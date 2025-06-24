import { useAlbumClusterMarkers } from '@/hooks/useAlbumClusterMarkers'
import { useKakaoMap } from '@/hooks/useKakaoMap'
import { useRef } from 'react'
import { useAlbumStore, useMainPageStore } from '../../stores/mainPageStore'

interface KakaoMapProps {
    height: number
}

const KakaoMap = ({ height }: KakaoMapProps) => {
    const mapContainer = useRef(null)

    // Hooks
    const { selectedId } = useMainPageStore()
    const { albums } = useAlbumStore()
    const { mapInstance, isMapReady, panTo, setBounds } = useKakaoMap(mapContainer)

    useAlbumClusterMarkers({
        albums,
        isMapReady,
        mapInstance,
        panTo,
        selectedId,
        setBounds,
    })

    return (
        <div className='h-full' style={{ position: 'relative' }}>
            {/* 로딩 상태 표시 */}
            {!isMapReady && (
                <div
                    style={{
                        position: 'absolute',
                        top: '25%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1000,
                        background: 'rgba(255,255,255,0.9)',
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        textAlign: 'center',
                    }}
                >
                    <div>지도를 로딩 중...</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>잠시만 기다려주세요</div>
                </div>
            )}

            <div
                ref={mapContainer}
                style={{
                    width: '100%',
                    height: height,
                }}
            />
        </div>
    )
}

export default KakaoMap
