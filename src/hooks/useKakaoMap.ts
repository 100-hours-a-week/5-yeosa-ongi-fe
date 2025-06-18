import { RefObject, useEffect, useRef, useState } from 'react'

declare global {
    interface Window {
        kakao: {
            maps: {
                LatLng: new (lat: number, lng: number) => KakaoLatLng
                LatLngBounds: new () => KakaoLatLngBounds
                Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap
                load: (callback: () => void) => void
            }
        }
    }
}

interface KakaoLatLng {
    getLat: () => number
    getLng: () => number
}

interface KakaoLatLngBounds {
    extend: (latLng: KakaoLatLng) => void
}

interface KakaoMapOptions {
    center: KakaoLatLng
    level: number
}

interface KakaoMap {
    panTo: (latLng: KakaoLatLng) => void
    setBounds: (bounds: KakaoLatLngBounds) => void
    getLevel: () => number
    setLevel: (level: number) => void
}

interface Location {
    latitude: number
    longitude: number
}

interface UseKakaoMapReturn {
    mapInstance: RefObject<KakaoMap | null>
    isMapReady: boolean
    panTo: (x: number, y: number) => void
    setBounds: (locations: Location[], minLevel?: number) => void
}

export const useKakaoMap = (mapContainer: RefObject<HTMLElement | null>): UseKakaoMapReturn => {
    const [isMapReady, setIsMapReady] = useState<boolean>(false)
    const mapInstance = useRef<KakaoMap | null>(null)
    const initializationRef = useRef<boolean>(false)

    /**
     * 지도 이동 함수
     */
    const panTo = (x: number, y: number) => {
        if (mapInstance.current) {
            const moveLatLon = new window.kakao.maps.LatLng(x, y)
            mapInstance.current.panTo(moveLatLon)
            console.log('지도 이동:', x, y)
        }
    }

    /**
     * 지도 범위 설정 함수
     */
    const setBounds = (locations: Location[], minLevel = 3) => {
        if (!mapInstance.current || !locations.length) return

        const bounds = new window.kakao.maps.LatLngBounds()
        locations.forEach(location => {
            bounds.extend(new window.kakao.maps.LatLng(location.latitude, location.longitude))
        })

        mapInstance.current.setBounds(bounds)

        setTimeout(() => {
            if (mapInstance.current && mapInstance.current.getLevel() < minLevel) {
                mapInstance.current.setLevel(minLevel)
            }
        }, 100)
    }

    // 카카오맵 초기화
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
                    await new Promise<void>((resolve, reject) => {
                        const existingScript = document.querySelector(
                            'script[src*="dapi.kakao.com"]'
                        ) as HTMLScriptElement

                        if (existingScript) {
                            if (window.kakao && window.kakao.maps) {
                                resolve()
                            } else {
                                existingScript.onload = () => resolve()
                                existingScript.onerror = () => reject(new Error('스크립트 로드 실패'))
                            }
                        } else {
                            const script = document.createElement('script')
                            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=f15dee0d63f581e725ea42d340e6dbb5&libraries=clusterer&autoload=false`
                            script.async = true
                            script.onload = () => resolve()
                            script.onerror = () => reject(new Error('스크립트 로드 실패'))
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
                        initializationRef.current = false
                    }
                })
            } catch (error) {
                console.error('지도 초기화 실패:', error)
                initializationRef.current = false
            }
        }

        initializeKakaoMap()

        return () => {
            console.log('KakaoMap cleanup 시작')
            if (mapInstance.current) {
                mapInstance.current = null
            }
            setIsMapReady(false)
        }
    }, [])

    return {
        mapInstance,
        isMapReady,
        panTo,
        setBounds,
    }
}
