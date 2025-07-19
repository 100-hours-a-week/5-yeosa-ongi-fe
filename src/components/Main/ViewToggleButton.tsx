interface ViewToggleButtonProps {
    toggleView: () => void
    view: 'LIST_VIEW' | 'MAP_VIEW'
}

const ViewToggleButton = ({ toggleView, view }: ViewToggleButtonProps) => {
    return (
        <div className='absolute top-[8px] right-4 z-10'>
            <button
                onClick={toggleView}
                className='flex items-center gap-2 px-4 py-2 transition-shadow bg-white border border-gray-300 rounded-full shadow-md hover:shadow-lg'
            >
                {view === 'LIST_VIEW' ? (
                    <>
                        <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                            <path
                                d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'
                                stroke='currentColor'
                                strokeWidth='2'
                                fill='none'
                            />
                            <circle cx='12' cy='9' r='2.5' stroke='currentColor' strokeWidth='2' fill='none' />
                        </svg>
                        <span className='text-sm font-medium'>지도</span>
                    </>
                ) : (
                    <>
                        <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                            <path d='M3 6h18M3 12h18M3 18h18' stroke='currentColor' strokeWidth='2' />
                        </svg>
                        <span className='text-sm font-medium'>목록</span>
                    </>
                )}
            </button>
        </div>
    )
}

export default ViewToggleButton
