import React from 'react'

interface CommentButtonProps {
    commentCount?: number
    showCount?: boolean
    className?: string
    onClick: () => void
}

const CommentButton: React.FC<CommentButtonProps> = ({
    commentCount = 0,
    showCount = true,
    className = '',
    onClick,
}) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center w-12 gap-1 transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
        >
            {/* 댓글 아이콘 */}
            <svg
                className='w-5 h-5 text-gray-600 transition-colors duration-200 hover:text-blue-500'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                strokeWidth={2}
            >
                <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                />
            </svg>

            {/* 댓글 개수 */}
            {showCount && (
                <span className='text-sm font-medium text-gray-700 transition-colors duration-200'>
                    {commentCount.toLocaleString()}
                </span>
            )}
        </button>
    )
}

export default CommentButton
