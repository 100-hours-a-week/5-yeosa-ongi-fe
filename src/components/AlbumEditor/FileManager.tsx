// components/FileManager.tsx (변환 콜백 버전)

import { FileItem } from '@/types/upload'
import { FC, useCallback, useMemo } from 'react'
import { GridWithChildren } from '../common/GridWithChildren'
import FileInput from './FileInput'
import FilePreview from './FilePreview'

interface FileManagerProps {
    files: FileItem[]
    onFileDelete: (fileId: string) => void
    onFileAdd: (files: File[] | File) => void // useFileUpload 훅에 맞춰 수정
    onFileConverted: (originalFile: File, convertedFile: File) => void
    isProcessing?: boolean
    maxFiles?: number
    className?: string
}

const FileManager: FC<FileManagerProps> = ({
    files = [],
    onFileDelete,
    onFileAdd,
    onFileConverted, // 새로운 prop
    isProcessing = false,
    maxFiles = 30,
    className = '',
}) => {
    // 안전한 파일 목록 필터링
    const safeFiles = useMemo(() => {
        if (!Array.isArray(files)) {
            console.warn('FileManager: files is not an array', files)
            return []
        }

        return files.filter((file): file is FileItem => {
            if (!file || !file.id || !file.file) {
                return false
            }

            // preview가 없는 경우 생성 시도
            if (!file.preview) {
                try {
                    file.preview = URL.createObjectURL(file.file)
                } catch (error) {
                    console.error('FileManager: Failed to create preview URL', error)
                    return false
                }
            }

            return true
        })
    }, [files])

    // 파일 추가 핸들러 (원본 파일 그대로 추가)
    const handleFileAdded = useCallback(
        (addedFiles: File | File[] | FileList) => {
            try {
                let fileList: File[] = []

                if (addedFiles instanceof FileList) {
                    fileList = Array.from(addedFiles)
                } else if (Array.isArray(addedFiles)) {
                    fileList = addedFiles
                } else if (addedFiles instanceof File) {
                    fileList = [addedFiles]
                } else {
                    console.error('FileManager: Invalid file type', typeof addedFiles, addedFiles)
                    return
                }

                console.log('FileManager: Adding files (원본 파일로 추가)', fileList.length, fileList)

                // 모든 파일을 원본 그대로 추가 (HEIC 포함)
                // addFile이 배열을 받을 수 있으므로 한 번에 전달
                if (onFileAdd) {
                    console.log(
                        '원본 파일들 추가:',
                        fileList.map(f => f.name)
                    )
                    onFileAdd(fileList) // 배열로 한 번에 전달
                } else {
                    console.error('FileManager: onFileAdd handler not provided')
                }
            } catch (error) {
                console.error('FileManager: Error adding files', error)
            }
        },
        [onFileAdd]
    )

    // 파일 변환 완료 콜백
    const handleFileConverted = useCallback(
        (originalFile: File, convertedFile: File) => {
            console.log('파일 변환 완료 알림:', originalFile.name, '→', convertedFile.name)
            console.log('변환된 파일 타입:', convertedFile.type)

            if (onFileConverted) {
                onFileConverted(originalFile, convertedFile)
            } else {
                console.warn('FileManager: onFileConverted handler not provided')
            }
        },
        [onFileConverted]
    )

    // 파일 삭제 핸들러
    const handleFileDelete = useCallback(
        (fileId: string) => {
            try {
                if (!fileId) {
                    console.error('FileManager: handleFileDelete called with invalid fileId', fileId)
                    return
                }

                if (onFileDelete) {
                    onFileDelete(fileId)
                } else {
                    console.error('FileManager: onFileDelete handler not provided')
                }
            } catch (error) {
                console.error('FileManager: Error in handleFileDelete', error)
            }
        },
        [onFileDelete]
    )

    // 에러 핸들러
    const handleError = useCallback((error: string) => {
        console.error('FileManager: File input error:', error)
    }, [])

    // processing 상태 설정
    const setProcessing = useCallback((processing: boolean) => {
        console.log('FileManager: Processing state:', processing)
    }, [])

    // 파일 개수 제한 확인
    const isFull = useMemo(() => {
        return safeFiles.length >= maxFiles
    }, [safeFiles.length, maxFiles])

    // 파일 타입별 개수 계산
    const fileTypeStats = useMemo(() => {
        const heicCount = safeFiles.filter(
            f =>
                f.file.type === 'image/heic' ||
                f.file.type === 'image/heif' ||
                f.file.name?.toLowerCase().endsWith('.heic') ||
                f.file.name?.toLowerCase().endsWith('.heif')
        ).length

        const jpegCount = safeFiles.filter(f => f.file.type === 'image/jpeg' || f.file.type === 'image/jpg').length

        return { heicCount, jpegCount, totalCount: safeFiles.length }
    }, [safeFiles])

    // 디버깅 정보
    console.log('FileManager render:', {
        filesLength: files?.length || 0,
        safeFilesLength: safeFiles.length,
        isProcessing,
        isFull,
        fileTypeStats,
    })

    return (
        <div className={`file-manager ${className}`}>
            <div className='flex items-center justify-between my-2 text-sm'>
                <span className={safeFiles.length === maxFiles ? 'text-red-500' : ''}>
                    현재 {safeFiles.length}장 업로드 중. (최대 {maxFiles}장)
                </span>
            </div>
            {/* 파일 그리드 */}
            <GridWithChildren col={4}>
                {/* 파일 입력 컴포넌트 */}
                <FileInput
                    onFileSelect={handleFileAdded}
                    disabled={isFull}
                    setProcessing={setProcessing}
                    isProcessing={isProcessing}
                    onError={handleError}
                />

                {/* 업로드된 파일들 */}
                {safeFiles.map((file, index) => {
                    if (!file || !file.id || !file.file) {
                        console.error(`FileManager: Invalid file at index ${index}`, file)
                        return (
                            <div
                                key={`error-${index}`}
                                className='flex items-center justify-center w-full h-full bg-red-100'
                            >
                                <span className='text-xs text-red-500'>파일 오류</span>
                            </div>
                        )
                    }

                    return (
                        <FilePreview
                            key={file.id}
                            file={file}
                            onDelete={handleFileDelete}
                            onConverted={handleFileConverted} // 변환 완료 콜백 전달
                        />
                    )
                })}
            </GridWithChildren>

            {/* 빈 상태 메시지 */}
            {safeFiles.length === 0 && !isProcessing && (
                <div className='mt-8 text-center text-gray-500'>
                    <p>업로드된 파일이 없습니다.</p>
                    <p className='mt-2 text-sm'> + 버튼을 클릭해서 이미지를 업로드해주세요.</p>
                </div>
            )}
        </div>
    )
}

FileManager.displayName = 'FileManager'

export default FileManager
