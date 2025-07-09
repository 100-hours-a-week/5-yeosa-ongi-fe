import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

import banner01 from '@/assets/banners/banner01.webp'
import banner02 from '@/assets/banners/pumati_banner1.webp'

const BannerSlider = () => {
    const banners = [
        {
            id: 1,
            image: banner01,
            link: '',
            alt: '첫 번째 배너',
        },
        {
            id: 2,
            image: banner02,
            link: 'https://tebutebu.com/',
            alt: '두 번째 배너',
        },
    ]

    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlay, setIsAutoPlay] = useState(true)

    // 자동 슬라이드
    useEffect(() => {
        if (isAutoPlay) {
            const interval = setInterval(() => {
                setCurrentIndex(prevIndex => (prevIndex === banners.length - 1 ? 0 : prevIndex + 1))
            }, 4000)

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
            className='relative w-full h-[72px] overflow-hidden bg-gray-100 group'
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
                className='absolute p-2 text-white transition-opacity transform -translate-y-1/2 bg-black rounded-full opacity-0 bg-opacity-20 left-4 top-1/2 group-hover:opacity-100'
                aria-label='이전 배너'
            >
                <ChevronLeft size={24} />
            </button>

            <button
                onClick={goToNext}
                className='absolute p-2 text-white transition-opacity transform -translate-y-1/2 bg-black rounded-full opacity-0 bg-opacity-20 right-4 top-1/2 group-hover:opacity-100'
                aria-label='다음 배너'
            >
                <ChevronRight size={24} />
            </button>
        </div>
    )
}

export default BannerSlider
