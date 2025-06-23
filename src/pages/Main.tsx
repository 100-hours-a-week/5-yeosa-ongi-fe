import { useCallback, useEffect, useRef, useState } from 'react'

// Components
import AlbumListHeader from '@/components/Main/AlbumListHeader'
import BannerSlider from '@/components/Main/BannerSlider'
import KakaoMap from '@/components/Main/KakaoMap'
import ResizableList from '@/components/Main/ResizableList'
import FlottingButton from '../components/common/FlottingButton'
import Header from '../components/common/Header'
import MovingDotsLoader from '../components/common/MovingDotsLoader'
import Month from '../components/Main/Month'
import OnboardingScreen from '../components/Main/OnboardingScreen'

// Stores
import { useAlbumStore, useMainPageStore } from '@/stores/mainPageStore'

// API
import { fetchAlbumData } from '../api/album'

// Hooks
import useInfiniteScroll from '../hooks/infiniteScroll'

type yearMonth = string | null

const CONSTANTS = {
    HEADER_HEIGHT: 56,
    BANNER_HEIGHT: 72,
}

type LoadingState = 'loading' | 'success' | 'error' | 'empty'

const Main = () => {
    const [loadingState, setLoadingState] = useState<LoadingState>('loading')
    const [listHeight, setListHeight] = useState(0)
    //무한 스크롤 관련
    const [nextYearMonth, setNextYearMonth] = useState<yearMonth>(null)
    const lastAttemptedYearMonth = useRef<yearMonth>(null)

    const { clearSelection } = useMainPageStore()
    const { albumsByMonth, setAlbums, addAlbums } = useAlbumStore()

    // 지도의 실제 높이 계산
    const getMapHeight = () => {
        const totalHeight = window.innerHeight - CONSTANTS.HEADER_HEIGHT
        const availableHeight = totalHeight - CONSTANTS.BANNER_HEIGHT
        const mapHeight = availableHeight - listHeight
        return Math.max(0, mapHeight) // 최소 0
    }

    const handleListHeightChange = useCallback((height: number) => {
        setListHeight(height)
    }, [])

    useEffect(() => {
        let isMounted = true

        const loadInitialData = async () => {
            try {
                setLoadingState('loading')
                const result = await fetchAlbumData('')

                if (isMounted && result && result.data) {
                    console.log('초기 데이터 로드:', result)
                    setAlbums(result.data.albumInfo)
                    setNextYearMonth(result.data.nextYearMonth)
                    setHasNext(result.data.hasNext)
                    if (result.data.albumInfo.length > 0) {
                        setLoadingState('success')
                    } else {
                        setLoadingState('empty')
                    }
                }
            } catch (error) {
                console.error('초기 데이터 로딩 오류:', error)
                if (isMounted) {
                    setLoadingState('error')
                }
            }
        }
        loadInitialData()

        return () => {
            isMounted = false
        }
    }, [setAlbums])

    const fetchMoreAlbums = useCallback(async () => {
        console.log('무한 스크롤 로직 시작 = == = = = ==')

        // 초기 로드에 실패했거나 nextYearMonth가 없으면 더 로드하지 않음
        // console.log(initialLoadFailed, nextYearMonth, initialLoadFailed || !nextYearMonth)
        if (loadingState === 'error' || !nextYearMonth) return false

        console.log('last', lastAttemptedYearMonth)
        // 이미 시도했던 yearMonth와 동일하면 재시도하지 않음
        if (lastAttemptedYearMonth.current === nextYearMonth) {
            return false
        }

        lastAttemptedYearMonth.current = nextYearMonth

        // 현재 시도하는 yearMonth 저장

        try {
            console.log('api 요청 시도 !!! ')
            const response = await fetchAlbumData(nextYearMonth)

            // 응답 유효성 검사
            if (!response || !response.data) {
                console.error('Invalid response from fetchAlbumData')
                return false
            }

            console.log('추가 데이터 로드:', response)
            addAlbums(response.data.albumInfo)
            // 새로운 nextYearMonth 값이 있으면 업데이트
            if (response.data.nextYearMonth && response.data.nextYearMonth !== nextYearMonth) {
                setNextYearMonth(response.data.nextYearMonth)
                lastAttemptedYearMonth.current = null // 새 yearMonth가 설정되었으므로 리셋
            } else {
                // 같은 nextYearMonth가 반환되면 더 이상 데이터가 없는 것으로 처리
                return false
            }

            // 더 로드할 데이터가 있는지 반환
            const hasNextData = response.data.hasNext === 'true' || response.data.hasNext === true
            console.log('hasNext 체크:', hasNextData, response.data.hasNext)
            return response.data.hasNext === 'true'
        } catch (error) {
            console.error('추가 앨범 로딩 오류:', error)
            return false // 오류 발생 시 더 이상 로드하지 않음
        }
    }, [nextYearMonth, addAlbums, loadingState])
    const { observerRef, isLoading, hasNext, setHasNext } = useInfiniteScroll(fetchMoreAlbums, true)

    if (loadingState === 'loading') {
        return (
            <>
                <Header />
                <MovingDotsLoader />
            </>
        )
    }

    return (
        <div className='relative h-screen overflow-hidden'>
            <Header />

            <div className='flex-col content'>
                {/* 배너와 지도를 포함한 전체 컨테이너 */}
                <div className='relative' style={{ height: 'calc(100vh - 56px)' }}>
                    {/* 배너 */}
                    <BannerSlider />

                    {hasNext ? (
                        <>
                            {/* 지도를 배경에 깔기 */}
                            <div className='absolute inset-0 top-[72px] border-t border-solid'>
                                <KakaoMap height={getMapHeight()} />
                            </div>
                            {/* ResizableList - absolute로 하단에서 올라오도록 */}
                            <ResizableList
                                showHeightIndicator={false}
                                className=''
                                onHeightChange={handleListHeightChange}
                            >
                                {/* AlbumListHeader를 ResizableList 밖으로 이동하고 고정 */}
                                <div className='z-20 bg-white border-b'>
                                    <AlbumListHeader />
                                </div>

                                {/* 스크롤 가능한 컨텐츠 영역 */}
                                <div className='flex-1 overflow-y-auto'>
                                    {Object.keys(albumsByMonth).map((month, index) => (
                                        <Month
                                            key={month}
                                            title={month}
                                            albumIds={albumsByMonth[month]}
                                            handleOutsideClick={clearSelection}
                                        />
                                    ))}
                                    {/* Intersection Observer 관찰 대상 (페이지 하단에 위치) */}
                                    <div ref={observerRef} style={{ height: '10px' }} />
                                </div>
                            </ResizableList>
                        </>
                    ) : (
                        <OnboardingScreen />
                    )}
                </div>
            </div>

            <FlottingButton />
        </div>
    )
}

export default Main
