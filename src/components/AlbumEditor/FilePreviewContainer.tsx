import { useFileConversion } from '@/hooks/useFileConversion'
import { FileItem } from '@/types/upload'
import React, { useCallback } from 'react'
import Icon from '../common/Icon'

import FilePreview from './FilePreview'

interface FilePreviewContainerProps {
    file: FileItem
    onDelete: (fileId: string) => void
    onConverted?: (originalFile: File, convertedFile: File) => void
}

const FilePreviewContainer = React.memo<FilePreviewContainerProps>(
    ({ file, onDelete, onConverted }) => {
        const conversionState = useFileConversion(file.file, onConverted)

        const handleDelete = useCallback(() => {
            onDelete(file.id)
        }, [file.id, onDelete])

        if (!file?.file) {
            return (
                <div className='relative flex items-center justify-center w-full h-full bg-gray-200'>
                    <span className='text-gray-500'>파일 오류</span>
                    <button className='absolute z-10 top-2 right-2' onClick={handleDelete}>
                        <Icon name='close' />
                    </button>
                </div>
            )
        }

        // 순수 컴포넌트에 상태와 핸들러 전달
        return (
            <div className='relative w-full h-full will-change-transform '>
                <FilePreview
                    previewUrl={conversionState.previewUrl}
                    fileName={file.file.name}
                    fileType={conversionState.fileType}
                    isConverting={conversionState.isConverting}
                    conversionError={conversionState.error}
                    onDelete={handleDelete}
                />
            </div>
        )
    },
    (prevProps, nextProps) => {
        //TODO
        return prevProps.file.id === nextProps.file.id && prevProps.onDelete === nextProps.onDelete
    }
)

FilePreviewContainer.displayName = 'FilePreview'

export default FilePreviewContainer
