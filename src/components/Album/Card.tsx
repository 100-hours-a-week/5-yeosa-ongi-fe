import useCollectionStore from '@/stores/collectionStore'
import { useEffect, useRef, useState } from 'react'

const Card = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [nextImageIndex, setNextImageIndex] = useState(0)
    const [imagesLoaded, setImagesLoaded] = useState(false)
    const [totalRotation, setTotalRotation] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const [showBackImage, setShowBackImage] = useState(false) // 추가

    const { allCollection } = useCollectionStore()
    const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const pictures = allCollection?.pictures || []
    const canFlip = pictures.length > 1

    // 이미지 미리 로드
    useEffect(() => {
        if (pictures.length > 0) {
            let loadedCount = 0
            const totalImages = pictures.length

            pictures.forEach(picture => {
                const img = new Image()
                img.onload = img.onerror = () => {
                    loadedCount++
                    if (loadedCount === totalImages) {
                        setImagesLoaded(true)
                    }
                }
                img.src = picture.pictureURL
            })
        }
    }, [pictures])

    // 클릭 핸들러
    const handleClick = (e: React.MouseEvent) => {
        if (!canFlip || isAnimating) return

        const rect = e.currentTarget.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const isRightSide = clickX > rect.width / 2

        setIsAnimating(true)
        setShowBackImage(true)

        const nextIndex = isRightSide
            ? (currentImageIndex + 1) % pictures.length
            : (currentImageIndex - 1 + pictures.length) % pictures.length

        setNextImageIndex(nextIndex)
        setTotalRotation(prev => prev + (isRightSide ? 180 : -180))

        if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current)
        }

        animationTimeoutRef.current = setTimeout(() => {
            setCurrentImageIndex(nextIndex)
            setShowBackImage(false)
            setIsAnimating(false)
        }, 500)
    }

    // 언마운트 시 타이머 정리
    useEffect(() => {
        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current)
            }
        }
    }, [])

    if (!allCollection || pictures.length === 0) return null

    // 회전 변환
    const getRotationTransform = () => {
        return `rotateY(${totalRotation}deg)`
    }

    // 이미지 선택 로직
    const getImageURL = (isFront: boolean) => {
        if (isFront) {
            return pictures[currentImageIndex]?.pictureURL
        } else {
            return showBackImage ? pictures[nextImageIndex]?.pictureURL : pictures[currentImageIndex]?.pictureURL
        }
    }

    const getImageNumber = (isFront: boolean) => {
        if (isFront) {
            return currentImageIndex + 1
        } else {
            return showBackImage ? nextImageIndex + 1 : currentImageIndex + 1
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
                    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
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
                            src={getImageURL(true)}
                            alt={`사진 ${getImageNumber(true)}`}
                        />
                        <div className='absolute px-2 py-1 text-xs text-white transition-opacity duration-200 bg-gray-700 bg-opacity-50 rounded-lg opacity-0 top-2 right-2 group-hover:opacity-70'>
                            {getImageNumber(true)} / {pictures.length}
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
                            src={getImageURL(false)}
                            alt={`사진 ${getImageNumber(false)}`}
                        />
                        <div className='absolute px-2 py-1 text-xs text-white transition-opacity duration-200 bg-gray-700 bg-opacity-50 rounded-lg opacity-0 top-2 right-2 group-hover:opacity-70'>
                            {getImageNumber(false)} / {pictures.length}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Card
