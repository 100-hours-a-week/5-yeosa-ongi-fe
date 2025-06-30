import { addAlbumComments, getAlbumComments } from '@/api/album'
import { formatTime } from '@/utils/formatTime'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Comment {
    id: string
    userId: string
    username: string
    userAvatar?: string
    content: string
    createdAt: string
    replies?: Comment[]
}

interface CommentsContainerProps {
    albumId: string // 댓글을 불러올 게시물 ID
    isOpen: boolean
    onClose: () => void
    onHeightChange?: (height: number) => void
}

const CommentsContainer = ({ albumId, isOpen, onClose, onHeightChange }: CommentsContainerProps) => {
    const headerHeight = 56
    const screenHeight = window.innerHeight - headerHeight

    // 인스타그램과 유사한 높이 설정
    const minHeight = Math.round(screenHeight * 0.7) // 화면의 70%
    const maxHeight = Math.round(screenHeight) // 화면의 90%

    const heights = [minHeight, maxHeight]

    const [currentHeightIndex, setCurrentHeightIndex] = useState(0)
    const [isResizing, setIsResizing] = useState(false)
    const [tempHeight, setTempHeight] = useState(heights[0])
    const [isVisible, setIsVisible] = useState(false)

    // 댓글 관련 상태
    const [comments, setComments] = useState<Comment[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [newComment, setNewComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const startY = useRef(0)
    const startHeight = useRef(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const getCurrentHeight = () => (isResizing ? tempHeight : heights[currentHeightIndex])

    // 댓글 불러오기
    const loadComments = useCallback(async () => {
        if (!albumId) return

        setIsLoading(true)
        try {
            const commentsData = await getAlbumComments(albumId)
            console.log(commentsData.data)
            setComments(commentsData.data)
        } catch (error) {
            console.error('댓글 로딩 실패:', error)
        } finally {
            setIsLoading(false)
        }
    }, [albumId])

    // 컨테이너 열기/닫기 애니메이션 처리
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true)
            setCurrentHeightIndex(0)
            loadComments() // 열릴 때 댓글 로드
        } else {
            const timer = setTimeout(() => {
                setIsVisible(false)
                setComments([]) // 닫힐 때 댓글 초기화
                setNewComment('')
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen, loadComments])

    // 댓글 추가 처리
    const handleSubmitComment = async () => {
        if (!newComment.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
            const comment = await addAlbumComments(albumId, newComment.trim())
            console.log(comments)
            setComments(prev => (Array.isArray(prev) ? [...prev, comment] : [comment]))
            setNewComment('')
            if (inputRef.current) {
                inputRef.current.focus()
            }
        } catch (error) {
            console.error('댓글 추가 실패:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Enter 키로 댓글 전송
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmitComment()
        }
    }

    // 가장 가까운 높이 단계 찾기
    const findClosestHeightIndex = (height: number) => {
        let closestIndex = 0
        let minDiff = Math.abs(height - heights[0])

        for (let i = 1; i < heights.length; i++) {
            const diff = Math.abs(height - heights[i])
            if (diff < minDiff) {
                minDiff = diff
                closestIndex = i
            }
        }
        return closestIndex
    }

    // 아래로 드래그 시 닫기 처리
    const handleClose = useCallback(() => {
        onClose()
    }, [onClose])

    // 드래그 시작
    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            setIsResizing(true)
            startY.current = e.clientY
            const currentHeight = heights[currentHeightIndex]
            startHeight.current = currentHeight
            setTempHeight(currentHeight)

            const handleMouseMove = (e: MouseEvent) => {
                const deltaY = startY.current - e.clientY
                const newHeight = Math.max(100, Math.min(maxHeight, startHeight.current + deltaY))

                if (newHeight < minHeight * 0.5) {
                    handleClose()
                    return
                }

                setTempHeight(newHeight)
            }

            const handleMouseUp = () => {
                setIsResizing(false)
                setTempHeight(currentTempHeight => {
                    const closestIndex = findClosestHeightIndex(currentTempHeight)
                    setCurrentHeightIndex(closestIndex)
                    return currentTempHeight
                })

                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
            }

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            e.preventDefault()
        },
        [currentHeightIndex, heights, minHeight, maxHeight, handleClose]
    )

    // 터치 이벤트 처리
    const handleTouchStart = useCallback(
        (e: React.TouchEvent<HTMLDivElement>) => {
            setIsResizing(true)
            startY.current = e.touches[0].clientY
            const currentHeight = heights[currentHeightIndex]
            startHeight.current = currentHeight
            setTempHeight(currentHeight)

            const handleTouchMove = (e: TouchEvent) => {
                e.preventDefault()
                const deltaY = startY.current - e.touches[0].clientY
                const newHeight = Math.max(100, Math.min(maxHeight, startHeight.current + deltaY))

                if (newHeight < minHeight * 0.7) {
                    handleClose()
                    return
                }

                setTempHeight(newHeight)
            }

            const handleTouchEnd = () => {
                setIsResizing(false)
                setTempHeight(currentTempHeight => {
                    const closestIndex = findClosestHeightIndex(currentTempHeight)
                    setCurrentHeightIndex(closestIndex)
                    return currentTempHeight
                })

                document.removeEventListener('touchmove', handleTouchMove)
                document.removeEventListener('touchend', handleTouchEnd)
            }

            document.addEventListener('touchmove', handleTouchMove, { passive: false })
            document.addEventListener('touchend', handleTouchEnd)
            e.preventDefault()
        },
        [currentHeightIndex, heights, minHeight, maxHeight, handleClose]
    )

    // 백드롭 클릭 시 닫기
    const handleBackdropClick = useCallback(
        (e: React.MouseEvent) => {
            if (e.target === e.currentTarget) {
                handleClose()
            }
        },
        [handleClose]
    )

    if (!isVisible) return null

    return (
        <>
            {/* 백드롭 */}
            <div
                className={`absolute inset-0 bg-black bg-opacity-50 z-40 ${
                    isOpen ? 'opacity-100' : 'opacity-0'
                } transition-opacity duration-300`}
                onClick={handleBackdropClick}
            />

            {/* 댓글 컨테이너 */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-xl z-50 ${
                    isResizing ? '' : 'transition-all duration-300 ease-out'
                } ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
                style={{
                    height: `${getCurrentHeight()}px`,
                }}
            >
                {/* 드래그 핸들 */}
                <div
                    className={`relative h-6 cursor-row-resize flex items-center justify-center hover:bg-gray-50 rounded-t-xl select-none ${
                        isResizing ? 'bg-gray-100' : ''
                    }`}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    title='드래그해서 높이 조절 또는 닫기'
                >
                    <div className='w-10 h-1 bg-gray-300 rounded-full'></div>
                </div>

                {/* 헤더 */}
                <div className='flex items-center justify-between px-4 py-3 border-b border-gray-200'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                        댓글 {comments.length > 0 && `(${comments.length})`}
                    </h3>
                    <button onClick={handleClose} className='p-1 transition-colors rounded-full hover:bg-gray-100'>
                        <svg className='w-6 h-6 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M6 18L18 6M6 6l12 12'
                            />
                        </svg>
                    </button>
                </div>

                {/* 댓글 리스트 */}
                <div className='flex-1 px-4 py-2 overflow-y-auto'>
                    {isLoading ? (
                        <div className='flex items-center justify-center py-8'>
                            <div className='w-6 h-6 border-2 border-gray-300 rounded-full animate-spin border-t-blue-500'></div>
                        </div>
                    ) : comments.length > 0 ? (
                        <div className='space-y-4'>
                            {comments.map(comment => (
                                <div key={comment.id} className='flex items-start space-x-3'>
                                    <img
                                        src={comment.userAvatar || '/default-avatar.png'}
                                        alt={comment.username}
                                        className='flex-shrink-0 w-8 h-8 rounded-full'
                                    />
                                    <div className='flex-1 min-w-0'>
                                        <div className='flex items-center space-x-2'>
                                            <span className='text-sm font-semibold text-gray-900'>
                                                {comment.username}
                                            </span>
                                            <span className='text-xs text-gray-500'>
                                                {formatTime(comment.createdAt)}
                                            </span>
                                        </div>
                                        <p className='mt-1 text-sm text-gray-700 break-words'>{comment.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='flex items-center justify-center py-8 text-gray-500'>
                            첫 번째 댓글을 남겨보세요!
                        </div>
                    )}
                </div>

                {/* 댓글 입력 영역 */}
                <div className='p-4 border-t border-gray-200'>
                    <div className='flex items-center space-x-3'>
                        <img src='/my-avatar.png' alt='내 프로필' className='flex-shrink-0 w-8 h-8 rounded-full' />
                        <input
                            ref={inputRef}
                            type='text'
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder='댓글을 입력하세요...'
                            disabled={isSubmitting}
                            className='flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 disabled:bg-gray-100'
                        />
                        <button
                            onClick={handleSubmitComment}
                            disabled={!newComment.trim() || isSubmitting}
                            className='font-semibold text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed'
                        >
                            {isSubmitting ? '전송중...' : '게시'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CommentsContainer
