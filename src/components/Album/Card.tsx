import useCollectionStore from '@/stores/collectionStore'
import { useEffect, useRef, useState } from 'react'

const Card = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [nextImageIndex, setNextImageIndex] = useState(0)
    const [imagesLoaded, setImagesLoaded] = useState(false)
    const [totalRotation, setTotalRotation] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const { allCollection } = useCollectionStore()
    const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const pictures = allCollection?.pictures || []
    const canFlip = pictures.length > 1

    // 이미지 미리 로드
    useEffect(() => {
        if (pictures.length > 0) {
            const preloadImages = () => {
                let loadedCount = 0
                const totalImages = pictures.length

                pictures.forEach(picture => {
                    const img = new Image()
                    img.onload = () => {
                        loadedCount++
                        if (loadedCount === totalImages) {
                            setImagesLoaded(true)
                        }
                    }
                    img.onerror = () => {
                        loadedCount++
                        if (loadedCount === totalImages) {
                            setImagesLoaded(true)
                        }
                    }
                    img.src = picture.pictureURL
                })
            }

            preloadImages()
        }
    }, [pictures])

    const handleClick = (e: React.MouseEvent) => {
        if (!canFlip || isAnimating) return

        // 클릭 위치 계산
        const rect = e.currentTarget.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const cardWidth = rect.width
        const isRightSide = clickX > cardWidth / 2

        setIsAnimating(true)

        // 다음 이미지 인덱스 미리 계산
        let nextIndex
        if (isRightSide) {
            // 오른쪽 클릭: 다음 사진
            nextIndex = (currentImageIndex + 1) % pictures.length
            setTotalRotation(prev => prev + 180)
        } else {
            // 왼쪽 클릭: 이전 사진
            nextIndex = (currentImageIndex - 1 + pictures.length) % pictures.length
            setTotalRotation(prev => prev - 180)
        }

        // 다음 이미지를 미리 설정
        setNextImageIndex(nextIndex)

        // 애니메이션 중간 지점에서 이미지 변경
        if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current)
        }

        animationTimeoutRef.current = setTimeout(() => {
            setCurrentImageIndex(nextIndex)
        }, 250) // 500ms 애니메이션의 절반 지점

        // 애니메이션 완료 후 상태 초기화
        setTimeout(() => {
            setIsAnimating(false)
        }, 500)
    }

    // 컴포넌트 언마운트 시 타이머 정리
    useEffect(() => {
        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current)
            }
        }
    }, [])

    if (!allCollection || pictures.length === 0) {
        return null
    }

    // 회전 변환 계산 - 더 부드러운 애니메이션을 위한 easing 추가
    const getRotationTransform = () => {
        return `rotateY(${totalRotation}deg)`
    }

    // 현재 보여질 이미지 결정
    const getCurrentImage = (isFront: boolean) => {
        // 애니메이션 중이 아니거나, 앞면을 렌더링할 때는 현재 이미지
        // 애니메이션 중이고 뒷면을 렌더링할 때는 다음 이미지
        if (!isAnimating || isFront) {
            return pictures[currentImageIndex]?.pictureURL
        } else {
            return pictures[nextImageIndex]?.pictureURL
        }
    }

    const getCurrentImageNumber = (isFront: boolean) => {
        if (!isAnimating || isFront) {
            return currentImageIndex + 1
        } else {
            return nextImageIndex + 1
        }
    }

    return (
        <div className='m-4' style={{ perspective: '1000px' }}>
            <div
                className={`rounded-3xl h-52 shadow-lg group ${
                    canFlip ? (isAnimating ? 'cursor-default' : 'cursor-pointer') : 'cursor-default'
                }`}
                style={{
                    transformStyle: 'preserve-3d',
                    transform: getRotationTransform(),
                    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)', // 더 부드러운 easing
                }}
                onClick={handleClick}
            >
                {/* 카드 앞면 */}
                <div
                    className='absolute w-full h-full'
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(0deg)',
                    }}
                >
                    <div className='relative w-full h-full'>
                        <img
                            className='object-cover w-full h-full rounded-3xl'
                            src={getCurrentImage(true)}
                            alt={`사진 ${getCurrentImageNumber(true)}`}
                        />
                        <div className='absolute px-2 py-1 text-xs text-white transition-opacity duration-200 bg-gray-700 bg-opacity-50 rounded-lg opacity-0 top-2 right-2 group-hover:opacity-70'>
                            {getCurrentImageNumber(true)} / {pictures.length}
                        </div>
                        {canFlip && !isAnimating && (
                            <div className='absolute px-2 py-1 text-xs text-white transition-opacity duration-200 bg-gray-700 bg-opacity-50 rounded-lg opacity-0 bottom-2 left-2 group-hover:opacity-70'>
                                클릭해서 다른 사진 보기
                            </div>
                        )}
                    </div>
                </div>

                {/* 카드 뒷면 */}
                <div
                    className='absolute w-full h-full'
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        top: 0,
                        left: 0,
                    }}
                >
                    <div className='relative w-full h-full'>
                        <img
                            className='object-cover w-full h-full rounded-3xl'
                            src={getCurrentImage(false)}
                            alt={`사진 ${getCurrentImageNumber(false)}`}
                        />
                        <div className='absolute px-2 py-1 text-xs text-white transition-opacity duration-200 bg-gray-700 bg-opacity-50 rounded-lg opacity-0 top-2 right-2 group-hover:opacity-70'>
                            {getCurrentImageNumber(false)} / {pictures.length}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Card
