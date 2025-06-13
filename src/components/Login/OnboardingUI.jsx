import ArrowRight from '@/assets/icons/Arrow Right.png'
import ArrowLeft from '@/assets/icons/Arrow_Left.png'
import onboadingImage1 from '@/assets/onboardingImages/onboarding01.png'
import onboadingImage2 from '@/assets/onboardingImages/onboarding02.png'
import onboadingImage3 from '@/assets/onboardingImages/onboarding03.png'
import onboadingImage4 from '@/assets/onboardingImages/onboarding04.png'
import { useEffect, useRef, useState } from 'react'

const OnboardingUI = () => {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [touchStart, setTouchStart] = useState(null)
    const [touchEnd, setTouchEnd] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const [dragOffset, setDragOffset] = useState(0)
    const containerRef = useRef(null)

    const slides = [
        {
            id: 1,
            image: onboadingImage1,
            title: '나만의 사진을 추가해보세요',
            description: 'AI 필터링으로 나만의 앨범을 만들수있습니다.',
        },
        {
            id: 2,
            image: onboadingImage2,
            title: 'AI가 사진에 맞는 카테고리를 분류해줘요',
            subtitle: '카테고리 분류중에서도 중복되거나',
            description: ' 흔들린 사진과 같은 품질이 떨어지는 사진도 AI가 분류해줍니다.',
        },
        {
            id: 3,
            image: onboadingImage3,
            title: '사진에 나온 인물들을 분류해요',
            description: '우리 앨범에서 나만 나온 사진을 모아보고 저장할 수 있어요',
        },
        {
            id: 4,
            image: onboadingImage4,
            title: '친구를 초대하고 함께 앨범을 만들어요',
            description: '앨범에 함께 사진을 추가하면서 우리의 추억을 공유해요',
        },
    ]

    // 최소 스와이프 거리 (픽셀)
    const minSwipeDistance = 50

    const nextSlide = () => {
        setCurrentSlide(prev => (prev + 1) % slides.length)
    }

    const prevSlide = () => {
        setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)
    }

    const goToSlide = index => {
        setCurrentSlide(index)
    }

    // 터치 시작
    const onTouchStart = e => {
        setTouchEnd(null)
        setTouchStart(e.targetTouches[0].clientX)
        setIsDragging(true)
    }

    // 터치 이동
    const onTouchMove = e => {
        if (!isDragging) return

        const currentTouch = e.targetTouches[0].clientX
        const diff = touchStart - currentTouch

        // 드래그 제한 (현재 슬라이드 기준으로 좌우 100% 이내)
        const containerWidth = containerRef.current?.offsetWidth || 0
        const maxDrag = containerWidth
        const limitedDiff = Math.max(-maxDrag, Math.min(maxDrag, diff))

        setDragOffset(limitedDiff)
        setTouchEnd(currentTouch)
    }

    // 터치 종료
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) {
            setIsDragging(false)
            setDragOffset(0)
            return
        }

        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > minSwipeDistance
        const isRightSwipe = distance < -minSwipeDistance

        if (isLeftSwipe && currentSlide < slides.length - 1) {
            nextSlide()
        }
        if (isRightSwipe && currentSlide > 0) {
            prevSlide()
        }

        // 상태 초기화
        setIsDragging(false)
        setDragOffset(0)
        setTouchStart(null)
        setTouchEnd(null)
    }

    // 마우스 이벤트 (데스크톱 호환성)
    const onMouseDown = e => {
        setTouchEnd(null)
        setTouchStart(e.clientX)
        setIsDragging(true)
    }

    const onMouseMove = e => {
        if (!isDragging) return

        const currentMouse = e.clientX
        const diff = touchStart - currentMouse

        const containerWidth = containerRef.current?.offsetWidth || 0
        const maxDrag = containerWidth
        const limitedDiff = Math.max(-maxDrag, Math.min(maxDrag, diff))

        setDragOffset(limitedDiff)
        setTouchEnd(currentMouse)
    }

    const onMouseUp = () => {
        if (!touchStart || !touchEnd) {
            setIsDragging(false)
            setDragOffset(0)
            return
        }

        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > minSwipeDistance
        const isRightSwipe = distance < -minSwipeDistance

        if (isLeftSwipe && currentSlide < slides.length - 1) {
            nextSlide()
        }
        if (isRightSwipe && currentSlide > 0) {
            prevSlide()
        }

        setIsDragging(false)
        setDragOffset(0)
        setTouchStart(null)
        setTouchEnd(null)
    }

    // 마우스 이벤트 리스너 등록/해제
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)

            return () => {
                document.removeEventListener('mousemove', onMouseMove)
                document.removeEventListener('mouseup', onMouseUp)
            }
        }
    }, [isDragging, touchStart, touchEnd])

    return (
        <>
            <div
                ref={containerRef}
                className='relative overflow-hidden'
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseDown={onMouseDown}
                style={{ userSelect: 'none' }}
            >
                <div
                    className={`flex ${isDragging ? '' : 'transition-transform duration-500 ease-out'}`}
                    style={{
                        transform: `translateX(-${currentSlide * 100}%) translateX(-${isDragging ? dragOffset : 0}px)`,
                    }}
                >
                    {slides.map((slide, index) => (
                        <div key={slide.id} className='flex-shrink-0 w-full px-8'>
                            <div className='grid items-center grid-rows-2'>
                                {/* Image Section */}
                                <div className='relative flex justify-center group'>
                                    <img
                                        src={slide.image}
                                        alt={slide.title}
                                        className='h-40 mt-1 transition-transform duration-300 rounded-2xl group-hover:scale-105'
                                        draggable={false}
                                    />
                                </div>

                                {/* Text Section */}
                                <div className='space-y-2'>
                                    <div className='flex flex-col items-center justify-center '>
                                        <h1 className='mb-2 text-sm font-bold leading-tight text-gray-900'>
                                            {slide.title}
                                        </h1>
                                        <h2 className='text-xs leading-relaxed text-center text-gray-500'>
                                            {slide.subtitle}
                                        </h2>
                                        <p className='text-xs leading-relaxed text-center text-gray-500'>
                                            {slide.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className='px-8 text-center'>
                <div className='flex justify-center mb-6 space-x-2'>
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                index === currentSlide
                                    ? 'w-8 bg-gradient-to-r from-primaryBold to-primary'
                                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Navigation Arrows - 모바일에서는 숨김 */}
            <div className='absolute hidden transform -translate-y-1/2 top-1/2 left-4 md:block'>
                <button
                    onClick={prevSlide}
                    className='p-3 text-gray-700 transition-all duration-200 bg-transparent rounded-full hover:bg-white hover:scale-110'
                >
                    <img src={ArrowLeft} className='h-2' />
                </button>
            </div>

            <div className='absolute hidden transform -translate-y-1/2 top-1/2 right-4 md:block'>
                <button
                    onClick={nextSlide}
                    className='p-3 text-gray-700 transition-all duration-200 bg-transparent rounded-full hover:bg-white hover:scale-110'
                >
                    <img src={ArrowRight} className='h-2' />
                </button>
            </div>
        </>
    )
}

export default OnboardingUI
