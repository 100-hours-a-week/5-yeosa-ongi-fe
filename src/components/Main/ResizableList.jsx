import { useCallback, useEffect, useRef, useState } from 'react'

const ResizableList = ({
    children,
    className = '',
    showHeightIndicator = false,
    onHeightChange, // 높이 변경 콜백 추가
}) => {
    const headerHeight = 56
    const screenHeight = window.innerHeight - headerHeight

    const minHeight = Math.round(screenHeight * 0.3) // 화면의 30%
    const midHeight = Math.round(screenHeight * 0.5) // 화면의 60%
    const maxHeight = screenHeight // 헤더 제외한 전체 화면

    const heights = [minHeight, midHeight, maxHeight]

    const [currentHeightIndex, setCurrentHeightIndex] = useState(1)
    const [isResizing, setIsResizing] = useState(false)
    const [tempHeight, setTempHeight] = useState(heights[0])

    const startY = useRef(0)
    const startHeight = useRef(0)

    // 현재 높이 가져오기
    const getCurrentHeight = () => (isResizing ? tempHeight : heights[currentHeightIndex])

    // 높이 변경 시 부모에게 알림
    const notifyHeightChange = useCallback(
        height => {
            if (onHeightChange) {
                onHeightChange(height)
            }
        },
        [onHeightChange]
    )

    // 높이가 변경될 때마다 부모에게 알림
    useEffect(() => {
        notifyHeightChange(getCurrentHeight())
    }, [tempHeight, currentHeightIndex, isResizing, notifyHeightChange])

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
            // getCurrentHeight() 대신 직접 계산
            const currentHeight = heights[currentHeightIndex]
            startHeight.current = currentHeight
            setTempHeight(currentHeight)

            const handleMouseMove = e => {
                const deltaY = startY.current - e.clientY
                const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight.current + deltaY))
                setTempHeight(newHeight)
            }

            const handleMouseUp = () => {
                setIsResizing(false)
                // tempHeight를 클로저에서 직접 참조하지 말고 콜백에서 받기
                setTempHeight(currentTempHeight => {
                    const closestIndex = findClosestHeightIndex(currentTempHeight)
                    setCurrentHeightIndex(closestIndex)
                    return currentTempHeight // tempHeight는 변경하지 않음
                })

                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
            }

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            e.preventDefault()
        },
        [currentHeightIndex, heights, minHeight, maxHeight]
    )

    // 터치 이벤트 처리
    const handleTouchStart = useCallback(
        e => {
            setIsResizing(true)
            startY.current = e.touches[0].clientY
            // getCurrentHeight() 대신 직접 계산
            const currentHeight = heights[currentHeightIndex]
            startHeight.current = currentHeight
            setTempHeight(currentHeight)

            const handleTouchMove = e => {
                e.preventDefault()
                const deltaY = startY.current - e.touches[0].clientY
                const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight.current + deltaY))
                setTempHeight(newHeight)
            }

            const handleTouchEnd = () => {
                setIsResizing(false)
                // tempHeight를 클로저에서 직접 참조하지 말고 콜백에서 받기
                setTempHeight(currentTempHeight => {
                    const closestIndex = findClosestHeightIndex(currentTempHeight)
                    setCurrentHeightIndex(closestIndex)
                    return currentTempHeight
                })

                document.removeEventListener('touchmove', handleTouchMove)
                document.removeEventListener('touchend', handleTouchEnd)
            }

            document.addEventListener('touchmove', handleTouchMove, { passive: false })
            document.addEventListener('touchend', handleTouchEnd)
            e.preventDefault()
        },
        [currentHeightIndex, heights, minHeight, maxHeight]
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
            </div>

            {/* 리스트 컨테이너 */}
            <div
                className={`flex flex-col ${className}`}
                style={{ height: `calc(100% - 20px)` }} // 핸들 높이(20px) 제외
            >
                {children}
            </div>
        </div>
    )
}

export default ResizableList
