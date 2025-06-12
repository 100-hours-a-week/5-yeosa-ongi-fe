import { useAlbumClusterMarkers } from '@/hooks/useAlbumClusterMarkers'
import { useKakaoMap } from '@/hooks/useKakaoMap'
import { useRef } from 'react'
import { useAlbumStore, useMainPageStore } from '../../stores/mainPageStore'

const KakaoMap = ({ height }) => {
    const mapContainer = useRef(null)

    // Zustand 스토어에서 상태 가져오기
    const { selectedId } = useMainPageStore()
    const { albums } = useAlbumStore()

    console.log('=== KakaoMap 렌더링 ===')
    console.log('selectedId:', selectedId)

    // 지도 초기화
    const { mapInstance, isMapReady, panTo, setBounds } = useKakaoMap(mapContainer)

    // 앨범 클러스터 마커 관리 (포커스 모드로 변경)
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
                        top: '50%',
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
