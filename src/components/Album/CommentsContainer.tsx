import { useAlbumComments, useCreateComment, useDeleteComment, useUpdateComment } from '@/hooks/useAlbum'
import useModal from '@/hooks/useModal'
import useAuthStore from '@/stores/authStore'
import { useCallback, useEffect, useRef, useState } from 'react'
import ConfirmModal from '../common/ConfirmModal'
import { Modal } from '../common/Modal'
import CommentItem from './CommentItem'

interface Comment {
    commentId: string
    userName: string
    userProfile?: string
    content: string
    createdAt: string
}

interface CommentsContainerProps {
    albumId: string
    isOpen: boolean
    onClose: () => void
    onHeightChange?: (height: number) => void
}

const CommentsContainer = ({ albumId, isOpen, onClose, onHeightChange }: CommentsContainerProps) => {
    const headerHeight = 56
    const screenHeight = window.innerHeight - headerHeight

    const minHeight = Math.round(screenHeight * 0.7)
    const maxHeight = Math.round(screenHeight)

    const heights = [minHeight, maxHeight]

    const [currentHeightIndex, setCurrentHeightIndex] = useState(0)
    const [isResizing, setIsResizing] = useState(false)
    const [tempHeight, setTempHeight] = useState(heights[0])
    const [isVisible, setIsVisible] = useState(false)
    const [newComment, setNewComment] = useState('')

    const { user } = useAuthStore()
    const startY = useRef(0)
    const startHeight = useRef(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const getCurrentHeight = () => (isResizing ? tempHeight : heights[currentHeightIndex])

    // ✅ React Query hooks
    const { data: commentsData, isLoading: isCommentsLoading, error: commentsError } = useAlbumComments(albumId)

    const createCommentMutation = useCreateComment({
        onSuccess: () => {
            setNewComment('')
            console.log('댓글 작성 성공')
            // 포커스 유지
            if (inputRef.current) {
                inputRef.current.focus()
            }
        },
        onError: error => {
            console.error('댓글 작성 실패:', error)
            alert('댓글 작성에 실패했습니다.')
        },
    })

    const updateCommentMutation = useUpdateComment({
        onSuccess: () => {
            console.log('댓글 수정 성공')
        },
        onError: error => {
            console.error('댓글 수정 실패:', error)
            alert('댓글 수정에 실패했습니다.')
        },
    })

    const deleteCommentMutation = useDeleteComment({
        onSuccess: () => {
            console.log('댓글 삭제 성공')
            closeModal()
        },
        onError: error => {
            console.error('댓글 삭제 실패:', error)
            alert('댓글 삭제에 실패했습니다.')
            closeModal()
        },
    })

    // ✅ 댓글 데이터 처리
    const comments = commentsData || []

    const { isOpen: isModalOpen, modalData, openModal, closeModal } = useModal()

    // 컨테이너 열기/닫기 애니메이션 처리
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true)
            setCurrentHeightIndex(0)
        } else {
            const timer = setTimeout(() => {
                setIsVisible(false)
                setNewComment('')
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    // ✅ 개선된 댓글 추가 처리
    const handleSubmitComment = () => {
        const trimmedComment = newComment.trim()

        // 유효성 검사
        if (!trimmedComment) return
        if (createCommentMutation.isPending) return

        // mutation 실행
        createCommentMutation.mutate({
            albumId,
            comment: trimmedComment,
        })
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

    // ✅ 개선된 댓글 수정 처리
    const handleEditComment = (commentId: string, newContent: string) => {
        const trimmedContent = newContent.trim()

        if (!trimmedContent) {
            alert('댓글 내용을 입력해주세요.')
            return
        }

        if (updateCommentMutation.isPending) {
            return
        }

        updateCommentMutation.mutate({
            albumId,
            commentId,
            comment: trimmedContent,
        })
    }

    // ✅ 개선된 댓글 삭제 처리
    const handleDeleteComment = (commentId: string) => {
        if (deleteCommentMutation.isPending) {
            return
        }

        deleteCommentMutation.mutate({
            albumId,
            commentId,
        })
    }

    // ✅ 로딩 상태 통합
    const isAnyMutationPending =
        createCommentMutation.isPending || updateCommentMutation.isPending || deleteCommentMutation.isPending

    if (!isVisible) return null

    return (
        <>
            {/* 백드롭 */}
            <div
                className={`absolute inset-0 bg-black bg-opacity-50 z-30 ${
                    isOpen ? 'opacity-100' : 'opacity-0'
                } transition-opacity duration-300`}
                onClick={handleBackdropClick}
            />

            {/* 댓글 컨테이너 */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-xl z-50 flex flex-col ${
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
                    <button
                        onClick={handleClose}
                        className='p-1 transition-colors rounded-full hover:bg-gray-100'
                        disabled={isAnyMutationPending}
                    >
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
                <div className='flex-1 min-h-0 px-4 py-2 overflow-y-auto'>
                    {isCommentsLoading ? (
                        <div className='flex items-center justify-center py-8'>
                            <div className='w-6 h-6 border-2 border-gray-300 rounded-full animate-spin border-t-blue-500'></div>
                            <span className='ml-2 text-gray-500'>댓글을 불러오는 중...</span>
                        </div>
                    ) : commentsError ? (
                        <div className='flex items-center justify-center py-8 text-red-500'>
                            댓글을 불러오는데 실패했습니다.
                        </div>
                    ) : comments.length > 0 ? (
                        <div className='space-y-4'>
                            {[...comments].reverse().map(comment => (
                                <CommentItem
                                    key={comment.commentId}
                                    comment={comment}
                                    userName={user?.nickname}
                                    onEdit={handleEditComment}
                                    onDelete={openModal}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className='flex items-center justify-center py-8 text-gray-500'>
                            첫 번째 댓글을 남겨보세요!
                        </div>
                    )}
                </div>

                {/* 댓글 입력 영역 */}
                <div className='flex-shrink-0 p-4 bg-white border-t border-gray-200'>
                    <div className='flex items-center space-x-3'>
                        <input
                            ref={inputRef}
                            type='text'
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder='댓글을 입력하세요...'
                            disabled={createCommentMutation.isPending}
                            className='flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-primary disabled:bg-gray-100'
                        />
                        <button
                            onClick={handleSubmitComment}
                            disabled={!newComment.trim() || createCommentMutation.isPending}
                            className='font-semibold text-primaryBold disabled:text-primary disabled:cursor-not-allowed'
                        >
                            {createCommentMutation.isPending ? '전송중...' : '게시'}
                        </button>
                    </div>
                </div>
            </div>

            {/* 삭제 확인 모달 */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={modalData}>
                {modalData && (
                    <ConfirmModal
                        title='댓글 삭제'
                        content='댓글을 삭제하시겠습니까?'
                        handleConfirm={() => handleDeleteComment(modalData)}
                        closeModal={closeModal}
                    />
                )}
            </Modal>
        </>
    )
}

export default CommentsContainer
