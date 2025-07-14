import {
    type KakaoCustomOverlay,
    type KakaoMap,
    type KakaoMarker,
    type KakaoMarkerClusterer,
} from '@/hooks/useKakaoMap' // 타입을 useKakaoMap에서 import
import { useMainPageStore } from '@/stores/mainPageStore'
import {
    CLUSTER_CONFIG,
    createCustomOverlayContent,
    createMarkerClickHandler,
    createOverlayClickHandler,
    type AlbumData,
    type PanToCallback,
} from '@/utils/mapMarkerUtils'
import { useEffect, useRef } from 'react'

// 타입 정의
interface UseAlbumClusterMarkersProps {
    albums: Record<string, AlbumData> | null
    isMapReady: boolean
    mapInstance: React.RefObject<KakaoMap | null>
    panTo: PanToCallback
    selectedId: string | null
    setBounds: (albums: AlbumData[], padding?: number) => void
}

/**
 * 앨범 클러스터 마커 관리 훅
 */
export const useAlbumClusterMarkers = ({
    albums,
    isMapReady,
    mapInstance,
    panTo,
    selectedId,
    setBounds,
}: UseAlbumClusterMarkersProps) => {
    const markersRef = useRef<KakaoMarker[]>([])
    const customOverlaysRef = useRef<KakaoCustomOverlay[]>([])
    const clustererRef = useRef<KakaoMarkerClusterer | null>(null)
    const zoomHandlerRef = useRef<(() => void) | null>(null) // 이벤트 리스너 참조 저장

    const clearMarkers = () => {
        // 클러스터러 정리
        if (clustererRef.current) {
            clustererRef.current.clear()
        }

        // 커스텀 오버레이 정리
        customOverlaysRef.current.forEach(overlay => {
            const element = overlay.getContent()
            if (element) {
                const newElement = element.cloneNode(true)
                element.parentNode?.replaceChild(newElement, element)
            }
            overlay.setMap(null)
        })
        customOverlaysRef.current = []

        // 마커 정리
        markersRef.current.forEach(marker => marker.setMap(null))
        markersRef.current = []
    }

    const handleZoomChange = () => {
        if (!mapInstance.current) return // null 체크 추가

        const level = mapInstance.current.getLevel()
        const shouldShowCustomOverlays = level <= 4 // 레벨 4 이하에서 커스텀 오버레이 표시

        if (shouldShowCustomOverlays) {
            // 확대 모드: 클러스터러에서 마커 제거하고 커스텀 오버레이 표시
            if (clustererRef.current) {
                clustererRef.current.clear()
            }
            markersRef.current.forEach(marker => {
                marker.setMap(null) // 기본 마커 숨김
            })
            customOverlaysRef.current.forEach(overlay => {
                overlay.setMap(mapInstance.current) // 커스텀 오버레이 표시
            })
        } else {
            // 축소 모드: 커스텀 오버레이 숨기고 클러스터러에 마커 추가
            customOverlaysRef.current.forEach(overlay => {
                overlay.setMap(null) // 커스텀 오버레이 숨김
            })
            if (clustererRef.current && markersRef.current.length > 0) {
                clustererRef.current.addMarkers(markersRef.current) // 클러스터링
            }
        }
    }

    /**
     * 선택된 앨범 포커스 처리
     */
    const focusSelectedAlbum = (selectedAlbumId: string) => {
        if (!selectedAlbumId || !albums?.[selectedAlbumId] || !mapInstance.current) return

        const selectedAlbum = albums[selectedAlbumId]

        // 선택된 앨범 위치로 이동
        if (selectedAlbum.latitude && selectedAlbum.longitude) {
            panTo(selectedAlbum.latitude, selectedAlbum.longitude)

            // 적절한 줌 레벨로 조정 (개별 마커가 보이도록)
            setTimeout(() => {
                if (mapInstance.current) {
                    const currentLevel = mapInstance.current.getLevel()
                    if (currentLevel > 4) {
                        mapInstance.current.setLevel(3) // 커스텀 오버레이가 보이는 레벨로
                    }
                }
            }, 300)
        }

        // 모든 오버레이의 스타일 초기화
        customOverlaysRef.current.forEach(overlay => {
            const element = overlay.getContent() as HTMLElement | null
            if (element) {
                // 기본 스타일로 리셋
                element.style.transform = 'scale(1)'
                element.style.zIndex = '100'
                element.style.border = '4px solid #F3D0D7'
                element.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)'
            }
        })

        // 선택된 앨범 마커 하이라이트
        customOverlaysRef.current.forEach((overlay, index) => {
            const marker = markersRef.current[index]
            if (marker && marker.albumId === selectedAlbumId) {
                const element = overlay.getContent() as HTMLElement | null
                if (element) {
                    // 선택된 마커 하이라이트
                    element.style.transform = 'scale(1.2)'
                    element.style.zIndex = '300'
                    element.style.border = '4px solid #feb4b8'
                }
            }
        })
    }

    // 이벤트 리스너 등록/해제 함수
    const addZoomListener = () => {
        if (mapInstance.current && window.kakao?.maps?.event) {
            // 기존 리스너가 있다면 제거
            removeZoomListener()

            // 새 리스너 등록하고 참조 저장
            zoomHandlerRef.current = handleZoomChange
            window.kakao.maps.event.addListener(mapInstance.current, 'zoom_changed', zoomHandlerRef.current)
        }
    }

    const removeZoomListener = () => {
        if (mapInstance.current && window.kakao?.maps?.event && zoomHandlerRef.current) {
            try {
                window.kakao.maps.event.removeListener(mapInstance.current, 'zoom_changed', zoomHandlerRef.current)
            } catch (error) {
                console.warn('이벤트 리스너 제거 실패:', error)
            } finally {
                zoomHandlerRef.current = null
            }
        }
    }

    // 앨범 데이터 변경 시 마커 생성 (cleanup 순서 조정을 위해 의존성 배열 최적화)
    useEffect(() => {
        if (!isMapReady || !mapInstance.current || !albums) {
            clearMarkers()
            removeZoomListener()
            return
        }

        clearMarkers()
        removeZoomListener()

        // 클러스터러 초기화
        clustererRef.current = new window.kakao.maps.MarkerClusterer({
            map: mapInstance.current,
            ...CLUSTER_CONFIG,
        })

        // 위치 정보가 있는 앨범들만 필터링
        const albumsWithLocation = Object.entries(albums).filter(
            ([albumId, albumData]) => albumData.latitude && albumData.longitude
        )

        if (albumsWithLocation.length === 0) {
            console.log('위치 정보가 있는 앨범이 없습니다')
            return
        }

        const { selectItem } = useMainPageStore.getState()

        // 각 앨범에 대해 마커와 커스텀 오버레이 생성
        const createMarkersAsync = async () => {
            const markerPromises = albumsWithLocation.map(async ([albumId, albumData]) => {
                const position = new window.kakao.maps.LatLng(albumData.latitude, albumData.longitude)
                console.log('!!!!!', albumData)
                // 클러스터링용 마커 생성
                const marker = new window.kakao.maps.Marker({
                    position,
                    clickable: true,
                })

                // 마커에 앨범 ID 저장
                marker.albumId = albumId

                // 마커 클릭 이벤트
                const markerClickHandler = createMarkerClickHandler(albumId, albumData, selectItem, panTo)
                window.kakao.maps.event.addListener(marker, 'click', markerClickHandler)

                // 커스텀 오버레이 생성 (비동기)
                const markerDiv = await createCustomOverlayContent(albumData.thumbnailURL)
                const customOverlay = new window.kakao.maps.CustomOverlay({
                    content: markerDiv,
                    position,
                    yAnchor: 1,
                    clickable: true,
                })

                // 커스텀 오버레이 클릭 이벤트
                const overlayClickHandler = createOverlayClickHandler(albumId, albumData, selectItem, panTo)
                markerDiv.addEventListener('click', overlayClickHandler)

                return { marker, customOverlay }
            })

            try {
                const results = await Promise.all(markerPromises)

                // 결과를 refs에 저장
                results.forEach(({ marker, customOverlay }) => {
                    markersRef.current.push(marker)
                    customOverlaysRef.current.push(customOverlay)
                    clustererRef.current!.addMarker(marker)
                })

                // 줌 레벨 변경 이벤트 리스너 등록 (안전한 방식으로)
                addZoomListener()

                // 초기 표시 상태 설정
                handleZoomChange()

                // 모든 앨범이 보이도록 지도 범위 조정 (선택된 앨범이 없을 때만)
                if (!selectedId) {
                    setBounds(
                        albumsWithLocation.map(([, albumData]) => albumData),
                        3
                    )
                }
            } catch (error) {
                console.error('마커 생성 중 오류 발생:', error)
            }
        }

        createMarkersAsync()

        // cleanup 함수에서 안전한 제거
        return () => {
            removeZoomListener()
        }
    }, [albums, isMapReady]) // selectedId 제거하여 의존성 최적화

    // 선택된 앨범 변경 시 포커스 처리 (별도 useEffect로 분리)
    useEffect(() => {
        if (!isMapReady || !mapInstance.current) return

        if (selectedId) {
            // 앨범 선택 시 포커스
            focusSelectedAlbum(selectedId)
        } else {
            // 선택 해제 시 모든 마커 스타일 초기화
            customOverlaysRef.current.forEach(overlay => {
                const element = overlay.getContent() as HTMLElement | null
                if (element) {
                    element.style.transform = 'scale(1)'
                    element.style.zIndex = '100'
                    element.style.border = '4px solid #F3D0D7'
                    element.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)'
                    element.style.animation = 'none'
                }
            })

            // 전체 앨범이 보이도록 범위 조정
            if (albums) {
                const albumsWithLocation = Object.entries(albums).filter(
                    ([albumId, albumData]) => albumData.latitude && albumData.longitude
                )
                if (albumsWithLocation.length > 0) {
                    setBounds(
                        albumsWithLocation.map(([, albumData]) => albumData),
                        3
                    )
                }
            }
        }
    }, [selectedId, isMapReady, albums]) // 의존성 순서 조정

    // 컴포넌트 언마운트 시 정리 (최우선 순위)
    useEffect(() => {
        return () => {
            removeZoomListener()
            clearMarkers()
        }
    }, []) // 빈 의존성 배열로 마운트/언마운트에만 실행
}
