import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'

export const AlbumLayout: React.FC<{
    postCount?: number
    showCategory?: boolean
    showCluster?: boolean
    showReview?: boolean
    shimmer?: boolean
}> = () => (
    <>
        <SkeletonTheme baseColor='#f3f4f6' highlightColor='#ffffff'>
            <div className='p-4 space-y-6'>
                {/* 제목 */}
                <Skeleton width='60%' height={24} />

                {/* 메인 이미지 */}
                <Skeleton height={300} />

                {/* 액션 버튼들 */}
                <div className='flex space-x-4'>
                    <Skeleton width={32} height={32} />
                    <Skeleton width={32} height={32} />
                </div>
            </div>
        </SkeletonTheme>
    </>
)
