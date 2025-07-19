import { useAlbumDetail } from '@/queries/album'
import { useAlbumStore } from '@/stores/mainPageStore'
import { useEffect, useRef, useState } from 'react'
import { LikeButton } from '../Album'
import OptimizedImage from '../common/OptimizedImage'

const AlbumItem = ({ id }: { id: string }) => {
    const { albums } = useAlbumStore()
    const album = albums[id.toString()]
    const [isLiked, setIsLiked] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [shouldLoadDetail, setShouldLoadDetail] = useState(false)
    const itemRef = useRef<HTMLDivElement>(null)

    // Intersection Observer로 뷰포트 진입 감지
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    setTimeout(() => setShouldLoadDetail(true), 100)
                }
            },
            {
                rootMargin: '50px',
                threshold: 0.1,
            }
        )

        if (itemRef.current) {
            observer.observe(itemRef.current)
        }

        return () => observer.disconnect()
    }, [])

    // 조건부 상세 정보 로드
    const { data: albumDetail, isLoading: isDetailLoading } = useAlbumDetail(id, {
        enabled: shouldLoadDetail && !!id,
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
    })

    const handleLikeToggle = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsLiked(!isLiked)
    }

    // 앨범 진행 상태에 따른 배지 스타일과 아이콘 결정
    const getBadgeInfo = (state: string) => {
        switch (state) {
            case 'COMPLETED':
                return {
                    style: 'bg-green-500 text-white border border-green-600',
                    icon: (
                        <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 24 24'>
                            <path d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' />
                        </svg>
                    ),
                }
            case 'PROCESSING':
            case 'IN_PROGRESS':
                return {
                    style: 'bg-blue-500 text-white border border-blue-600',
                    icon: <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>,
                }
            case 'PENDING':
            case 'WAITING':
                return {
                    style: 'bg-yellow-500 text-white border border-yellow-600',
                    icon: (
                        <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 24 24'>
                            <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
                        </svg>
                    ),
                }
            case 'FAILED':
            case 'ERROR':
                return {
                    style: 'bg-red-500 text-white border border-red-600',
                    icon: (
                        <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 24 24'>
                            <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' />
                        </svg>
                    ),
                }
            default:
                return {
                    style: 'bg-gray-500 text-white border border-gray-600',
                    icon: <div className='w-2 h-2 bg-white rounded-full'></div>,
                }
        }
    }

    // 기본 앨범 정보가 없는 경우 스켈레톤
    if (!album) {
        return (
            <div
                ref={itemRef}
                className='flex items-center p-4 border border-gray-100 bg-gray-50 rounded-xl animate-pulse'
            >
                <div className='w-16 h-16 mr-4 bg-gray-200 rounded-lg'></div>
                <div className='flex-1'>
                    <div className='w-3/4 h-4 mb-3 bg-gray-200 rounded'></div>
                    <div className='w-1/2 h-3 bg-gray-200 rounded'></div>
                </div>
            </div>
        )
    }

    const imageCount = albumDetail?.picture?.length ?? null

    return (
        <div
            ref={itemRef}
            className='relative flex items-center pr-3 transition-all duration-300 bg-white border border-gray-100 rounded-md shadow-sm cursor-pointer group hover:shadow-md hover:border-gray-200'
        >
            {/* 앨범 썸네일 */}
            <div className='relative flex-shrink-0 mr-4'>
                <div className='relative w-20 h-20 overflow-hidden bg-gray-100 border border-gray-200 '>

                    {isVisible && (
                        <OptimizedImage
                            src={album.thumbnailURL || '/default-thumbnail.jpg'}
                            alt={`${album.albumName} 썸네일`}
                            className='object-cover w-full h-full transition-opacity duration-300'
                            lazy={true}
                            placeholder={true}
                            size='thumbnail'
                        />
                    )}

                    {!isVisible && <div className='w-full h-full bg-gray-200 rounded-lg animate-pulse' />}
                </div>

                {/* 앨범 진행 상태 배지 - DONE이 아닌 경우에만 표시 */}
                {albumDetail?.albumProcessState && albumDetail.albumProcessState !== 'DONE' && (
                    <div
                        className={`absolute p-1.5 rounded-full shadow-sm -top-1 -right-1 flex items-center justify-center ${getBadgeInfo(albumDetail.albumProcessState).style}`}
                        title={albumDetail.albumProcessState}
                    >
                        {getBadgeInfo(albumDetail.albumProcessState).icon}
                    </div>
                )}

                {/* 로딩 중 배지 */}
                {imageCount === null && isDetailLoading && shouldLoadDetail && (
                    <div className='absolute w-4 h-4 bg-gray-200 rounded animate-pulse -top-1 -right-1' />
                )}
            </div>

            {/* 앨범 정보 */}
            <div className='flex-1 min-w-0'>
                {/* 앨범 제목 */}
                <h3 className='mb-2 text-base font-semibold text-gray-800 truncate'>{album.albumName}</h3>

                {/* 날짜 정보 */}
                <div className='flex items-center mb-2 text-sm text-gray-500'>
                    <svg className='w-3 h-3 mr-1.5 flex-shrink-0' fill='currentColor' viewBox='0 0 24 24'>
                        <path d='M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z' />
                    </svg>
                    <span className='truncate'>
                        {new Date(album.createdAt || Date.now()).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                        })}
                    </span>
                    {imageCount !== null && (
                        <>
                            <span className='mx-2 text-gray-300'>•</span>
                            <span className='text-xs'>{imageCount}장</span>
                        </>
                    )}
                </div>

                {/* 공동 작업자 정보 */}
                {album?.memberProfileImageURL.length > 1 && (
                    <div className='absolute flex bottom-2 right-2'>
                        {album?.memberProfileImageURL.map((url: string, index: number) => (
                            <div
                                key={index}
                                className='overflow-hidden rounded-full'
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    marginLeft: index > 0 ? '-8px' : '0',
                                    zIndex: album.memberProfileImageURL.length - index,
                                }}
                            >
                                <OptimizedImage
                                    src={url}
                                    alt={`Collaborator ${index + 1}`}
                                    width={24}
                                    height={24}
                                    className='w-full h-full'
                                    lazy={true}
                                    placeholder={true}
                                    size='thumbnail'
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* 로딩 상태 */}
                {isDetailLoading && shouldLoadDetail && (
                    <div className='flex items-center text-xs text-gray-400'>
                        <div className='w-3 h-3 mr-1.5 border border-gray-300 border-t-gray-600 rounded-full animate-spin' />
                        <span>정보 불러오는 중...</span>
                    </div>
                )}
            </div>

            {/* 우측 좋아요 버튼 - 심플하게 */}
            <div className='flex items-center ml-4'>
                <LikeButton albumId={id} />
            </div>
        </div>
    )
}

export default AlbumItem
