import React, { useState } from 'react'

interface SideScrollableSectionProps {
    children: React.ReactNode
    showIndicator?: boolean
    className?: string
}

const SideScrollableSection: React.FC<SideScrollableSectionProps> = ({
    children,
    showIndicator = false,
    className = '',
}) => {
    const [showRightIndicator, setShowRightIndicator] = useState<boolean>(true)

    /**
     * 스크롤 이벤트 처리
     */
    const handleScroll = (e: React.UIEvent) => {
        const container = e.target as HTMLDivElement
        const isScrollEnd = container.scrollWidth - container.scrollLeft <= container.clientWidth + 10

        setShowRightIndicator(!isScrollEnd)
    }

    return (
        <div className={`relative ${className}`}>
            <div
                className='flex flex-row w-full gap-2 px-2 py-4 overflow-x-auto scrollbar-thin scrollbar-gray-light scrollbar-track-gray-light'
                onScroll={handleScroll}
            >
                {children}
            </div>

            {showIndicator && showRightIndicator && (
                <div className='absolute top-0 right-0 flex items-center justify-end w-16 h-full pointer-events-none bg-gradient-to-l from-white to-transparent'>
                    <div className='flex items-center justify-center w-8 h-8 mr-2 bg-white rounded-full shadow-sm bg-opacity-70'>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='w-5 h-5 text-gray-500'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                        >
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SideScrollableSection
