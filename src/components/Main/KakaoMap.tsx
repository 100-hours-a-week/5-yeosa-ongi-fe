import { useAlbumClusterMarkers } from '@/hooks/useAlbumClusterMarkers'
import { useKakaoMap } from '@/hooks/useKakaoMap'
import { useRef } from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useAlbumStore, useMainPageStore } from '../../stores/mainPageStore'

interface KakaoMapProps {
    height: number
}

// 지도 스켈레톤 컴포넌트
const MapSkeleton = ({ height }: { height: number }) => (
    <SkeletonTheme baseColor='#e2e8f0' highlightColor='#f1f5f9'>
        <div className='relative w-full' style={{ height }}>
            {/* 메인 지도 영역 스켈레톤 */}
            <div className='absolute inset-0 z-0 bg-gray-50' />
            <Skeleton className='absolute inset-0 w-full h-full' borderRadius={12} />

            {/* 지도 컨트롤 버튼들 스켈레톤 */}
            <div className='absolute z-10 flex flex-col gap-2 top-4 right-4'>
                <Skeleton circle width={40} height={40} />
                <Skeleton circle width={40} height={40} />
                <Skeleton width={80} height={32} borderRadius={16} />
            </div>

            {/* 검색/필터 영역 스켈레톤 */}
            <div className='absolute z-10 top-4 left-4'>
                <Skeleton width={200} height={36} borderRadius={18} />
            </div>

            {/* 하단 정보 패널 스켈레톤 */}
            <div className='absolute z-10 bottom-4 left-4 right-4'>
                <div className='p-3 bg-white rounded-lg shadow-lg'>
                    <div className='flex items-center gap-3'>
                        <Skeleton circle width={50} height={50} />
                        <div className='flex-1'>
                            <Skeleton width='70%' height={16} className='mb-2' />
                            <Skeleton width='50%' height={14} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </SkeletonTheme>
)

const KakaoMap = ({ height }: KakaoMapProps) => {
    const mapContainer = useRef<HTMLDivElement>(null)

    // Hooks
    const { selectedId } = useMainPageStore()
    const { albums } = useAlbumStore()

    // ✅ useKakaoMap의 loadingStage를 직접 사용
    const { mapInstance, isMapReady, loadingStage, panTo, setBounds } = useKakaoMap(mapContainer)

    useAlbumClusterMarkers({
        albums,
        isMapReady,
        mapInstance,
        panTo,
        selectedId,
        setBounds,
    })

    // ✅ 항상 DOM 구조를 유지하면서 조건부 렌더링
    return (
        <div className='h-full' style={{ position: 'relative' }}>
            {/* 지도 컨테이너는 항상 존재 */}
            <div
                ref={mapContainer}
                className={`w-full h-full transition-opacity duration-500 ${isMapReady ? 'opacity-100' : 'opacity-0'}`}
                style={{ height }}
            />

            {/* 로딩 단계별 오버레이 */}
            {loadingStage !== 'ready' && (
                <div className='absolute inset-0 z-50'>
                    {loadingStage === 'script' && (
                        <div className='absolute inset-0 flex items-center justify-center bg-white'>
                            <div className='text-center'>
                                <div className='text-sm text-gray-600'>지도 스크립트 로딩 중...</div>
                                <div className='mt-1 text-xs text-gray-400'>잠시만 기다려주세요</div>
                            </div>
                        </div>
                    )}

                    {(loadingStage === 'container' || loadingStage === 'map' || loadingStage === 'tiles') && (
                        <MapSkeleton height={height} />
                    )}
                </div>
            )}

            {/* 추가 로딩 오버레이 (폴백) */}
            {!isMapReady && loadingStage === 'ready' && (
                <div
                    className='absolute inset-0 z-40 flex items-center justify-center bg-white bg-opacity-90'
                    style={{
                        transition: 'opacity 0.3s ease-out',
                        opacity: isMapReady ? 0 : 1,
                        pointerEvents: isMapReady ? 'none' : 'auto',
                    }}
                >
                    <div className='text-center'>
                        <div className='text-sm text-gray-600'>지도 준비 중...</div>
                        <div className='mt-1 text-xs text-gray-400'>조금만 기다려주세요</div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default KakaoMap
