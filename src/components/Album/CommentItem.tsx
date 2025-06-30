import { formatTime } from '@/utils/formatTime'
import React from 'react'

interface Comment {
    userName: string
    userProfile?: string
    content: string
    createdAt: string
}

interface CommentItemProps {
    comment: Comment
    userName?: string // 현재 사용자명 (본인 댓글 구분용)
    className?: string
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, userName, className = '' }) => {
    // 본인 댓글인지 확인
    const isMyComment = userName && comment.userName === userName

    return (
        <div className={`flex items-start space-x-3 ${className}`}>
            <img
                src={comment.userProfile || '/default-avatar.png'}
                alt={comment.userName}
                className='flex-shrink-0 w-8 h-8 rounded-full'
            />
            <div className='flex-1 min-w-0'>
                <div className='flex items-center space-x-2'>
                    <span className={`text-sm font-semibold ${isMyComment ? 'text-blue-600' : 'text-gray-900'}`}>
                        {comment.userName}
                        {isMyComment && <span className='ml-1 text-xs text-blue-500'>(나)</span>}
                    </span>
                    <span className='text-xs text-gray-500'>{formatTime(comment.createdAt)}</span>
                </div>
                <p className='mt-1 text-sm text-gray-700 break-words'>{comment.content}</p>
            </div>
        </div>
    )
}

export default CommentItem
