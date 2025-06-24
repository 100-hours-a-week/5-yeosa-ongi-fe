import { Loader2 } from 'lucide-react'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'

// 제네릭 타입 정의
interface InfiniteScrollProps<T> {
    items: T[]
    renderItem: (item: T, index: number, isLast: boolean) => ReactNode
    loadMore?: () => Promise<T[]> | T[]
    hasMore?: boolean
    loading?: boolean
    itemsPerPage?: number
    threshold?: number
    rootMargin?: string
    loadingComponent?: ReactNode
    endMessage?: ReactNode
    emptyMessage?: ReactNode
    className?: string
    containerClassName?: string
}

function InfiniteScrollList<T>({
    items: initialItems = [],
    renderItem,
    loadMore,
    hasMore: externalHasMore,
    loading: externalLoading,
    itemsPerPage = 1,
    threshold = 0.5,
    rootMargin = '100px',
    loadingComponent,
    endMessage,
    emptyMessage,
    className = '',
    containerClassName = '',
}: InfiniteScrollProps<T>) {
    const [items, setItems] = useState<T[]>(initialItems)
    const [internalLoading, setInternalLoading] = useState<boolean>(false)
    const [internalHasMore, setInternalHasMore] = useState<boolean>(true)
    const [currentIndex, setCurrentIndex] = useState<number>(0)
    const observer = useRef<IntersectionObserver | null>(null)

    // 외부에서 loading과 hasMore를 제어하는지 확인
    const isExternallyControlled = externalLoading !== undefined || externalHasMore !== undefined
    const loading = isExternallyControlled ? externalLoading || false : internalLoading
    const hasMore = isExternallyControlled ? externalHasMore || false : internalHasMore

    // 초기 아이템이 변경되면 상태 업데이트
    useEffect(() => {
        setItems(initialItems)
        setCurrentIndex(0)
        if (!isExternallyControlled) {
            setInternalHasMore(initialItems.length > itemsPerPage)
        }
    }, [initialItems, itemsPerPage, isExternallyControlled])

    // 내부적으로 아이템을 페이지네이션하는 함수
    const loadMoreItemsInternal = useCallback(async () => {
        if (loading) return

        if (loadMore) {
            // 외부 loadMore 함수가 있는 경우
            if (!isExternallyControlled) {
                setInternalLoading(true)
            }

            try {
                const newItems = await loadMore()
                setItems(prev => [...prev, ...newItems])

                if (!isExternallyControlled) {
                    setInternalHasMore(newItems.length === itemsPerPage)
                }
            } catch (error) {
                console.error('Error loading more items:', error)
            } finally {
                if (!isExternallyControlled) {
                    setInternalLoading(false)
                }
            }
        } else {
            // 내부적으로 초기 아이템들을 페이지네이션
            if (currentIndex >= initialItems.length) return

            setInternalLoading(true)

            // 로딩 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 300))

            const nextItems = initialItems.slice(currentIndex, currentIndex + itemsPerPage)
            setItems(prev => [...prev, ...nextItems])
            setCurrentIndex(prev => prev + itemsPerPage)

            if (currentIndex + itemsPerPage >= initialItems.length) {
                setInternalHasMore(false)
            }

            setInternalLoading(false)
        }
    }, [loading, loadMore, currentIndex, initialItems, itemsPerPage, isExternallyControlled])

    // 첫 로드
    useEffect(() => {
        if (items.length === 0 && initialItems.length > 0) {
            const initialBatch = initialItems.slice(0, itemsPerPage)
            setItems(initialBatch)
            setCurrentIndex(itemsPerPage)

            if (!isExternallyControlled) {
                setInternalHasMore(itemsPerPage < initialItems.length)
            }
        }
    }, [initialItems, itemsPerPage, items.length, isExternallyControlled])

    // Intersection Observer를 위한 ref 콜백
    const lastItemElementRef = useCallback(
        (node: Element | null) => {
            if (loading) return
            if (observer.current) observer.current.disconnect()

            observer.current = new IntersectionObserver(
                entries => {
                    if (entries[0].isIntersecting && hasMore) {
                        loadMoreItemsInternal()
                    }
                },
                {
                    threshold,
                    rootMargin,
                }
            )

            if (node) observer.current.observe(node)
        },
        [loading, hasMore, loadMoreItemsInternal, threshold, rootMargin]
    )

    // 컴포넌트 언마운트 시 observer 정리
    useEffect(() => {
        return () => {
            if (observer.current) {
                observer.current.disconnect()
            }
        }
    }, [])

    const defaultLoadingComponent = (
        <div className='flex items-center justify-center p-8'>
            <Loader2 className='w-8 h-8 text-blue-600 animate-spin' />
            <span className='ml-3 text-gray-600'>로딩 중...</span>
        </div>
    )

    const defaultEmptyMessage = (
        <div className='flex items-center justify-center p-12 text-gray-500'>
            <p>표시할 항목이 없습니다.</p>
        </div>
    )

    return (
        <div className={`h-full flex flex-col ${containerClassName}`}>
            <div className={`flex-1 overflow-y-auto ${className}`}>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1

                    return (
                        <div key={index} ref={isLast && hasMore ? lastItemElementRef : null}>
                            {renderItem(item, index, isLast)}
                        </div>
                    )
                })}

                {loading && (loadingComponent || defaultLoadingComponent)}

                {!hasMore && items.length > 0 && endMessage}

                {items.length === 0 && !loading && (emptyMessage || defaultEmptyMessage)}
            </div>
        </div>
    )
}

export default InfiniteScrollList
