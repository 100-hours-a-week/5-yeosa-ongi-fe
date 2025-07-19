import { useToggleLike } from '@/queries/album/mutations'
import { useAlbumLikes } from '@/queries/album/queries'
import { FC } from 'react'

export interface LikeButtonProps {
    albumId: string
    showCount?: boolean
}

const LikeButton: FC<LikeButtonProps> = ({ albumId, showCount = true }) => {
    const { data: likesData, isLoading: isLikesLoading, error: likesError } = useAlbumLikes(albumId)
    const toggleLikeMutation = useToggleLike()

    // 좋아요 클릭 핸들러
    const handleLikeClick = async () => {
        if (isLikesLoading || !!likesError) {
            // 낙관적 업데이트이므로 mutation.isPending은 체크하지 않음
            return
        }
        toggleLikeMutation.mutate(albumId)
    }

    // 안전한 데이터 추출
    const isLiked = likesData?.isLike || false
    const likeCount = likesData?.like || 0
    const isDisabled = isLikesLoading || toggleLikeMutation.isPending || !!likesError

    // 로딩 중이거나 에러일 때 초기값 사용

    return (
        <button
            onClick={handleLikeClick}
            disabled={isDisabled}
            className={`flex items-center gap-1 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed  w-12`}
        >
            {/* 하트 아이콘 */}
            <div className='relative'>
                {/* 로딩 스피너 오버레이 */}
                {(isLikesLoading || toggleLikeMutation.isPending) && (
                    <div className='absolute inset-0 flex items-center justify-center'>
                        <div className='w-3 h-3 border border-gray-300 rounded-full border-t-primary animate-spin'></div>
                    </div>
                )}

                {/* 하트 아이콘 */}
                <svg
                    className={`w-5 h-5 transition-all duration-300 ${
                        isLiked ? 'text-primaryBold fill-current' : 'text-gray-600 hover:text-primary'
                    } ${isLikesLoading || toggleLikeMutation.isPending ? 'opacity-30' : 'opacity-100'}`}
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
            </div>

            {/* 좋아요 개수 */}
            {showCount && (
                <span
                    className={`text-sm font-medium text-gray-700 transition-colors duration-200 ${
                        isLikesLoading || toggleLikeMutation.isPending ? 'opacity-50' : 'opacity-100'
                    }`}
                >
                    {isLikesLoading ? '--' : likeCount}
                </span>
            )}

            {/* 에러 상태 표시 (선택적) */}
            {likesError && (
                <span className='ml-1 text-xs text-red-500' title='좋아요 정보를 불러올 수 없습니다'>
                    !
                </span>
            )}
        </button>
    )
}

export default LikeButton
