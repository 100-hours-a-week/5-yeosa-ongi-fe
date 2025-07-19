import { AlbumAPI } from '@/api/AlbumAPI'
import { AlbumData, useAlbumStore, useMainPageStore } from '@/stores/mainPageStore'
import { APIResponse } from '@/types/api.types'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
import AlbumItems from './AlbumItems'
import Month from './Month'

type AlbumDataResponse = {
    albumInfo: AlbumData[]
    nextYearMonth: string | null
    hasNext: boolean | string
}

type AlbumApiResponse = APIResponse<AlbumDataResponse>

const AlbumList = ({ view }: { view?: 'LIST_VIEW' | 'MAP_VIEW' }) => {
    const loadMoreTriggerRef = useRef<HTMLDivElement>(null)
    const { clearSelection } = useMainPageStore()
    const { albumsByMonth: storeAlbumsByMonth, setAlbums, addAlbums } = useAlbumStore()

    const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isLoading, isError, error } =
        useInfiniteQuery<AlbumApiResponse>({
            queryKey: ['albums'],
            queryFn: async ({ pageParam = ' ' }) => {
                console.log('API 요청:', pageParam)
                const result = await AlbumAPI.getMonthlyAlbums(pageParam as string)
                return result
            },
            initialPageParam: ' ',
            getNextPageParam: (lastPage, pages) => {
                if (!lastPage?.data) return undefined

                // hasNext가 true이고 nextYearMonth가 있으면 다음 페이지 파라미터 반환
                const hasNext = lastPage.data.hasNext === 'true' || lastPage.data.hasNext === true
                console.log(hasNext, lastPage)
                return hasNext && lastPage.data.nextYearMonth ? lastPage.data.nextYearMonth : undefined
            },
            staleTime: 1000 * 60 * 5, // 5분
            refetchOnWindowFocus: false,
        })

    useEffect(() => {
        console.log(data?.pages)
        if (data?.pages && data.pages.length > 0) {
            const firstPage = data.pages[0]
            const restPages = data.pages.slice(1)
            console.log(firstPage)
            // 첫 번째 페이지로 초기 설정
            if (firstPage?.code && firstPage?.data?.albumInfo) {
                setAlbums(firstPage.data.albumInfo)
            }
            console.log(storeAlbumsByMonth)
            // 나머지 페이지들을 추가
            restPages.forEach(page => {
                if (page?.code && page?.data?.albumInfo) {
                    addAlbums(page.data.albumInfo)
                }
            })
        }
    }, [data, setAlbums, addAlbums])

    // Zustand 스토어의 데이터 사용 (UI 렌더링용)
    const albumsByMonth = storeAlbumsByMonth

    // 무한 스크롤 트리거 함수
    const handleIntersection = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries

            // 화면에 보이고, 다음 페이지가 있고, 현재 로딩 중이 아닐 때만 실행
            if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                console.log('무한 스크롤 트리거됨')
                fetchNextPage()
            }
        },
        [hasNextPage, isFetchingNextPage, fetchNextPage]
    )

    // Intersection Observer 설정
    useEffect(() => {
        const element = loadMoreTriggerRef.current
        if (!element) return

        const observer = new IntersectionObserver(handleIntersection, {
            root: null, // viewport를 root로 사용
            rootMargin: '100px', // 100px 전에 미리 로드
            threshold: 0.1, // 10%가 보일 때 트리거
        })

        observer.observe(element)

        return () => {
            observer.unobserve(element)
        }
    }, [handleIntersection])

    return (
        <div className='flex-1 overflow-y-auto'>
            {view === 'LIST_VIEW'
                ? Object.keys(albumsByMonth)
                      .sort((a, b) => b.localeCompare(a))
                      .map(month => (
                          <AlbumItems
                              key={month}
                              title={month}
                              albumIds={albumsByMonth[month]}
                              handleOutsideClick={clearSelection}
                          />
                      ))
                : Object.keys(albumsByMonth)
                      .sort((a, b) => b.localeCompare(a))
                      .map(month => (
                          <Month
                              key={month}
                              title={month}
                              albumIds={albumsByMonth[month]}
                              handleOutsideClick={clearSelection}
                          />
                      ))}
            {/* 무한 스크롤 트리거 요소 */}
            {hasNextPage && (
                <div ref={loadMoreTriggerRef} className='flex items-center justify-center h-20'>
                    {isFetchingNextPage ? (
                        <div className='flex items-center space-x-2'>
                            <div className='w-5 h-5 border-b-2 border-blue-500 rounded-full animate-spin'></div>
                            <span className='text-sm text-gray-500'>더 많은 앨범을 불러오고 있어요...</span>
                        </div>
                    ) : (
                        <div className='text-xs text-gray-400'>스크롤해서 더 많은 앨범 보기</div>
                    )}
                </div>
            )}
        </div>
    )
}

export default AlbumList
