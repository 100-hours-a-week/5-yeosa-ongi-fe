import useCollectionStore from '@/stores/collectionStore'
import { useEffect, useState } from 'react'
import OptimizedImage from '../common/OptimizedImage'

const Card = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)

    const { allCollection } = useCollectionStore()
    const pictures = allCollection?.pictures || []
    const canNavigate = pictures.length > 1

    // 이미지 미리 로드
    useEffect(() => {
        if (pictures.length > 0) {
            // 1. 첫 번째 이미지만 즉시 고우선순위로 로드
            const firstImg = new Image()
            firstImg.src = pictures[0].pictureURL

            // 2. 첫 번째 이미지 로드 완료 후 나머지 순차 로드
            firstImg.onload = () => {
                pictures.slice(1).forEach((picture, index) => {
                    setTimeout(() => {
                        const img = new Image()
                        img.src = picture.pictureURL
                    }, index * 100) // 100ms씩 지연해서 순차 로드
                })
            }
        }
    }, [pictures])

    // 클릭 핸들러
    const handleClick = (e: React.MouseEvent) => {
        if (!canNavigate || isAnimating) return

        const rect = e.currentTarget.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const isRightSide = clickX > rect.width / 2

        setIsAnimating(true)

        const nextIndex = isRightSide
            ? (currentImageIndex + 1) % pictures.length
            : (currentImageIndex - 1 + pictures.length) % pictures.length

        setCurrentImageIndex(nextIndex)

        // 애니메이션 완료 후 상태 초기화
        setTimeout(() => {
            setIsAnimating(false)
        }, 300)
    }

    if (!allCollection || pictures.length === 0) return null

    return (
        <div className='m-4'>
            <div
                className={`rounded-3xl h-60 shadow-lg group relative overflow-hidden ${
                    canNavigate ? (isAnimating ? 'cursor-default' : 'cursor-pointer') : 'cursor-default'
                }`}
                onClick={handleClick}
            >
                {/* 메인 이미지 */}
                <OptimizedImage
                    className={`object-cover w-full h-full rounded-3xl transition-opacity duration-300`}
                    lazy={false}
                    fetchpriority={true}
                    height={240}
                    src={pictures[currentImageIndex]?.pictureURL}
                    alt={`사진 ${currentImageIndex + 1}`}
                    size='medium'
                />

                {/* 이미지 번호 표시 */}
                <div className='absolute px-2 py-1 text-xs text-white transition-opacity duration-200 bg-gray-700 bg-opacity-50 rounded-lg opacity-0 top-2 right-2 group-hover:opacity-70'>
                    {currentImageIndex + 1} / {pictures.length}
                </div>

                {/* 네비게이션 안내 */}
                {canNavigate && !isAnimating && (
                    <div className='absolute px-2 py-1 text-xs text-white transition-opacity duration-200 bg-gray-700 bg-opacity-50 rounded-lg opacity-0 bottom-2 left-2 group-hover:opacity-70'>
                        클릭해서 다른 사진 보기
                    </div>
                )}

                {/* 좌우 클릭 영역 표시 (호버 시) */}
                {canNavigate && !isAnimating && (
                    <>
                        <div className='absolute top-0 left-0 w-1/2 h-full opacity-0 pointer-events-none group-hover:opacity-10 bg-gradient-to-r from-black to-transparent' />
                        <div className='absolute top-0 right-0 w-1/2 h-full opacity-0 pointer-events-none group-hover:opacity-10 bg-gradient-to-l from-black to-transparent' />
                    </>
                )}
            </div>
        </div>
    )
}

export default Card
