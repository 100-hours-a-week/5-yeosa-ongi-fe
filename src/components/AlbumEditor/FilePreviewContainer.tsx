import crossIcon from '@/assets/cross_icon.png'
import { useFileConversion } from '@/hooks/useFileConversion'
import { FileItem } from '@/types/upload'
import React, { useCallback } from 'react'
import FilePreview from './FilePreview'

interface FilePreviewContainerProps {
    file: FileItem
    onDelete: (fileId: string) => void
    onConverted?: (originalFile: File, convertedFile: File) => void
}

const FilePreviewContainer = React.memo<FilePreviewContainerProps>(
    ({ file, onDelete, onConverted }) => {
        // 변환 로직은 훅에 완전히 위임
        const conversionState = useFileConversion(file.file, onConverted)

        // 간단한 액션 핸들러들 (컴포넌트 고유 책임)
        const handleDelete = useCallback(() => {
            onDelete(file.id)
        }, [file.id, onDelete])

        const handleImageError = useCallback(() => {
            console.warn('이미지 로드 실패:', file.file.name)
        }, [file.file.name])

        const handleImageLoad = useCallback(() => {
            console.log('이미지 로드 성공:', file.file.name)
        }, [file.file.name])

        // 안전성 체크
        if (!file?.file) {
            return (
                <div className='relative flex items-center justify-center w-full h-full bg-gray-200'>
                    <span className='text-gray-500'>파일 오류</span>
                    <button className='absolute z-10 top-2 right-2' onClick={handleDelete}>
                        <img className='w-4 h-4' src={crossIcon} alt='삭제' />
                    </button>
                </div>
            )
        }

        // 순수 컴포넌트에 상태와 핸들러 전달
        return (
            <FilePreview
                previewUrl={conversionState.previewUrl}
                fileName={file.file.name}
                fileType={conversionState.fileType}
                isConverting={conversionState.isConverting}
                conversionError={conversionState.error}
                onDelete={handleDelete}
                onImageError={handleImageError}
                onImageLoad={handleImageLoad}
            />
        )
    },
    (prevProps, nextProps) => {
        // props 비교 최적화 (기존과 동일)
        return prevProps.file.id === nextProps.file.id && prevProps.onDelete === nextProps.onDelete
    }
)

FilePreviewContainer.displayName = 'FilePreview'

export default FilePreviewContainer
