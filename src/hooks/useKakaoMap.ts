import { RefObject, useCallback, useEffect, useRef, useState } from 'react'

declare global {
    interface Window {
        kakao: {
            maps: {
                LatLng: new (lat: number, lng: number) => KakaoLatLng
                LatLngBounds: new () => KakaoLatLngBounds
                Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap
                load: (callback: () => void) => void
                event: {
                    addListener: (target: any, type: string, handler: () => void) => void
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
    mapTypeId?: string
    draggable?: boolean
    scrollwheel?: boolean
    disableDoubleClick?: boolean
    disableDoubleClickZoom?: boolean
    projectionId?: string
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
    isScriptLoaded: boolean
    loadingStage: 'idle' | 'script' | 'container' | 'map' | 'tiles' | 'ready'
    panTo: (x: number, y: number) => void
    setBounds: (locations: Location[], minLevel?: number) => void
}

// 성능 측정 유틸리티
const createPerformanceTracker = () => {
    const startTime = performance.now()

    return {
        mark: (stage: string) => {
            const elapsed = performance.now() - startTime
            console.log(`[Map Performance] ${stage}: ${elapsed.toFixed(2)}ms`)
            return elapsed
        },
    }
}

// 스크립트 로딩 상태를 전역으로 관리 (중복 로딩 방지)
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
        // 기존 스크립트 태그 확인
        const existingScript = document.querySelector('script[src*="dapi.kakao.com"]') as HTMLScriptElement

        if (existingScript) {
            if (window.kakao?.maps) {
                isScriptLoaded = true
                resolve()
                return
            }

            existingScript.addEventListener('load', () => {
                isScriptLoaded = true
                resolve()
            })
            existingScript.addEventListener('error', () => {
                scriptLoadPromise = null
                reject(new Error('Existing script load failed'))
            })
            return
        }

        // 새 스크립트 생성
        const script = document.createElement('script')
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=f15dee0d63f581e725ea42d340e6dbb5&libraries=clusterer&autoload=false`
        script.async = true

        script.onload = () => {
            isScriptLoaded = true
            console.log('카카오맵 스크립트 로드 완료')
            resolve()
        }

        script.onerror = () => {
            scriptLoadPromise = null
            console.error('카카오맵 스크립트 로드 실패')
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
    const performanceTracker = useRef(createPerformanceTracker())

    /**
     * 지도 이동 함수 (메모이제이션)
     */
    const panTo = useCallback((x: number, y: number) => {
        if (mapInstance.current) {
            const moveLatLon = new window.kakao.maps.LatLng(x, y)
            mapInstance.current.panTo(moveLatLon)
            console.log('지도 이동:', x, y)
        }
    }, [])

    /**
     * 지도 범위 설정 함수 (메모이제이션)
     */
    const setBounds = useCallback((locations: Location[], minLevel = 3) => {
        if (!mapInstance.current || !locations.length) return

        const bounds = new window.kakao.maps.LatLngBounds()
        locations.forEach(location => {
            bounds.extend(new window.kakao.maps.LatLng(location.latitude, location.longitude))
        })

        mapInstance.current.setBounds(bounds)

        // 최소 레벨 보장
        requestAnimationFrame(() => {
            if (mapInstance.current && mapInstance.current.getLevel() < minLevel) {
                mapInstance.current.setLevel(minLevel)
            }
        })
    }, [])

    /**
     * 컨테이너 대기 함수 (개선)
     */
    const waitForContainer = useCallback((): Promise<HTMLElement> => {
        return new Promise((resolve, reject) => {
            // 즉시 체크
            if (mapContainer.current) {
                console.log('Container 즉시 발견!')
                resolve(mapContainer.current)
                return
            }

            let attempts = 0
            const maxAttempts = 50 // 5초로 복원
            let timeoutId: NodeJS.Timeout

            const checkContainer = () => {
                attempts++
                console.log(`Container 체크 시도 ${attempts}/${maxAttempts}`)

                if (mapContainer.current) {
                    console.log(`Container 발견! (${attempts}번째 시도)`)
                    clearTimeout(timeoutId)
                    resolve(mapContainer.current)
                } else if (attempts >= maxAttempts) {
                    console.error('Container timeout - mapContainer.current:', mapContainer.current)
                    clearTimeout(timeoutId)
                    reject(new Error(`Container not found after ${maxAttempts} attempts`))
                } else {
                    timeoutId = setTimeout(checkContainer, 100)
                }
            }

            // MutationObserver로 DOM 변화 감지 (추가 안전장치)
            if (typeof MutationObserver !== 'undefined') {
                const observer = new MutationObserver(() => {
                    if (mapContainer.current) {
                        console.log('MutationObserver로 Container 감지!')
                        observer.disconnect()
                        clearTimeout(timeoutId)
                        resolve(mapContainer.current)
                    }
                })

                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                })

                // 정리 함수
                setTimeout(() => {
                    observer.disconnect()
                }, 5000)
            }

            checkContainer()
        })
    }, [mapContainer])

    /**
     * 지도 초기화 함수 (개선)
     */
    const initializeMap = useCallback(async () => {
        if (initializationRef.current) {
            console.log('이미 초기화 진행 중...')
            return
        }

        initializationRef.current = true
        console.log('지도 초기화 시작')

        try {
            performanceTracker.current.mark('초기화 시작')

            // 1. 스크립트 로딩
            setLoadingStage('script')
            await loadKakaoScript()
            setScriptLoaded(true)
            performanceTracker.current.mark('스크립트 로드 완료')

            // 2. 컨테이너 대기
            setLoadingStage('container')
            const container = await waitForContainer()
            performanceTracker.current.mark('컨테이너 준비 완료')

            // 3. 지도 생성
            setLoadingStage('map')

            await new Promise<void>((resolve, reject) => {
                window.kakao.maps.load(() => {
                    try {
                        // 카카오맵 객체가 완전히 로드되었는지 확인
                        if (!window.kakao?.maps?.Map) {
                            throw new Error('Kakao Maps API not fully loaded')
                        }

                        // 기본 옵션 (안전한 설정)
                        const options: KakaoMapOptions = {
                            center: new window.kakao.maps.LatLng(37.40019, 127.1068),
                            level: 8,
                        }

                        // 선택적 속성들은 존재할 때만 추가
                        if (window.kakao.maps.MapTypeId?.ROADMAP) {
                            options.mapTypeId = window.kakao.maps.MapTypeId.ROADMAP
                        }

                        if (window.kakao.maps.ProjectionId?.WCONG) {
                            options.projectionId = window.kakao.maps.ProjectionId.WCONG
                        }

                        // 기본적인 상호작용 설정
                        options.draggable = true
                        options.scrollwheel = true
                        options.disableDoubleClick = false
                        options.disableDoubleClickZoom = false

                        console.log('지도 인스턴스 생성 시작', options)
                        const map = new window.kakao.maps.Map(container, options)
                        mapInstance.current = map

                        performanceTracker.current.mark('지도 인스턴스 생성 완료')

                        // 4. 타일 로딩 대기
                        setLoadingStage('tiles')

                        // 타일 로드 완료 이벤트 (안전한 체크)
                        if (window.kakao.maps.event?.addListener) {
                            window.kakao.maps.event.addListener(map, 'tilesloaded', () => {
                                performanceTracker.current.mark('타일 로딩 완료')
                                setLoadingStage('ready')
                                setIsMapReady(true)

                                // 전체 로딩 시간 측정
                                const totalTime = performanceTracker.current.mark('전체 완료')

                                // LCP 개선을 위한 성능 로그
                                console.log(`🗺️ 지도 로딩 완료! 총 소요시간: ${totalTime.toFixed(2)}ms`)
                            })
                        } else {
                            // 이벤트 리스너를 사용할 수 없는 경우 타이머로 대체
                            setTimeout(() => {
                                setLoadingStage('ready')
                                setIsMapReady(true)
                                console.log('🗺️ 지도 로딩 완료 (타이머 기반)')
                            }, 1000)
                        }

                        resolve()
                    } catch (error) {
                        console.error('지도 생성 실패:', error)
                        reject(error)
                    }
                })
            })
        } catch (error) {
            console.error('지도 초기화 실패:', error)
            initializationRef.current = false
            setLoadingStage('idle')

            // 재시도 로직 제한 (최대 3번)
            const retryCount = (window as any).__mapRetryCount || 0
            if (retryCount < 3) {
                ;(window as any).__mapRetryCount = retryCount + 1
                console.log(`지도 초기화 재시도... (${retryCount + 1}/3)`)

                setTimeout(() => {
                    if (!isMapReady && retryCount < 3) {
                        initializeMap()
                    }
                }, 2000)
            } else {
                console.error('지도 초기화 최대 재시도 횟수 초과')
                setLoadingStage('idle')
            }
        }
    }, [waitForContainer, isMapReady])

    // 지도 초기화 실행
    useEffect(() => {
        initializeMap()

        return () => {
            console.log('useKakaoMap cleanup')
            if (mapInstance.current) {
                mapInstance.current = null
            }
            setIsMapReady(false)
            setLoadingStage('idle')
            initializationRef.current = false
        }
    }, [initializeMap])

    return {
        mapInstance,
        isMapReady,
        isScriptLoaded: scriptLoaded,
        loadingStage,
        panTo,
        setBounds,
    }
}
