import { formatTime } from '@/utils/timeUtils'
import { Edit3, Trash2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

interface Comment {
    commentId: string
    userName: string
    userProfile?: string
    content: string
    createdAt: string
}

interface CommentItemProps {
    comment: Comment
    userName?: string
    className?: string
    onEdit?: (commentId: string, newContent: string) => void
    onDelete?: (commentId: string) => void
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, userName, className = '', onEdit, onDelete }) => {
    const [slideOffset, setSlideOffset] = useState(0)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSliding, setIsSliding] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(comment.content)

    const startX = useRef(0)
    const currentX = useRef(0)
    const isDragging = useRef(false)
    const slideOffsetRef = useRef(0)

    const actionButtonsRef = useRef<HTMLDivElement>(null)
    const commentRef = useRef<HTMLDivElement>(null)

    const maxSlideDistance = 120
    const isMyComment = userName && comment.userName === userName

    // 👉 외부 클릭 시 메뉴 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            const target = (event instanceof MouseEvent ? event.target : event.touches[0]?.target) as Node

            if (target && isMenuOpen && actionButtonsRef.current && !actionButtonsRef.current.contains(target)) {
                closeSlide()
            }
        }

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside, true)
            document.addEventListener('touchstart', handleClickOutside, true)
            return () => {
                document.removeEventListener('mousedown', handleClickOutside, true)
                document.removeEventListener('touchstart', handleClickOutside, true)
            }
        }
    }, [isMenuOpen])

    // 👉 slideOffset 동기화
    const updateSlideOffset = (offset: number) => {
        slideOffsetRef.current = offset
        setSlideOffset(offset)
    }

    // 👉 드래그 시작
    const handleStart = (clientX: number) => {
        if (!isMyComment || isEditing) return

        startX.current = clientX
        currentX.current = clientX
        isDragging.current = true
        setIsSliding(true)
    }

    // 👉 드래그 중
    const handleMove = (clientX: number) => {
        if (!isDragging.current) return

        currentX.current = clientX
        const deltaX = startX.current - currentX.current

        const newOffset = isMenuOpen
            ? Math.max(maxSlideDistance - deltaX, 0)
            : Math.min(Math.max(deltaX, 0), maxSlideDistance)

        updateSlideOffset(newOffset)
    }

    // 👉 드래그 끝
    const handleEnd = () => {
        if (!isDragging.current) return

        isDragging.current = false
        setIsSliding(false)

        if (slideOffsetRef.current > maxSlideDistance / 2) {
            updateSlideOffset(maxSlideDistance)
            setIsMenuOpen(true)
        } else {
            updateSlideOffset(0)
            setIsMenuOpen(false)
        }
    }

    // 👉 마우스 이벤트
    const handleMouseDown = (e: React.MouseEvent) => {
        handleStart(e.clientX)
        if (!isMyComment || isEditing) return

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX)

    const handleMouseUp = () => {
        handleEnd()
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
    }

    // 👉 터치 이벤트
    const handleTouchStart = (e: React.TouchEvent) => {
        handleStart(e.touches[0].clientX)
        if (!isMyComment || isEditing) return

        document.addEventListener('touchmove', handleTouchMove)
        document.addEventListener('touchend', handleTouchEnd)
    }

    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX)

    const handleTouchEnd = () => {
        handleEnd()
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
    }

    // 👉 슬라이드 닫기
    const closeSlide = () => {
        updateSlideOffset(0)
        setIsMenuOpen(false)
    }

    // 👉 수정 시작
    const handleEditStart = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsEditing(true)
        closeSlide()
    }

    // 👉 수정 저장
    const handleEditSave = () => {
        const trimmedContent = editContent.trim()
        if (onEdit && trimmedContent && trimmedContent !== comment.content) {
            onEdit(comment.commentId, trimmedContent)
            setIsEditing(false)
        }
    }

    // 👉 수정 취소
    const handleEditCancel = () => {
        setEditContent(comment.content)
        setIsEditing(false)
    }

    // 👉 삭제
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (onDelete) {
            onDelete(comment.commentId)
        }
        closeSlide()
    }

    // 👉 메뉴 버튼 클릭
    const handleMenuButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (isMenuOpen) {
            closeSlide()
        } else {
            updateSlideOffset(maxSlideDistance)
            setIsMenuOpen(true)
        }
    }

    return (
        <div ref={commentRef} id={`comment-${comment.commentId}`} className={`relative overflow-hidden ${className}`}>
            {/* 액션 버튼 */}
            {isMyComment && (
                <div ref={actionButtonsRef} className='absolute top-0 bottom-0 right-0 flex items-center'>
                    <button
                        onClick={handleEditStart}
                        className='flex items-center justify-center h-full px-4 text-white bg-gray-400'
                        style={{ width: '60px' }}
                    >
                        <Edit3 size={16} className='text-blue-100' />
                    </button>
                    <button
                        onClick={handleDelete}
                        className='flex items-center justify-center h-full px-4 text-white bg-red-500 hover:bg-red-600'
                        style={{ width: '60px' }}
                    >
                        <Trash2 size={16} className='text-red-100' />
                    </button>
                </div>
            )}

            {/* 메인 컨텐츠 */}
            <div
                className={`relative bg-white ${isSliding ? '' : 'transition-transform duration-300 ease-out'}`}
                style={{
                    transform: `translateX(-${slideOffset}px)`,
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <div className='flex items-start py-2 space-x-3'>
                    <img
                        src={comment.userProfile || '/default-avatar.png'}
                        alt={comment.userName}
                        className='w-8 h-8 rounded-full'
                    />
                    <div className='flex-1 min-w-0'>
                        <div className='flex items-center space-x-2'>
                            <span className='text-sm font-semibold text-gray-900'>{comment.userName}</span>
                            <span className='text-xs text-gray-500'>{formatTime(comment.createdAt)}</span>
                        </div>

                        {isEditing ? (
                            <div className='mt-2 space-y-2'>
                                <textarea
                                    value={editContent}
                                    onChange={e => setEditContent(e.target.value)}
                                    className='w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:border-primary'
                                    rows={2}
                                    autoFocus
                                />
                                <div className='flex justify-end space-x-2'>
                                    <button
                                        onClick={handleEditSave}
                                        disabled={!editContent.trim() || editContent.trim() === comment.content}
                                        className={`px-3 py-1 text-xs text-white rounded ${
                                            !editContent.trim() || editContent.trim() === comment.content
                                                ? 'bg-primary cursor-not-allowed'
                                                : 'bg-primaryBold'
                                        }`}
                                    >
                                        저장
                                    </button>
                                    <button
                                        onClick={handleEditCancel}
                                        className='px-3 py-1 text-xs text-white bg-gray-300 rounded hover:bg-gray-400'
                                    >
                                        취소
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className='mt-1 text-sm text-gray-700 break-words'>{comment.content}</p>
                        )}
                    </div>

                    {isMyComment && !isEditing && (
                        <button
                            onClick={handleMenuButtonClick}
                            className='p-1 text-gray-400 rounded hover:text-gray-600'
                        >
                            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                                <path d='M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z' />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CommentItem
