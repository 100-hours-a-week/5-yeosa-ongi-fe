import { useCallback, useEffect, useRef, useState } from 'react'

// Components
import AlbumListHeader from '@/components/Main/AlbumListHeader'
import BannerSlider from '@/components/Main/BannerSlider'
import KakaoMap from '@/components/Main/KakaoMap'
import FlottingButton from '../components/common/FlottingButton'
import Header from '../components/common/Header'
import MovingDotsLoader from '../components/common/MovingDotsLoader'
import OnboardingScreen from '../components/Main/OnboardingScreen'

// Stores
import { useAlbumStore, useMainPageStore } from '@/stores/mainPageStore'

// API
import { fetchAlbumData } from '../api/album'

// Components
import InfiniteScrollList from '@/components/common/InfiniteScrollList'
import ResizableContainer from '@/components/common/ResizableContainer'
import Month from '@/components/Main/Month'

type yearMonth = string | null

const CONSTANTS = {
    HEADER_HEIGHT: 56,
    BANNER_HEIGHT: 72,
}

type LoadingState = 'loading' | 'success' | 'error' | 'empty'

const Main = () => {
    const [loadingState, setLoadingState] = useState<LoadingState>('loading')
    const [listHeight, setListHeight] = useState(0)

    // 무한 스크롤 관련 상태
    const [nextYearMonth, setNextYearMonth] = useState<yearMonth>(null)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasMoreData, setHasMoreData] = useState(true)
    const lastAttemptedYearMonth = useRef<yearMonth>(null)

    const { clearSelection } = useMainPageStore()
    const { albumsByMonth, setAlbums, addAlbums } = useAlbumStore()

    // 지도의 실제 높이 계산
    const getMapHeight = () => {
        const totalHeight = window.innerHeight - CONSTANTS.HEADER_HEIGHT
        const availableHeight = totalHeight - CONSTANTS.BANNER_HEIGHT
        const mapHeight = availableHeight - listHeight
        return Math.max(0, mapHeight)
    }

    const handleListHeightChange = useCallback((height: number) => {
        setListHeight(height)
    }, [])

    // 초기 데이터 로드
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
                    setHasMoreData(result.data.hasNext === 'true' || result.data.hasNext === true)

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

    // InfiniteScrollList에서 사용할 loadMore 함수
    const fetchMoreAlbums = useCallback(async () => {
        console.log('무한 스크롤 로직 시작')

        // 초기 로드에 실패했거나 nextYearMonth가 없으면 더 로드하지 않음
        if (loadingState === 'error' || !nextYearMonth || !hasMoreData) {
            return []
        }

        // 이미 시도했던 yearMonth와 동일하면 재시도하지 않음
        if (lastAttemptedYearMonth.current === nextYearMonth) {
            return []
        }

        setIsLoadingMore(true)
        lastAttemptedYearMonth.current = nextYearMonth

        try {
            console.log('API 요청 시도:', nextYearMonth)
            const response = await fetchAlbumData(nextYearMonth)

            // 응답 유효성 검사
            if (!response || !response.data) {
                console.error('Invalid response from fetchAlbumData')
                setHasMoreData(false)
                return []
            }

            console.log('추가 데이터 로드:', response)

            // 새 앨범 데이터를 스토어에 추가
            addAlbums(response.data.albumInfo)

            // 새로운 nextYearMonth 값이 있으면 업데이트
            if (response.data.nextYearMonth && response.data.nextYearMonth !== nextYearMonth) {
                setNextYearMonth(response.data.nextYearMonth)
                lastAttemptedYearMonth.current = null // 새 yearMonth가 설정되었으므로 리셋
            } else {
                // 같은 nextYearMonth가 반환되면 더 이상 데이터가 없는 것으로 처리
                setHasMoreData(false)
            }

            // hasNext 상태 업데이트
            const hasNext = response.data.hasNext === 'true' || response.data.hasNext === true
            setHasMoreData(hasNext)
            console.log('hasNext 체크:', hasNext, response.data.hasNext)

            // InfiniteScrollList는 새로운 month 키들을 반환받아야 함
            // 하지만 실제로는 스토어에서 albumsByMonth가 업데이트되므로 빈 배열 반환
            return []
        } catch (error) {
            console.error('추가 앨범 로딩 오류:', error)
            setHasMoreData(false)
            return []
        } finally {
            setIsLoadingMore(false)
        }
    }, [nextYearMonth, addAlbums, loadingState, hasMoreData])

    // albumsByMonth를 month 키 배열로 변환
    const monthKeys = Object.keys(albumsByMonth)

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

                    {loadingState !== 'empty' || hasMoreData ? (
                        <>
                            {/* 지도를 배경에 깔기 */}
                            <div className='absolute inset-0 top-[72px] border-t border-solid'>
                                <KakaoMap height={getMapHeight()} />
                            </div>

                            <ResizableContainer className='' onHeightChange={handleListHeightChange}>
                                <div className='z-20 bg-white border-b'>
                                    <AlbumListHeader />
                                </div>

                                <InfiniteScrollList<string>
                                    items={monthKeys}
                                    renderItem={(month, index, isLast) => (
                                        <Month
                                            key={month}
                                            title={month}
                                            albumIds={albumsByMonth[month]}
                                            handleOutsideClick={clearSelection}
                                        />
                                    )}
                                    loadMore={fetchMoreAlbums}
                                    hasMore={hasMoreData}
                                    loading={isLoadingMore}
                                    threshold={0.1}
                                    rootMargin='100px'
                                    className='flex-1'
                                    containerClassName=''
                                />
                            </ResizableContainer>
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
