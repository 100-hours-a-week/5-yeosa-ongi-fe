import { useEffect, useRef } from 'react'
import { useAlbumStore, useMainPageStore } from '../../stores/mainPageStore'

const KakaoMap = () => {
    const mapContainer = useRef(null)
    const mapInstance = useRef(null) // 지도 인스턴스를 저장할 ref

    // useSelectionStore 대신 useMainPageStore 사용
    const { selectedAlbumSummary, selectedId, getSelectedId, getSelectedAlbumSummary } = useMainPageStore()
    const { albums, albumsByMonth } = useAlbumStore()

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
    const markersRef = useRef([])
    const displayPhotoMarkers = () => {
        console.log('displayPhotoMarkers 실행')

        if (!mapInstance.current) {
            console.log('맵 인스턴스 없음')
            return
        }

        // 기존 마커들 제거
        markersRef.current.forEach(marker => {
            marker.setMap(null)
        })
        markersRef.current = []

        const albumSummary = getSelectedAlbumSummary()

        if (!albumSummary || !albumSummary.length) {
            console.log('표시할 사진이 없습니다')
            return
        }

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
                // CustomOverlay를 사용해서 HTML/CSS로 프레임 구현
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
                    " />
                </div>
            `

                const customOverlay = new window.kakao.maps.CustomOverlay({
                    content: overlayContent,
                    position: position,
                    yAnchor: 1,
                })

                customOverlay.setMap(mapInstance.current)
                markersRef.current.push(customOverlay) // CustomOverlay도 같은 방식으로 제거 가능
            }
        })

        // 모든 마커가 보이도록 지도 범위 조정
        if (photosWithLocation.length > 0) {
            const bounds = new window.kakao.maps.LatLngBounds()

            photosWithLocation.forEach(photo => {
                bounds.extend(new window.kakao.maps.LatLng(photo.latitude, photo.longitude))
            })

            mapInstance.current.setBounds(bounds)
        }
    }

    // 지도 범위 조정 함수 분리
    const adjustMapBounds = photosWithLocation => {
        if (photosWithLocation.length > 0) {
            const bounds = new window.kakao.maps.LatLngBounds()

            photosWithLocation.forEach(photo => {
                bounds.extend(new window.kakao.maps.LatLng(photo.latitude, photo.longitude))
            })

            mapInstance.current.setBounds(bounds)

            // 너무 확대되는 것을 방지
            setTimeout(() => {
                if (mapInstance.current.getLevel() < 2) {
                    mapInstance.current.setLevel(2)
                }
            }, 100)
        }
    }

    // 기존 handleSelectedIdChange 함수 수정
    const handleSelectedIdChange = () => {
        console.log('handleSelectedIdChange 실행, selectedId:', selectedId)

        if (!selectedId) {
            console.log('선택된 ID 없음')
            // 마커들도 제거
            markersRef.current.forEach(marker => {
                marker.setMap(null)
            })
            markersRef.current = []
            return
        }

        if (!mapInstance.current) {
            console.log('맵 인스턴스 없음')
            return
        }

        // 사진 마커들 표시
        displayPhotoMarkers()

        // 기존 로직 유지 (앨범 위치로 이동)
        const selectedAlbum = albums[selectedId]
        console.log('선택된 앨범:', getSelectedAlbumSummary())

        if (selectedAlbum && selectedAlbum.latitude && selectedAlbum.longitude) {
            console.log('앨범 위치로 이동:', selectedAlbum.latitude, selectedAlbum.longitude)
            panTo(selectedAlbum.latitude, selectedAlbum.longitude)
        } else {
            console.log('앨범의 위치 정보가 없음')
            // displayPhotoMarkers에서 이미 setBounds로 적절한 위치로 조정됨
        }
    }

    // 선택된 ID가 변경될 때 지도 이동
    useEffect(() => {
        console.log('selectedId useEffect 실행:', selectedId)

        if (selectedId) {
            handleSelectedIdChange()
        }
    }, [selectedId, selectedAlbumSummary])

    //초기화
    useEffect(() => {
        console.log('카카오맵 초기화 시작')

        const loadKakaoMap = () => {
            window.kakao.maps.load(() => {
                console.log('카카오맵 API 로드됨')

                // mapContainer가 존재하는지 확인
                if (!mapContainer.current) {
                    console.error('Map container가 존재하지 않습니다')
                    return
                }

                const options = {
                    center: new window.kakao.maps.LatLng(33.450701, 126.570667),
                    level: 3,
                }

                // 지도 인스턴스 생성 및 저장
                mapInstance.current = new window.kakao.maps.Map(mapContainer.current, options)
                console.log('지도 인스턴스 생성 완료')

                // 맵 로드 후 선택된 ID가 있으면 해당 위치로 이동
                if (selectedId) {
                    console.log('초기화 후 선택된 ID 처리:', selectedId)
                    handleSelectedIdChange()
                }
            })
        }

        // mapContainer.current가 존재할 때만 실행
        if (!mapContainer.current) {
            console.log('Map container가 아직 준비되지 않음')
            return
        }

        // 카카오 맵 스크립트가 이미 로드되었는지 확인
        if (window.kakao && window.kakao.maps) {
            loadKakaoMap()
        } else {
            console.log('카카오맵 스크립트 로드 중...')
            const script = document.createElement('script')
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=f15dee0d63f581e725ea42d340e6dbb5&autoload=false`
            script.async = true
            script.onload = () => {
                console.log('카카오맵 스크립트 로드 완료')
                loadKakaoMap()
            }
            document.head.appendChild(script)
        }
    }, [])

    return (
        <div className='h-full'>
            <div className='size-fit' ref={mapContainer} style={{ width: '100%', height: '100%' }}></div>
        </div>
    )
}

export default KakaoMap
