import { useEffect, useState } from 'react'

const BannerSlider = () => {
    // 배너 데이터 (실제 사용시 props로 받거나 외부에서 관리)
    const banners = [
        {
            id: 1,
            image: 'https://via.placeholder.com/1200x300/3B82F6/FFFFFF?text=Banner+1',
            link: 'https://example.com/page1',
            alt: '첫 번째 배너',
        },
        {
            id: 2,
            image: 'https://via.placeholder.com/1200x300/EF4444/FFFFFF?text=Banner+2',
            link: 'https://example.com/page2',
            alt: '두 번째 배너',
        },
        {
            id: 3,
            image: 'https://via.placeholder.com/1200x300/10B981/FFFFFF?text=Banner+3',
            link: 'https://example.com/page3',
            alt: '세 번째 배너',
        },
        {
            id: 4,
            image: 'https://via.placeholder.com/1200x300/F59E0B/FFFFFF?text=Banner+4',
            link: 'https://example.com/page4',
            alt: '네 번째 배너',
        },
    ]

    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlay, setIsAutoPlay] = useState(true)

    // 자동 슬라이드
    useEffect(() => {
        if (isAutoPlay) {
            const interval = setInterval(() => {
                setCurrentIndex(prevIndex => (prevIndex === banners.length - 1 ? 0 : prevIndex + 1))
            }, 3000) // 3초마다 자동 슬라이드

            return () => clearInterval(interval)
        }
    }, [isAutoPlay, banners.length])

    // 이전 배너
    const goToPrevious = () => {
        setCurrentIndex(currentIndex === 0 ? banners.length - 1 : currentIndex - 1)
    }

    // 다음 배너
    const goToNext = () => {
        setCurrentIndex(currentIndex === banners.length - 1 ? 0 : currentIndex + 1)
    }

    // 특정 배너로 이동
    const goToSlide = index => {
        setCurrentIndex(index)
    }

    // 마우스 오버시 자동재생 멈춤
    const handleMouseEnter = () => {
        setIsAutoPlay(false)
    }

    // 마우스 아웃시 자동재생 재개
    const handleMouseLeave = () => {
        setIsAutoPlay(true)
    }

    return (
        <div
            className='relative w-full h-[300px] overflow-hidden bg-gray-100 group'
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* 배너 이미지들 */}
            <div
                className='flex h-full transition-transform duration-500 ease-in-out'
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {banners.map(banner => (
                    <div key={banner.id} className='flex-shrink-0 w-full h-full'>
                        <a href={banner.link} target='_blank' rel='noopener noreferrer' className='block w-full h-full'>
                            <img
                                src={banner.image}
                                alt={banner.alt}
                                className='object-cover w-full h-full transition-transform duration-300 hover:scale-105'
                            />
                        </a>
                    </div>
                ))}
            </div>

            {/* 이전/다음 버튼 */}
            <button
                onClick={goToPrevious}
                className='absolute p-2 text-white transition-opacity transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full opacity-0 left-4 top-1/2 hover:bg-opacity-70 group-hover:opacity-100'
                aria-label='이전 배너'
            >
                <ChevronLeft size={24} />
            </button>

            <button
                onClick={goToNext}
                className='absolute p-2 text-white transition-opacity transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full opacity-0 right-4 top-1/2 hover:bg-opacity-70 group-hover:opacity-100'
                aria-label='다음 배너'
            >
                <ChevronRight size={24} />
            </button>

            {/* 인디케이터 (점 표시) */}
            <div className='absolute flex space-x-2 transform -translate-x-1/2 bottom-4 left-1/2'>
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50 hover:bg-opacity-70'
                        }`}
                        aria-label={`${index + 1}번째 배너로 이동`}
                    />
                ))}
            </div>

            {/* 자동재생 상태 표시 (선택사항) */}
            <div className='absolute transition-opacity opacity-0 top-4 right-4 group-hover:opacity-100'>
                <button
                    onClick={() => setIsAutoPlay(!isAutoPlay)}
                    className='px-3 py-1 text-sm text-white transition-colors bg-black bg-opacity-50 rounded hover:bg-opacity-70'
                >
                    {isAutoPlay ? '자동재생 중' : '자동재생 멈춤'}
                </button>
            </div>
        </div>
    )
}

export default BannerSlider
