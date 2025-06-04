import { useCallback, useEffect, useRef, useState } from 'react'

// Components
import AlbumListHeader from '@/components/Main/AlbumListHeader'
import FlottingButton from '../components/common/FlottingButton'
import Header from '../components/common/Header'
import Month from '../components/Main/Month'
import OnboardingScreen from '../components/Main/OnboardingScreen'

// Stores
import { useAlbumStore } from '@/stores/mainPageStore'
// API
import { fetchAlbumData } from '../api/album'
// Hooks
import MovingDotsLoader from '../components/common/MovingDotsLoader'
import useInfiniteScroll from '../hooks/infiniteScroll'

const Main = () => {
    const { albumsByMonth, setAlbums, addAlbums } = useAlbumStore()

    // 로딩
    // 초기 로딩 관련
    const [isInitialLoading, setIsInitialLoading] = useState(false)
    const [initialLoadFailed, setInitialLoadFailed] = useState(false)
    const [hasData, setHasData] = useState(false)

    //무한 스크롤 관련
    const [nextYearMonth, setNextYearMonth] = useState(null)
    const scrollContainerRef = useRef(null) // 스크롤 컨테이너
    const [page, setPage] = useState(1) // 현재 페이지 번호
    const lastAttemptedYearMonth = useRef(null)

    const fetchMoreAlbums = useCallback(async () => {
        console.log('무한 스크롤 로직 시작 = == = = = ==')

        // 초기 로드에 실패했거나 nextYearMonth가 없으면 더 로드하지 않음
        console.log(
            initialLoadFailed,
            nextYearMonth,
            initialLoadFailed || !nextYearMonth
        )
        if (initialLoadFailed || !nextYearMonth) return false

        console.log('last', lastAttemptedYearMonth)
        // 이미 시도했던 yearMonth와 동일하면 재시도하지 않음
        if (lastAttemptedYearMonth.current === nextYearMonth) {
            return false
        }

        // 현재 시도하는 yearMonth 저장
        lastAttemptedYearMonth.current = nextYearMonth

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
            setHasData(true)
            // 새로운 nextYearMonth 값이 있으면 업데이트
            if (
                response.data.nextYearMonth &&
                response.data.nextYearMonth !== nextYearMonth
            ) {
                setNextYearMonth(response.data.nextYearMonth)
                lastAttemptedYearMonth.current = null // 새 yearMonth가 설정되었으므로 리셋
            } else {
                // 같은 nextYearMonth가 반환되면 더 이상 데이터가 없는 것으로 처리
                return false
            }

            setPage(prevPage => prevPage + 1)

            // 더 로드할 데이터가 있는지 반환
            const hasNextData =
                response.data.hasNext === 'true' ||
                response.data.hasNext === true
            console.log('hasNext 체크:', hasNextData, response.data.hasNext)
            return response.data.hasNext === 'true'
        } catch (error) {
            console.error('추가 앨범 로딩 오류:', error)
            return false // 오류 발생 시 더 이상 로드하지 않음
        }
    }, [nextYearMonth, addAlbums, initialLoadFailed])

    const { observerRef, isLoading, hasNext, setHasNext } = useInfiniteScroll(
        fetchMoreAlbums,
        true
    )

    useEffect(() => {
        let isMounted = true

        const loadInitialData = async () => {
            try {
                setIsInitialLoading(true)
                setInitialLoadFailed(false)
                const result = await fetchAlbumData()

                if (isMounted && result && result.data) {
                    console.log('초기 데이터 로드:', result)
                    setAlbums(result.data.albumInfo)
                    setNextYearMonth(result.data.nextYearMonth)
                    setHasNext(result.data.hasNext)
                    if (result.data.albumInfo.length > 0) {
                        setHasData(true)
                    }
                }
            } catch (error) {
                console.error('초기 데이터 로딩 오류:', error)
                if (isMounted) {
                    setInitialLoadFailed(true) // 초기 로드 실패 플래그 설정
                }
            } finally {
                if (isMounted) {
                    setIsInitialLoading(false)
                }
            }
        }
        loadInitialData()

        return () => {
            isMounted = false
        }
    }, [setAlbums])

    if (isInitialLoading) {
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
                {/* <div
					className="border-t border-solid"
					style={{ height: "min(80vw, 560px)" }}>
					<KaKaoMap />
				</div> */}

                {hasData || hasNext ? (
                    <>
                        <AlbumListHeader />

                        <div
                            className='overflow-y-auto'
                            style={{
                                /*height: "calc(100vh - min(80vw,560px) - 160px)",*/
                                height: 'calc(100vh - 96px)',
                            }}
                        >
                            {Object.keys(albumsByMonth).map((month, index) => (
                                <Month
                                    key={month}
                                    title={month}
                                    albumIds={albumsByMonth[month]}
                                />
                            ))}
                            {/* Intersection Observer 관찰 대상 (페이지 하단에 위치) */}
                            <div ref={observerRef} style={{ height: '10px' }} />
                        </div>
                    </>
                ) : (
                    <OnboardingScreen />
                )}
            </div>
            <FlottingButton />
        </div>
    )
}

export default Main
