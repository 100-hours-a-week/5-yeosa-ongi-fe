import useCollectionStore from '@/stores/collectionStore'
import { useEffect, useState } from 'react'

const Card = () => {
    const [isFlipped, setIsFlipped] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [imagesLoaded, setImagesLoaded] = useState(false)
    const [totalRotation, setTotalRotation] = useState(0) // 누적 회전 각도
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

            // 회전 방향에 따라 누적 회전 각도 업데이트
            const rotationAmount = isRightSide ? 180 : -180
            setTotalRotation(prev => prev + rotationAmount)
            setIsFlipped(!isFlipped)

            // 애니메이션이 절반 진행된 후 이미지 인덱스 변경
            setTimeout(() => {
                setCurrentImageIndex(prev => (prev + 1) % pictures.length)
            }, 250)
        }
    }

    if (!allCollection || pictures.length === 0) {
        return null
    }

    // 회전 변환 계산
    const getRotationTransform = () => {
        return `rotateY(${totalRotation}deg)`
    }

    // 현재 보여줄 이미지 인덱스 결정
    const displayImageIndex = currentImageIndex

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
                            src={pictures[displayImageIndex]?.pictureURL}
                            alt={`사진 ${displayImageIndex + 1}`}
                        />
                        <div className='absolute px-2 py-1 text-xs text-white transition-opacity duration-200 bg-black bg-opacity-50 rounded opacity-0 top-2 right-2 group-hover:opacity-100'>
                            {currentImageIndex + 1} / {pictures.length}
                        </div>
                        {canFlip && currentImageIndex === 0 && (
                            <div className='absolute px-2 py-1 text-xs text-white bg-black bg-opacity-50 rounded bottom-2 left-2'>
                                클릭해서 다음 사진 보기
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
                            src={pictures[displayImageIndex]?.pictureURL}
                            alt={`사진 ${displayImageIndex + 1}`}
                        />
                        <div className='absolute px-2 py-1 text-xs text-white transition-opacity duration-200 bg-black bg-opacity-50 rounded opacity-0 top-2 right-2 group-hover:opacity-100'>
                            {currentImageIndex + 1} / {pictures.length}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Card
