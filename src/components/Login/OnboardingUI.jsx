import ArrowRight from '@/assets/icons/Arrow Right.png'
import ArrowLeft from '@/assets/icons/Arrow_Left.png'
import onboadingImage1 from '@/assets/onboardingImages/onboarding01.png'
import onboadingImage2 from '@/assets/onboardingImages/onboarding02.png'
import { useState } from 'react'
const OnboardingUI = () => {
    const [currentSlide, setCurrentSlide] = useState(0)

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
            title: '친구를 초대하고 함께 앨범을 만들어요',
            description: '앨범에 함께 사진을 추가하면서 우리의 추억을 공유해요',
        },
    ]

    const nextSlide = () => {
        setCurrentSlide(prev => (prev + 1) % slides.length)
    }

    const prevSlide = () => {
        setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)
    }

    const goToSlide = index => {
        setCurrentSlide(index)
    }

    return (
        <>
            {/* Header */}

            {/* Content Container */}
            <div className='relative overflow-hidden'>
                <div
                    className='flex transition-transform duration-500 ease-out'
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {slides.map((slide, index) => (
                        <div key={slide.id} className='flex-shrink-0 w-full px-8 pb-8'>
                            <div className='grid items-center gap-8 md:grid-cols-2'>
                                {/* Image Section */}
                                <div className='relative group'>
                                    <img
                                        src={slide.image}
                                        alt={slide.title}
                                        className='object-cover w-full transition-transform duration-300 h-52 rounded-2xl group-hover:scale-105'
                                    />
                                </div>

                                {/* Text Section */}
                                <div className='space-y-6'>
                                    <div className='flex flex-col items-center justify-center '>
                                        <h1 className='font-bold leading-tight text-gray-900 text-md'>{slide.title}</h1>
                                        <h2 className='font-medium text-gray-600 text-md'>{slide.subtitle}</h2>
                                        <p className='text-xs leading-relaxed text-gray-500'>{slide.description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className='px-8 pt-8 text-center'>
                <div className='flex justify-center mb-6 space-x-2'>
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                index === currentSlide
                                    ? 'w-8 bg-gradient-to-r from-purple-500 to-blue-500'
                                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Navigation Arrows */}
            <div className='absolute transform -translate-y-1/2 top-1/2 left-4'>
                <button
                    onClick={prevSlide}
                    className='p-3 text-gray-700 transition-all duration-200 bg-transparent rounded-full hover:bg-white hover:scale-110'
                >
                    <img src={ArrowLeft} className='h-2' />
                </button>
            </div>

            <div className='absolute transform -translate-y-1/2 top-1/2 right-4'>
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
