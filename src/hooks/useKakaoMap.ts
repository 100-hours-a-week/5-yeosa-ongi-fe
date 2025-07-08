<<<<<<< HEAD
import { RefObject, useCallback, useEffect, useRef, useState } from 'react'

// 타입 정의는 동일...
=======
import { RefObject, useEffect, useRef, useState } from 'react'

>>>>>>> main
declare global {
    interface Window {
        kakao: {
            maps: {
                LatLng: new (lat: number, lng: number) => KakaoLatLng
                LatLngBounds: new () => KakaoLatLngBounds
                Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap
                load: (callback: () => void) => void
<<<<<<< HEAD
                event: {
                    addListener: (target: any, type: string, handler: () => void) => void
                }
                MapTypeId: {
                    ROADMAP: string
                }
                ProjectionId: {
                    WCONG: string
                }
=======
>>>>>>> main
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
<<<<<<< HEAD
    mapTypeId?: string
    draggable?: boolean
    scrollwheel?: boolean
    disableDoubleClick?: boolean
    disableDoubleClickZoom?: boolean
    projectionId?: string
=======
>>>>>>> main
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
<<<<<<< HEAD
    isScriptLoaded: boolean
    loadingStage: 'idle' | 'script' | 'container' | 'map' | 'tiles' | 'ready'
=======
>>>>>>> main
    panTo: (x: number, y: number) => void
    setBounds: (locations: Location[], minLevel?: number) => void
}

<<<<<<< HEAD
// 스크립트 로딩 상태를 전역으로 관리
let scriptLoadPromise: Promise<void> | null = null
let isScriptLoaded = false

const loadKakaoScript = (): Promise<void> => {
    // 이미 로드된 경우
    if (window.kakao?.maps && isScriptLoaded) {
        return Promise.resolve()
    }

    // 이미 로딩 중인 경우 기존 Promise 반환
    if (scriptLoadPromise) {
        return scriptLoadPromise
    }

    scriptLoadPromise = new Promise<void>((resolve, reject) => {
        // 기존 스크립트 태그 확인 (preload로 이미 캐시됨)
        const existingScript = document.querySelector('script[src*="dapi.kakao.com"]') as HTMLScriptElement

        if (existingScript) {
            // 이미 로드된 스크립트가 있으면 로드 대기
            if (window.kakao?.maps) {
                isScriptLoaded = true
                resolve()
                return
            }

            existingScript.addEventListener('load', () => {
                isScriptLoaded = true
                resolve()
            })
            existingScript.addEventListener('error', reject)
            return
        }

        // preload로 캐시된 스크립트 사용
        const script = document.createElement('script')
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=f15dee0d63f581e725ea42d340e6dbb5&libraries=clusterer&autoload=false`
        script.async = true

        script.onload = () => {
            isScriptLoaded = true
            console.log('✅ 카카오맵 스크립트 로드 완료 (preload 캐시 활용)')
            resolve()
        }

        script.onerror = error => {
            scriptLoadPromise = null
            console.error('❌ 카카오맵 스크립트 로드 실패:', error)
            reject(new Error('Script load failed'))
        }

        document.head.appendChild(script)
    })

    return scriptLoadPromise
}

export const useKakaoMap = (mapContainer: RefObject<HTMLElement | null>): UseKakaoMapReturn => {
    const [isMapReady, setIsMapReady] = useState<boolean>(false)
    const [loadingStage, setLoadingStage] = useState<'idle' | 'script' | 'container' | 'map' | 'tiles' | 'ready'>(
        'idle'
    )
    const [scriptLoaded, setScriptLoaded] = useState<boolean>(isScriptLoaded)

    const mapInstance = useRef<KakaoMap | null>(null)
    const initializationRef = useRef<boolean>(false)

    // 지도 이동 함수
    const panTo = useCallback((x: number, y: number) => {
        if (mapInstance.current) {
            const moveLatLon = new window.kakao.maps.LatLng(x, y)
            mapInstance.current.panTo(moveLatLon)
        }
    }, [])

    // 지도 범위 설정 함수
    const setBounds = useCallback((locations: Location[], minLevel = 3) => {
=======
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
>>>>>>> main
        if (!mapInstance.current || !locations.length) return

        const bounds = new window.kakao.maps.LatLngBounds()
        locations.forEach(location => {
            bounds.extend(new window.kakao.maps.LatLng(location.latitude, location.longitude))
        })

        mapInstance.current.setBounds(bounds)

<<<<<<< HEAD
        // 최소 레벨 보장
        requestAnimationFrame(() => {
            if (mapInstance.current && mapInstance.current.getLevel() < minLevel) {
                mapInstance.current.setLevel(minLevel)
            }
        })
    }, [])

    // 컨테이너 대기 함수
    const waitForContainer = useCallback((): Promise<HTMLElement> => {
        return new Promise((resolve, reject) => {
            if (mapContainer.current) {
                resolve(mapContainer.current)
                return
            }

            let attempts = 0
            const maxAttempts = 50

            const checkContainer = () => {
                attempts++

                if (mapContainer.current) {
                    resolve(mapContainer.current)
                } else if (attempts >= maxAttempts) {
                    reject(new Error(`Container not found after ${maxAttempts} attempts`))
                } else {
                    setTimeout(checkContainer, 100)
                }
            }

            checkContainer()
        })
    }, [mapContainer])

    // 지도 초기화 함수
    const initializeMap = useCallback(async () => {
        if (initializationRef.current) return

        initializationRef.current = true
        const startTime = performance.now()

        try {
            // 1. 스크립트 로딩 (preload 캐시 활용)
            setLoadingStage('script')
            await loadKakaoScript()
            setScriptLoaded(true)

            // 2. 컨테이너 대기
            setLoadingStage('container')
            const container = await waitForContainer()

            // 3. 지도 생성
            setLoadingStage('map')
            await new Promise<void>((resolve, reject) => {
                window.kakao.maps.load(() => {
                    try {
                        const options: KakaoMapOptions = {
                            center: new window.kakao.maps.LatLng(37.40019, 127.1068),
                            level: 8,
                            mapTypeId: window.kakao.maps.MapTypeId?.ROADMAP,
                            projectionId: window.kakao.maps.ProjectionId?.WCONG,
                            draggable: true,
                            scrollwheel: true,
                            disableDoubleClick: false,
                            disableDoubleClickZoom: false,
                        }

                        const map = new window.kakao.maps.Map(container, options)
                        mapInstance.current = map

                        // 4. 타일 로딩 대기
                        setLoadingStage('tiles')

                        if (window.kakao.maps.event?.addListener) {
                            window.kakao.maps.event.addListener(map, 'tilesloaded', () => {
                                const totalTime = performance.now() - startTime
                                console.log(`🗺️ 지도 로딩 완료! 총 소요시간: ${totalTime.toFixed(2)}ms`)

                                setLoadingStage('ready')
                                setIsMapReady(true)
                            })
                        } else {
                            setTimeout(() => {
                                setLoadingStage('ready')
                                setIsMapReady(true)
                            }, 1000)
                        }

                        resolve()
                    } catch (error) {
                        reject(error)
                    }
                })
            })
        } catch (error) {
            console.error('지도 초기화 실패:', error)
            initializationRef.current = false
            setLoadingStage('idle')
        }
    }, [waitForContainer])

    // 지도 초기화 실행
    useEffect(() => {
        initializeMap()

        return () => {
=======
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
>>>>>>> main
            if (mapInstance.current) {
                mapInstance.current = null
            }
            setIsMapReady(false)
<<<<<<< HEAD
            setLoadingStage('idle')
            initializationRef.current = false
        }
    }, [initializeMap])
=======
        }
    }, [])
>>>>>>> main

    return {
        mapInstance,
        isMapReady,
<<<<<<< HEAD
        isScriptLoaded: scriptLoaded,
        loadingStage,
=======
>>>>>>> main
        panTo,
        setBounds,
    }
}
