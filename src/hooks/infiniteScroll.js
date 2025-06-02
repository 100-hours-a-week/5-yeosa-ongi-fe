import { useCallback, useEffect, useRef, useState } from 'react'

const useInfiniteScroll = (
    fetchCallback,
    initialHasNext = true,
    options = { threshold: 0.5 }
) => {
    const [isLoading, setIsLoading] = useState(false)
    const [hasNext, setHasNext] = useState(true)
    const observerRef = useRef(null)

    const loadMore = useCallback(async () => {
        if (isLoading || !hasNext) return

        try {
            setIsLoading(true)
            const hasMoreData = await fetchCallback()
            setHasNext(hasMoreData)
        } catch (error) {
            console.error('데이터 로드 실패:', error)
        } finally {
            setIsLoading(false)
        }
    }, [fetchCallback, hasNext, isLoading])

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasNext && !isLoading) {
                    loadMore()
                }
            },
            { threshold: options.threshold }
        )

        const currentObserver = observerRef.current
        if (currentObserver) {
            observer.observe(currentObserver)
        }

        return () => {
            if (currentObserver) {
                observer.unobserve(currentObserver)
            }
        }
    }, [loadMore, hasNext, isLoading, options.threshold])
    return {
        observerRef,
        isLoading,
        hasNext,
        setHasNext,
    }
}

export default useInfiniteScroll
