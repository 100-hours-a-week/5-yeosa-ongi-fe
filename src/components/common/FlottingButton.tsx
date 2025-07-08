interface FlottingButtonProps {
    albumId?: string
}

const FlottingButton = ({ albumId }: FlottingButtonProps) => {
    const handleClick = () => {
        const location = albumId || 'new'
        window.location.href = `/album-editor/${location}`
    }
    return (
        <div className='absolute z-40 right-12 size-4 bottom-16'>
            <button
                className='flex items-center justify-center text-2xl text-white transition-colors rounded-full shadow-lg bg-primary w-14 h-14 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50'
                onClick={handleClick}
            >
                +
            </button>
        </div>
    )
}

export default FlottingButton
