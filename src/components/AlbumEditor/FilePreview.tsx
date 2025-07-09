import { memo } from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import Icon from '../common/Icon'

export interface FilePreviewProps {
    previewUrl: string
    fileName: string
    isConverting: boolean
    conversionError: string | null
    onDelete: () => void
}

const FilePreview = memo(({ previewUrl, fileName, isConverting, conversionError, onDelete }: FilePreviewProps) => {
    return (
        <div className='relative w-full h-full'>
            {/* 변환 중일 때만 Skeleton */}
            {isConverting ? (
                <SkeletonTheme baseColor='#E0E0E0 ' highlightColor='#F0F0F0'>
                    <Skeleton
                        height='100%'
                        width='100%'
                        borderRadius={0}
                        style={{ margin: 0, padding: 0, display: 'block' }}
                        containerClassName='absolute inset-0 z-10'
                    />
                </SkeletonTheme>
            ) : (
                // 변환 중이 아닐 때 이미지
                <img src={previewUrl} alt={fileName} className='absolute inset-0 object-cover w-full h-full' />
            )}

            {/* 삭제 버튼 */}
            <button className='absolute z-20 top-2 right-2' onClick={onDelete} disabled={isConverting}>
                <Icon name='close' />
            </button>

            {/* 에러 오버레이 */}
            {conversionError && (
                <div className='absolute z-20 bottom-2 left-2 right-2'>
                    <div className='px-2 py-1 text-xs text-white bg-red-500 rounded'>{conversionError}</div>
                </div>
            )}

            {/* 파일 형식 표시
                <div className='absolute z-20 top-2 left-2'>
                    <span className='px-1 py-0.5 text-xs text-white bg-black bg-opacity-50 rounded'>{fileType}</span>
                </div> */}
        </div>
    )
})

export default FilePreview
