import { useRef } from 'react'
import AlbumItem from './AlbumItem'

export interface AlbumItemsProps {
    albumIds: string[]
    title: string
    handleOutsideClick: () => void
}

const AlbumItems = ({ albumIds, title, handleOutsideClick }: AlbumItemsProps) => {
    const monthRef = useRef<HTMLDivElement>(null)
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

    return (
        <div ref={monthRef} className='mb-6'>
            {/* 월별 헤더 */}
            <div className='sticky top-0 z-10 pb-2 mb-3 border-b border-gray-100 bg-white/90 backdrop-blur-sm'>
                <h3 className='px-4 text-lg font-semibold text-gray-800'>{title}</h3>
                <div className='px-4 text-sm text-gray-500'>{albumIds.length}개의 앨범</div>
            </div>

            {/* 앨범 리스트 */}
            <div className='px-4 space-y-3'>
                {albumIds.map((id, index) => (
                    <AlbumItem id={id} />
                ))}
            </div>

            {/* 빈 상태 */}
            {albumIds.length === 0 && (
                <div className='flex flex-col items-center justify-center px-4 py-12'>
                    <div className='flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full'>
                        <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                            />
                        </svg>
                    </div>
                    <p className='text-center text-gray-500'>이 달에는 앨범이 없습니다</p>
                </div>
            )}
        </div>
    )
}

export default AlbumItems
