import useCollectionStore from '@/stores/collectionStore'
import { useEffect, useState } from 'react'

const Card = () => {
    const [isFlipped, setIsFlipped] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [imagesLoaded, setImagesLoaded] = useState(false)
    const [totalRotation, setTotalRotation] = useState(0)
    const { allCollection } = useCollectionStore()

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
        if (canFlip) {
            // 클릭 위치 계산
            const rect = e.currentTarget.getBoundingClientRect()
            const clickX = e.clientX - rect.left
            const cardWidth = rect.width
            const isRightSide = clickX > cardWidth / 2

            // 이미지 인덱스를 즉시 변경 (방향에 따라)
            if (isRightSide) {
                // 오른쪽 클릭: 다음 사진
                setCurrentImageIndex(prev => (prev + 1) % pictures.length)
                setTotalRotation(prev => prev + 180)
            } else {
                // 왼쪽 클릭: 이전 사진
                setCurrentImageIndex(prev => (prev - 1 + pictures.length) % pictures.length)
                setTotalRotation(prev => prev - 180)
            }

            setIsFlipped(!isFlipped)
        }
    }

    if (!allCollection || pictures.length === 0) {
        return null
    }

    // 회전 변환 계산
    const getRotationTransform = () => {
        return `rotateY(${totalRotation}deg)`
    }

    return (
        <div className='m-4' style={{ perspective: '1000px' }}>
            <div
                className={`rounded-3xl h-52 shadow-lg transition-all duration-500 group ${
                    canFlip ? 'cursor-pointer' : 'cursor-default'
                }`}
                style={{
                    transformStyle: 'preserve-3d',
                    transform: getRotationTransform(),
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
                            src={pictures[currentImageIndex]?.pictureURL}
                            alt={`사진 ${currentImageIndex + 1}`}
                        />
                        <div className='absolute px-2 py-1 text-xs text-white transition-opacity duration-200 bg-gray-700 bg-opacity-50 rounded-lg opacity-0 top-2 right-2 group-hover:opacity-70'>
                            {currentImageIndex + 1} / {pictures.length}
                        </div>
                        {canFlip && (
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
                            src={pictures[currentImageIndex]?.pictureURL}
                            alt={`사진 ${currentImageIndex + 1}`}
                        />
                        <div className='absolute px-2 py-1 text-xs text-white transition-opacity duration-200 bg-gray-700 bg-opacity-50 rounded-lg opacity-0 top-2 right-2 group-hover:opacity-70'>
                            {currentImageIndex + 1} / {pictures.length}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Card
