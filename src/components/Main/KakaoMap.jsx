import { useEffect, useRef, useState } from 'react'
import { useAlbumStore, useMainPageStore } from '../../stores/mainPageStore'

const KakaoMap = () => {
    const mapContainer = useRef(null)
    const mapInstance = useRef(null)
    const markersRef = useRef([])
    const [isMapReady, setIsMapReady] = useState(false)
    const initializationRef = useRef(false) // 중복 초기화 방지

    // Zustand 스토어에서 상태 가져오기
    const { selectedAlbumSummary, selectedId, getSelectedAlbumSummary } = useMainPageStore()
    const { albums } = useAlbumStore()

    console.log('KakaoMap 렌더링 - selectedId:', selectedId)

    // 지도 이동 함수
    const panTo = (x, y) => {
        if (mapInstance.current) {
            const moveLatLon = new window.kakao.maps.LatLng(x, y)
            mapInstance.current.panTo(moveLatLon)
            console.log('지도 이동:', x, y)
        } else {
            console.log('지도 이동 실패: 맵 인스턴스가 없음')
        }
    }

    // 기존 마커들 제거 함수
    const clearMarkers = () => {
        markersRef.current.forEach(marker => {
            marker.setMap(null)
        })
        markersRef.current = []
    }

    // 선택된 앨범의 사진들을 마커로 표시
    const displayPhotoMarkers = () => {
        console.log('displayPhotoMarkers 실행')

        if (!isMapReady || !mapInstance.current) {
            console.log('지도가 준비되지 않음')
            return
        }
        clearMarkers()
        const albumSummary = getSelectedAlbumSummary()

        if (!albumSummary || !albumSummary.length) {
            console.log('표시할 사진이 없습니다')
            return
        }

        console.log('사진 마커 표시:', albumSummary)

        // 위치 정보가 있는 사진들만 필터링
        const photosWithLocation = albumSummary.filter(photo => photo.latitude && photo.longitude)

        if (photosWithLocation.length === 0) {
            console.log('위치 정보가 있는 사진이 없습니다')
            return
        }

        // 각 사진을 마커로 표시
        photosWithLocation.forEach((photo, index) => {
            const position = new window.kakao.maps.LatLng(photo.latitude, photo.longitude)
            const photoUrl = photo.thumbnailURL || photo.pictureURL

            if (photoUrl) {
                const overlayContent = `
                    <div style="
                        width: 60px;
                        height: 60px;
                        border: 4px solid #F3D0D7;
                        border-radius: 8px;
                        overflow: hidden;
                        background: white;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                        cursor: pointer;
                        position: relative;
                    ">
                        <img src="${photoUrl}" style="
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                            display: block;
                        " onerror="this.style.display='none'" />
                    </div>
                `

                const customOverlay = new window.kakao.maps.CustomOverlay({
                    content: overlayContent,
                    position: position,
                    yAnchor: 1,
                })

                customOverlay.setMap(mapInstance.current)
                markersRef.current.push(customOverlay)
            }
        })

        // 모든 마커가 보이도록 지도 범위 조정
        if (photosWithLocation.length > 0) {
            const bounds = new window.kakao.maps.LatLngBounds()

            photosWithLocation.forEach(photo => {
                bounds.extend(new window.kakao.maps.LatLng(photo.latitude, photo.longitude))
            })

            mapInstance.current.setBounds(bounds)

            // 너무 확대되는 것을 방지
            setTimeout(() => {
                if (mapInstance.current && mapInstance.current.getLevel() < 2) {
                    mapInstance.current.setLevel(2)
                }
            }, 100)
        }
    }

    // 전체 앨범을 마커로 표시하는 함수
    const displayAllAlbumMarkers = () => {
        console.log('전체 앨범 마커 표시 시작')

        if (!isMapReady || !mapInstance.current) {
            console.log('지도가 준비되지 않음')
            return
        }

        // 기존 마커들 제거
        clearMarkers()

        if (!albums || Object.keys(albums).length === 0) {
            console.log('표시할 앨범이 없습니다')
            return
        }

        console.log('전체 앨범 데이터:', albums)

        // 위치 정보가 있는 앨범들만 필터링
        const albumsWithLocation = Object.entries(albums).filter(
            ([albumId, albumData]) => albumData.latitude && albumData.longitude
        )

        if (albumsWithLocation.length === 0) {
            console.log('위치 정보가 있는 앨범이 없습니다')
            return
        }

        console.log('위치 정보가 있는 앨범:', albumsWithLocation)

        // 각 앨범을 마커로 표시
        albumsWithLocation.forEach(([albumId, albumData]) => {
            const position = new window.kakao.maps.LatLng(albumData.latitude, albumData.longitude)
            const thumbnailUrl = albumData.thumbnailURL

            if (thumbnailUrl) {
                const overlayContent = `
                    <div style="
                        width: 60px;
                        height: 60px;
                        border: 4px solid #F3D0D7;
                        border-radius: 8px;
                        overflow: hidden;
                        background: white;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                        cursor: pointer;
                        position: relative;
                    " data-album-id="${albumId}">
                        <img src="${thumbnailUrl}" style="
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                            display: block;
                        " onerror="this.style.display='none'" />
                    </div>
                `

                const customOverlay = new window.kakao.maps.CustomOverlay({
                    content: overlayContent,
                    position: position,
                    yAnchor: 1,
                })

                customOverlay.setMap(mapInstance.current)
                markersRef.current.push(customOverlay)

                // 앨범 마커 클릭 이벤트
                setTimeout(() => {
                    const overlayElement = customOverlay.getContent()
                    if (overlayElement) {
                        overlayElement.addEventListener('click', () => {
                            console.log('앨범 선택됨:', albumId)
                            const { selectItem } = useMainPageStore.getState()
                            selectItem(albumId)
                            panTo(albumData.latitude, albumData.longitude)
                        })
                    }
                }, 100)
            } else {
                // 썸네일이 없는 경우 기본 마커
                const marker = new window.kakao.maps.Marker({
                    position: position,
                    title: albumData.albumName || '앨범',
                })

                marker.setMap(mapInstance.current)
                markersRef.current.push(marker)

                // 기본 마커 클릭 이벤트
                window.kakao.maps.event.addListener(marker, 'click', () => {
                    console.log('앨범 선택됨:', albumId)
                    const { selectItem } = useMainPageStore.getState()
                    selectItem(albumId)
                    panTo(albumData.latitude, albumData.longitude)
                })
            }
        })

        // 모든 앨범이 보이도록 지도 범위 조정
        if (albumsWithLocation.length > 0) {
            const bounds = new window.kakao.maps.LatLngBounds()

            albumsWithLocation.forEach(([albumId, albumData]) => {
                bounds.extend(new window.kakao.maps.LatLng(albumData.latitude, albumData.longitude))
            })

            mapInstance.current.setBounds(bounds)

            // 너무 확대되는 것을 방지
            setTimeout(() => {
                if (mapInstance.current && mapInstance.current.getLevel() < 3) {
                    mapInstance.current.setLevel(3)
                }
            }, 100)
        }
    }

    // 선택된 ID 변경 처리
    const handleSelectedIdChange = () => {
        console.log('handleSelectedIdChange 실행, selectedId:', selectedId)

        if (!isMapReady || !mapInstance.current) {
            console.log('지도가 준비되지 않음')
            return
        }

        if (!selectedId) {
            console.log('선택된 ID 없음, 전체 앨범 마커만 표시')
            displayAllAlbumMarkers()
            return
        }

        // 선택된 앨범의 사진들을 표시
        displayPhotoMarkers()

        // 선택된 앨범 위치로 이동
        const selectedAlbum = albums[selectedId]
        if (selectedAlbum && selectedAlbum.latitude && selectedAlbum.longitude) {
            console.log('선택된 앨범 위치로 이동:', selectedAlbum.latitude, selectedAlbum.longitude)
            panTo(selectedAlbum.latitude, selectedAlbum.longitude)
        }
    }

    // 카카오맵 초기화 (한 번만 실행)
    useEffect(() => {
        if (initializationRef.current) return
        initializationRef.current = true

        console.log('카카오맵 초기화 시작')

        const waitForContainer = () => {
            return new Promise((resolve, reject) => {
                let attempts = 0
                const maxAttempts = 50

                const checkContainer = () => {
                    attempts++
                    console.log(`Container 체크 시도 ${attempts}`)

                    if (mapContainer.current) {
                        console.log('Container 발견!')
                        resolve(mapContainer.current)
                    } else if (attempts >= maxAttempts) {
                        reject(new Error('Container를 찾을 수 없음'))
                    } else {
                        setTimeout(checkContainer, 100)
                    }
                }

                checkContainer()
            })
        }

        const initializeKakaoMap = async () => {
            try {
                await waitForContainer()

                // 카카오 스크립트 로드 확인
                if (!window.kakao || !window.kakao.maps) {
                    console.log('카카오 스크립트 로딩 중...')
                    await new Promise((resolve, reject) => {
                        // 이미 존재하는 스크립트 확인
                        const existingScript = document.querySelector('script[src*="dapi.kakao.com"]')

                        if (existingScript) {
                            if (window.kakao && window.kakao.maps) {
                                resolve()
                            } else {
                                existingScript.onload = resolve
                                existingScript.onerror = reject
                            }
                        } else {
                            const script = document.createElement('script')
                            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=f15dee0d63f581e725ea42d340e6dbb5&autoload=false`
                            script.async = true
                            script.onload = resolve
                            script.onerror = reject
                            document.head.appendChild(script)
                        }
                    })
                }

                // 지도 생성
                window.kakao.maps.load(() => {
                    if (!mapContainer.current) {
                        console.error('Container가 초기화 중에 사라짐')
                        return
                    }

                    try {
                        const options = {
                            center: new window.kakao.maps.LatLng(37.40019, 127.1068),
                            level: 8,
                        }

                        console.log('지도 생성 시작')
                        mapInstance.current = new window.kakao.maps.Map(mapContainer.current, options)
                        console.log('지도 인스턴스 생성 완료')

                        setIsMapReady(true)
                    } catch (error) {
                        console.error('지도 생성 실패:', error)
                        initializationRef.current = false // 재시도 가능하도록
                    }
                })
            } catch (error) {
                console.error('지도 초기화 실패:', error)
                initializationRef.current = false // 재시도 가능하도록
            }
        }

        initializeKakaoMap()

        return () => {
            console.log('KakaoMap cleanup 시작')
            clearMarkers()
            if (mapInstance.current) {
                mapInstance.current = null
            }
            setIsMapReady(false)
        }
    }, []) // 빈 의존성 배열로 한 번만 실행

    // 지도가 준비된 후 전체 앨범 마커 표시
    useEffect(() => {
        if (isMapReady) {
            console.log('지도 준비 완료, 전체 앨범 마커 표시')
            displayAllAlbumMarkers()
        }
    }, [isMapReady, albums])

    // 선택된 ID 변경 감지
    useEffect(() => {
        if (isMapReady) {
            handleSelectedIdChange()
        }
    }, [selectedId, selectedAlbumSummary, isMapReady])

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
                    height: '100%',
                }}
            />
        </div>
    )
}

export default KakaoMap
