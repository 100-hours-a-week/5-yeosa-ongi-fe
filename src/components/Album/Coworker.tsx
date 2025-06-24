interface CoworkerProps {
    userId: string
    nickname: string
    profileImageURL: string
    role: string
    isOwner: string
    handleRemove: (userId: string) => void
}

const Coworker = ({ userId, nickname, profileImageURL, role, isOwner, handleRemove }: CoworkerProps) => {
    const handleRemoveClick = () => {
        handleRemove(userId)
        // Remove 버튼 클릭 시 로직 추가
    }

    return (
        <div className='flex items-center justify-between px-2 py-3 border-b border-gray-100 last:border-b-0'>
            {/* 프로필 이미지와 정보 */}
            <div className='flex items-center space-x-3'>
                <div className='flex-shrink-0 w-8 h-8 overflow-hidden bg-gray-200 rounded-full'>
                    {profileImageURL ? (
                        <img src={profileImageURL} alt={nickname} className='object-cover w-full h-full' />
                    ) : (
                        <div className='flex items-center justify-center w-full h-full font-semibold text-white text-md bg-primary'>
                            {nickname ? nickname.charAt(0).toUpperCase() : '?'}
                        </div>
                    )}
                </div>

                <div className='flex flex-col'>
                    <div className='text-sm font-medium text-gray-900'>{nickname || 'Unknown User'}</div>
                    <div className='text-xs text-gray-500'>{role || ''}</div>
                </div>
            </div>

            {/* 버튼 */}
            <div>
                {isOwner && isOwner === 'OWNER' && role !== 'OWNER' ? (
                    <button
                        onClick={handleRemoveClick}
                        className='px-2 py-1 text-xs text-red-600 transition-colors duration-200 border border-red-200 rounded-lg hover:bg-red-50'
                    >
                        Remove
                    </button>
                ) : (
                    ''
                )}
            </div>
        </div>
    )
}

export default Coworker
