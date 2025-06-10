import { useCallback, useRef, useState } from 'react'

const ResizableList = ({ children, className = '', showHeightIndicator = false }) => {
    // 3단계 높이 정의 (헤더 56px만 제외, 배너도 가릴 수 있도록)
    const headerHeight = 56
    const screenHeight = window.innerHeight - headerHeight

    const minHeight = Math.round(screenHeight * 0.3) // 화면의 30%
    const midHeight = Math.round(screenHeight * 0.6) // 화면의 60%
    const maxHeight = screenHeight // 헤더 제외한 전체 화면

    const heights = [minHeight, midHeight, maxHeight]

    const [currentHeightIndex, setCurrentHeightIndex] = useState(0) // 0: min, 1: mid, 2: max
    const [isResizing, setIsResizing] = useState(false)
    const [tempHeight, setTempHeight] = useState(heights[0])

    const startY = useRef(0)
    const startHeight = useRef(0)

    // 현재 높이 가져오기
    const getCurrentHeight = () => (isResizing ? tempHeight : heights[currentHeightIndex])

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

    // 드래그 시작
    const handleMouseDown = useCallback(
        e => {
            setIsResizing(true)
            startY.current = e.clientY
            startHeight.current = getCurrentHeight()
            setTempHeight(startHeight.current)

            const handleMouseMove = e => {
                const deltaY = startY.current - e.clientY
                const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight.current + deltaY))
                setTempHeight(newHeight)
            }

            const handleMouseUp = () => {
                setIsResizing(false)
                // 가장 가까운 높이로 스냅
                const closestIndex = findClosestHeightIndex(tempHeight)
                setCurrentHeightIndex(closestIndex)

                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
            }

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            e.preventDefault()
        },
        [tempHeight, minHeight, maxHeight]
    )

    // 터치 이벤트 처리
    const handleTouchStart = useCallback(
        e => {
            setIsResizing(true)
            startY.current = e.touches[0].clientY
            startHeight.current = getCurrentHeight()
            setTempHeight(startHeight.current)

            const handleTouchMove = e => {
                e.preventDefault()
                const deltaY = startY.current - e.touches[0].clientY
                const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight.current + deltaY))
                setTempHeight(newHeight)
            }

            const handleTouchEnd = () => {
                setIsResizing(false)
                // 가장 가까운 높이로 스냅
                const closestIndex = findClosestHeightIndex(tempHeight)
                setCurrentHeightIndex(closestIndex)

                document.removeEventListener('touchmove', handleTouchMove)
                document.removeEventListener('touchend', handleTouchEnd)
            }

            document.addEventListener('touchmove', handleTouchMove, { passive: false })
            document.addEventListener('touchend', handleTouchEnd)
            e.preventDefault()
        },
        [tempHeight, minHeight, maxHeight]
    )

    // 높이 레벨 이름
    const getHeightLabel = () => {
        const labels = ['최소', '중간', '최대']
        return labels[currentHeightIndex]
    }

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

                {/* 높이 표시 */}
                {showHeightIndicator && (
                    <div className='absolute right-3 bg-black bg-opacity-50 text-white px-2 py-0.5 rounded text-xs'>
                        {getCurrentHeight()}px ({getHeightLabel()})
                    </div>
                )}

                {/* 단계 인디케이터 - 드래그 중에는 마그넷 효과 표시 */}
                <div className='absolute flex gap-1 transform -translate-x-1/2 left-1/2 mt-7'>
                    {heights.map((height, index) => {
                        if (isResizing) {
                            // 드래그 중: 마그넷 효과 표시
                            const diff = Math.abs(tempHeight - height)
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
                        } else {
                            // 드래그 중이 아닐 때: 현재 단계 표시
                            return (
                                <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                        currentHeightIndex === index ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}
                                />
                            )
                        }
                    })}
                </div>
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
