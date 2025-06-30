import { controllLikes } from '@/api/album'
import React, { useEffect, useState } from 'react'

interface LikeButtonProps {
    albumId: string
    initialLiked?: boolean
    initialCount?: number
    showCount?: boolean
    className?: string
    onLikeChange?: (liked: boolean, count: number) => void
}

const LikeButton: React.FC<LikeButtonProps> = ({
    albumId,
    initialLiked = false,
    initialCount = 0,
    showCount = true,
    className = '',
    onLikeChange,
}) => {
    const [isLiked, setIsLiked] = useState(initialLiked)
    const [likeCount, setLikeCount] = useState(initialCount)
    const [isAnimating, setIsAnimating] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // API 호출 함수들
    const toggleLike = async () => {
        if (isLoading) return

        setIsLoading(true)
        try {
            const response = await controllLikes(albumId)
        } catch (error) {
            console.error('좋아요 API 오류:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    // 좋아요 상태 로드
    const loadLikeStatus = async () => {
        try {
            const response = await controllLikes(albumId)
            setIsLiked(response.data.liked)
            setLikeCount(response.data.likeCount)
            await controllLikes(albumId)
        } catch (error) {
            console.error('좋아요 상태 로드 오류:', error)
        }
    }

    // 컴포넌트 마운트 시 좋아요 상태 로드
    useEffect(() => {
        loadLikeStatus()
    }, [albumId])

    // 좋아요 클릭 핸들러
    const handleLikeClick = async () => {
        if (isLoading) return

        // 애니메이션 시작
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 300)

        // 낙관적 업데이트 (UI 먼저 변경)
        const newLiked = !isLiked
        const newCount = newLiked ? likeCount + 1 : likeCount - 1

        setIsLiked(newLiked)
        setLikeCount(newCount)

        // 부모 컴포넌트에 변경 알림
        if (onLikeChange) {
            onLikeChange(newLiked, newCount)
        }

        try {
            // API 호출
            await toggleLike()
        } catch (error) {
            // API 실패 시 롤백
            setIsLiked(!newLiked)
            setLikeCount(newLiked ? likeCount - 1 : likeCount + 1)
            if (onLikeChange) {
                onLikeChange(!newLiked, newLiked ? likeCount - 1 : likeCount + 1)
            }
        }
    }

    return (
        <button
            onClick={handleLikeClick}
            disabled={isLoading}
            className={`flex items-center gap-1 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {/* 하트 아이콘 */}
            <div className='relative'>
                <svg
                    className={`w-5 h-5 transition-all duration-300 ${
                        isLiked ? 'text-primaryBold fill-current' : 'text-gray-600 hover:text-primary'
                    } ${isAnimating ? 'animate-bounce' : ''}`}
                    fill={isLiked ? 'currentColor' : 'none'}
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    strokeWidth={isLiked ? 0 : 2}
                >
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'
                    />
                </svg>

                {/* 좋아요 애니메이션 이펙트 */}
                {isAnimating && isLiked && (
                    <div className='absolute inset-0 animate-ping'>
                        <svg className='w-5 h-5 opacity-75 text-primary' fill='currentColor' viewBox='0 0 24 24'>
                            <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' />
                        </svg>
                    </div>
                )}
            </div>

            {/* 좋아요 개수 */}
            {showCount && (
                <span className='text-sm font-medium text-gray-700 transition-colors duration-200'>
                    {likeCount.toLocaleString()}
                </span>
            )}
        </button>
    )
}

export default LikeButton
