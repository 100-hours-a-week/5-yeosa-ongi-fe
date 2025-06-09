import iconRecovery from '@/assets/icons/icon_recovery.png'
import iconTrash from '@/assets/icons/icon_trash.png'
const CollectionHeader = ({
    currentCollection,
    pictures,
    isSelectMode,
    isRecovery,
    selectedPictures,
    setIsSelectMode,
    setIsRecovery,
    handleClick,
    handleRecoverClick,
    isCollectionShaky,
}) => {
    return (
        <div className='flex items-center justify-between h-10 m-4'>
            <p className='text-sm text-gray-dark'>총 {currentCollection?.count || pictures.length}개의 사진</p>

            {isSelectMode ? (
                <button onClick={isRecovery ? handleRecoverClick : handleClick}>
                    <div className='text-sm'>완료</div>
                </button>
            ) : isCollectionShaky() ? (
                <div className='flex items-center justify-between gap-4'>
                    <button
                        onClick={() => {
                            setIsRecovery(true)
                            setIsSelectMode(true)
                        }}
                    >
                        <img src={iconRecovery} className='h-6' alt='복원' />
                    </button>
                    <button
                        onClick={() => {
                            setIsSelectMode(true)
                        }}
                    >
                        <img src={iconTrash} className='h-6' alt='삭제' />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => {
                        setIsSelectMode(true)
                    }}
                >
                    <img src={iconTrash} className='h-4' alt='삭제' />
                </button>
            )}
        </div>
    )
}

export default CollectionHeader
