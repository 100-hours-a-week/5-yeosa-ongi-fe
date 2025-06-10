import { useCallback, useEffect, useRef, useState } from 'react'

const ResizableList = ({ children, className = '', showHeightIndicator = false }) => {
    // 3단계 높이 정의 (헤더 56px만 제외, 배너도 가릴 수 있도록)
    const headerHeight = 56
    const availableHeight = window.innerHeight - headerHeight

    const minHeight = Math.round(availableHeight * 0.3) // 사용 가능 높이의 30%
    const midHeight = Math.round(availableHeight * 0.6) // 사용 가능 높이의 60%
    const maxHeight = availableHeight // 배너까지 포함한 전체 높이

    const heights = [minHeight, midHeight, maxHeight]

    const [currentHeightIndex, setCurrentHeightIndex] = useState(0) // 0: min, 1: mid, 2: max
    const [isResizing, setIsResizing] = useState(false)
    const [dragHeight, setDragHeight] = useState(heights[0])

    const startY = useRef(0)
    const startHeight = useRef(0)

    // 현재 높이 가져오기
    const getCurrentHeight = () => (isResizing ? dragHeight : heights[currentHeightIndex])

    // 가장 가까운 높이 단계 찾기
    const findClosestHeightIndex = height => {
        let closestIndex = 0
        let minDiff = Math.abs(height - heights[0])

        for (let i = 1; i < heights.length; i++) {
            const diff = Math.abs(height - heights[i])
            if (diff < minDiff) {
                minDiff = diff
                closestIndex = i
            }
        }
        return closestIndex
    }

    // 마우스/터치 무브 핸들러
    const handleMove = useCallback(
        clientY => {
            if (!isResizing) return

            const deltaY = startY.current - clientY
            const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight.current + deltaY))
            console.log(newHeight)
            setDragHeight(newHeight)
            console.log(dragHeight)
        },
        [isResizing, minHeight, maxHeight]
    )

    // 드래그 종료 핸들러
    const handleEnd = useCallback(() => {
        if (!isResizing) return

        setIsResizing(false)
        // 가장 가까운 높이로 스냅
        console.log(dragHeight)
        const closestIndex = findClosestHeightIndex(dragHeight)
        setCurrentHeightIndex(closestIndex)

        // 이벤트 리스너 제거
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        document.removeEventListener('touchmove', onTouchMove)
        document.removeEventListener('touchend', onTouchEnd)
    }, [isResizing, dragHeight])

    // 이벤트 핸들러들
    const onMouseMove = useCallback(e => handleMove(e.clientY), [handleMove])
    const onMouseUp = useCallback(() => handleEnd(), [handleEnd])
    const onTouchMove = useCallback(
        e => {
            e.preventDefault()
            handleMove(e.touches[0].clientY)
        },
        [handleMove]
    )
    const onTouchEnd = useCallback(() => handleEnd(), [handleEnd])

    // 드래그 시작 (마우스)
    const handleMouseDown = useCallback(
        e => {
            e.preventDefault()
            setIsResizing(true)
            startY.current = e.clientY
            startHeight.current = getCurrentHeight()
            setDragHeight(startHeight.current)

            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
        },
        [getCurrentHeight, onMouseMove, onMouseUp]
    )

    // 드래그 시작 (터치)
    const handleTouchStart = useCallback(
        e => {
            e.preventDefault()
            setIsResizing(true)
            startY.current = e.touches[0].clientY
            startHeight.current = getCurrentHeight()
            setDragHeight(startHeight.current)

            document.addEventListener('touchmove', onTouchMove, { passive: false })
            document.addEventListener('touchend', onTouchEnd)
        },
        [getCurrentHeight, onTouchMove, onTouchEnd]
    )

    // 높이 레벨 이름
    const getHeightLabel = () => {
        const labels = ['최소', '중간', '최대']
        return labels[currentHeightIndex]
    }

    // 컴포넌트 언마운트 시 이벤트 리스너 정리
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
            document.removeEventListener('touchmove', onTouchMove)
            document.removeEventListener('touchend', onTouchEnd)
        }
    }, [])

    return (
        <div
            className={`absolute bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-lg z-10 ${
                isResizing ? '' : 'transition-all duration-300 ease-out'
            }`}
            style={{
                height: `${getCurrentHeight()}px`,
            }}
        >
            {/* 드래그 핸들 - 상단에 위치 */}
            <div
                className={`relative h-5 cursor-row-resize flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-t-lg select-none ${
                    isResizing ? 'bg-blue-200' : ''
                }`}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                title='드래그해서 높이 조절'
            >
                <div className='w-8 h-1 bg-gray-400 rounded'></div>

                {/* 높이 표시 - 핸들 중앙에 위치 */}
                {showHeightIndicator && (
                    <div className='absolute right-3 bg-black bg-opacity-50 text-white px-2 py-0.5 rounded text-xs'>
                        {getCurrentHeight()}px ({getHeightLabel()})
                    </div>
                )}

                {/* 단계 인디케이터 - 드래그 중에만 표시 */}
                {isResizing && (
                    <div className='absolute flex gap-1 transform -translate-x-1/2 left-1/2 mt-7'>
                        {heights.map((height, index) => {
                            // 현재 드래그 높이와 각 단계 높이의 차이 계산
                            const diff = Math.abs(dragHeight - height)
                            const threshold = 50 // 마그넷 효과 임계값
                            const isClose = diff < threshold

                            return (
                                <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-all duration-150 ${
                                        isClose ? 'bg-blue-500 scale-125' : 'bg-gray-300'
                                    }`}
                                />
                            )
                        })}
                    </div>
                )}

                {/* 드래그 중이 아닐 때 현재 단계 표시 */}
                {!isResizing && (
                    <div className='absolute flex gap-1 transform -translate-x-1/2 left-1/2 mt-7'>
                        {heights.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                    currentHeightIndex === index ? 'bg-blue-500' : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* 리스트 컨테이너 */}
            <div
                className={`overflow-y-auto ${className}`}
                style={{ height: `calc(100% - 20px)` }} // 핸들 높이(20px) 제외
            >
                {children}
            </div>
        </div>
    )
}

export default ResizableList
