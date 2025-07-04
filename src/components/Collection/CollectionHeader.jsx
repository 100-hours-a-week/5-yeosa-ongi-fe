import { RotateCcw, Trash2 } from 'lucide-react'

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
    hasButtons,
}) => {
    return (
        <div className='flex items-center justify-between h-10 m-4'>
            <p className='text-sm text-gray-dark'>총 {currentCollection?.count || pictures.length}개의 사진</p>

            {hasButtons ? (
                isSelectMode ? (
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
                            <RotateCcw className='w-5 h-5 text-gray-500' />
                        </button>
                        <button
                            onClick={() => {
                                setIsSelectMode(true)
                            }}
                        >
                            <Trash2 className='w-5 h-5 text-gray-500' />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => {
                            setIsSelectMode(true)
                        }}
                    >
                        <Trash2 className='w-5 h-5 text-gray-500' />
                    </button>
                )
            ) : (
                ' '
            )}
        </div>
    )
}

export default CollectionHeader
