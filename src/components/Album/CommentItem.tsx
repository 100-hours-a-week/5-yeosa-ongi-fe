import { formatTime } from '@/utils/formatTime'
import React, { useEffect, useRef, useState } from 'react'

interface Comment {
    id: string
    userName: string
    userProfile?: string
    content: string
    createdAt: string
}

interface CommentItemProps {
    comment: Comment
    userName?: string // 현재 사용자명 (본인 댓글 구분용)
    className?: string
    onEdit?: (commentId: string, newContent: string) => void
    onDelete?: (commentId: string) => void
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, userName, className = '', onEdit, onDelete }) => {
    const [isSliding, setIsSliding] = useState(false)
    const [slideOffset, setSlideOffset] = useState(0)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(comment.content)

    const startX = useRef(0)
    const currentX = useRef(0)
    const isDragging = useRef(false)
    const commentRef = useRef<HTMLDivElement>(null) // 댓글 컨테이너 ref
    const maxSlideDistance = 120 // 슬라이드 최대 거리

    // 본인 댓글인지 확인
    const isMyComment = userName && comment.userName === userName

    // 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            let target: EventTarget | null = null

            if (event instanceof MouseEvent) {
                target = event.target
            } else if (event instanceof TouchEvent) {
                target = event.touches[0]?.target || event.target
            }

            // 메뉴가 열려있고, 클릭한 곳이 현재 댓글 외부인 경우
            if (isMenuOpen && commentRef.current && target && !commentRef.current.contains(target as Node)) {
                closeSlide()
            }
        }

        const handleMouseDown = (event: MouseEvent) => handleClickOutside(event)
        const handleTouchStart = (event: TouchEvent) => handleClickOutside(event)

        // 메뉴가 열려있을 때만 이벤트 리스너 추가
        if (isMenuOpen) {
            document.addEventListener('mousedown', handleMouseDown)
            document.addEventListener('touchstart', handleTouchStart)
            return () => {
                document.removeEventListener('mousedown', handleMouseDown)
                document.removeEventListener('touchstart', handleTouchStart)
            }
        }
    }, [isMenuOpen])

    // 터치/마우스 시작
    const handleStart = (clientX: number) => {
        if (isEditing) return
        startX.current = clientX
        currentX.current = clientX
        isDragging.current = true
        setIsSliding(true)
    }

    // 터치/마우스 이동
    const handleMove = (clientX: number) => {
        if (!isDragging.current || isEditing) return

        currentX.current = clientX
        const deltaX = startX.current - currentX.current

        // 메뉴가 열린 상태에서는 닫는 방향으로만 이동 가능
        if (isMenuOpen) {
            if (deltaX < maxSlideDistance) {
                const newOffset = Math.max(deltaX, 0)
                setSlideOffset(newOffset)
            }
        } else {
            // 메뉴가 닫힌 상태에서는 오른쪽으로만 슬라이드 가능 (왼쪽으로 당기기)
            if (deltaX > 0) {
                const newOffset = Math.min(deltaX, maxSlideDistance)
                setSlideOffset(newOffset)
            }
        }
    }

    // 터치/마우스 끝
    const handleEnd = () => {
        if (!isDragging.current) return

        isDragging.current = false
        setIsSliding(false)

        // 절반 이상 슬라이드하면 메뉴 열고 유지
        if (slideOffset > maxSlideDistance / 2) {
            setSlideOffset(maxSlideDistance)
            setIsMenuOpen(true)
        } else if (slideOffset > 0) {
            // 약간만 슬라이드했으면 닫기
            setSlideOffset(0)
            setIsMenuOpen(false)
        }
        // 이미 열린 상태에서는 유지
    }

    // 마우스 이벤트
    const handleMouseDown = (e: React.MouseEvent) => {
        handleStart(e.clientX)
    }

    const handleMouseMove = (e: MouseEvent) => {
        handleMove(e.clientX)
    }

    const handleMouseUp = () => {
        handleEnd()
    }

    // 터치 이벤트
    const handleTouchStart = (e: React.TouchEvent) => {
        handleStart(e.touches[0].clientX)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        handleMove(e.touches[0].clientX)
    }

    const handleTouchEnd = () => {
        handleEnd()
    }

    // 전역 이벤트 리스너
    useEffect(() => {
        if (isDragging.current) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            return () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
            }
        }
    }, [isDragging.current])

    // 슬라이드 닫기
    const closeSlide = () => {
        setSlideOffset(0)
        setIsMenuOpen(false)
    }

    // 수정 시작
    const handleEditStart = () => {
        setIsEditing(true)
        closeSlide()
    }

    // 수정 완료
    const handleEditSave = () => {
        if (onEdit && editContent.trim() !== comment.content) {
            onEdit(comment.id, editContent.trim())
        }
        setIsEditing(false)
    }

    // 수정 취소
    const handleEditCancel = () => {
        setEditContent(comment.content)
        setIsEditing(false)
    }

    // 삭제
    const handleDelete = () => {
        if (onDelete) {
            onDelete(comment.id)
        }
        closeSlide()
    }

    // (...) 버튼 클릭
    const handleMenuButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation() // 이벤트 전파 중단

        if (isMenuOpen) {
            closeSlide()
        } else {
            setSlideOffset(maxSlideDistance)
            setIsMenuOpen(true)
        }
    }

    // 댓글 영역 클릭 시 메뉴 닫기
    const handleCommentClick = () => {
        if (isMenuOpen) {
            closeSlide()
        }
    }

    return (
        <div ref={commentRef} id={`comment-${comment.id}`} className={`relative overflow-hidden ${className}`}>
            {/* 배경 액션 버튼들 */}
            {isMyComment && (
                <div className='absolute top-0 bottom-0 right-0 flex items-center'>
                    <button
                        onClick={handleEditStart}
                        className='h-full px-4 font-medium text-white transition-colors bg-blue-500 hover:bg-blue-600'
                        style={{ width: '60px' }}
                    >
                        수정
                    </button>
                    <button
                        onClick={handleDelete}
                        className='h-full px-4 font-medium text-white transition-colors bg-red-500 hover:bg-red-600'
                        style={{ width: '60px' }}
                    >
                        삭제
                    </button>
                </div>
            )}

            {/* 메인 댓글 컨텐츠 */}
            <div
                className={`relative bg-white ${isSliding ? '' : 'transition-transform duration-300 ease-out'}`}
                style={{
                    transform: `translateX(-${slideOffset}px)`,
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleCommentClick}
            >
                <div className='flex items-start py-2 space-x-3'>
                    <img
                        src={comment.userProfile || '/default-avatar.png'}
                        alt={comment.userName}
                        className='flex-shrink-0 w-8 h-8 rounded-full'
                    />
                    <div className='flex-1 min-w-0'>
                        <div className='flex items-center space-x-2'>
                            <span
                                className={`text-sm font-semibold ${isMyComment ? 'text-blue-600' : 'text-gray-900'}`}
                            >
                                {comment.userName}
                                {isMyComment && <span className='ml-1 text-xs text-blue-500'>(나)</span>}
                            </span>
                            <span className='text-xs text-gray-500'>{formatTime(comment.createdAt)}</span>
                        </div>

                        {/* 댓글 내용 또는 수정 입력창 */}
                        {isEditing ? (
                            <div className='mt-2 space-y-2'>
                                <textarea
                                    value={editContent}
                                    onChange={e => setEditContent(e.target.value)}
                                    className='w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:border-blue-500'
                                    rows={2}
                                    autoFocus
                                />
                                <div className='flex space-x-2'>
                                    <button
                                        onClick={handleEditSave}
                                        className='px-3 py-1 text-xs text-white transition-colors bg-blue-500 rounded hover:bg-blue-600'
                                    >
                                        저장
                                    </button>
                                    <button
                                        onClick={handleEditCancel}
                                        className='px-3 py-1 text-xs text-white transition-colors bg-gray-500 rounded hover:bg-gray-600'
                                    >
                                        취소
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className='mt-1 text-sm text-gray-700 break-words'>{comment.content}</p>
                        )}
                    </div>

                    {/* (...) 메뉴 버튼 - 본인 댓글일 때만 표시 */}
                    {isMyComment && !isEditing && (
                        <button
                            onClick={handleMenuButtonClick}
                            className='flex-shrink-0 p-1 text-gray-400 transition-colors rounded hover:text-gray-600'
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
