import { FileInput, FilePreviewContainer } from '@/components/AlbumEditor'
import { useToast } from '@/contexts/ToastContext'
import { useExperimentTracking } from '@/hooks/useExperimentTracking'
import { fileSelectors, useFileCount, useFileProcessing, useFileStore } from '@/stores/fileStore'
import { memo, useCallback, useEffect } from 'react'
import { GridWithChildren } from '../common/GridWithChildren'

const FileManager = memo(() => {
    const { error: errorToast } = useToast()

    const files = useFileStore(fileSelectors.files)
    const { count, isValid: isFileValid, maxFiles, isFull } = useFileCount()
    const { isProcessing } = useFileProcessing()

    const addFiles = useFileStore(state => state.addFiles)
    const removeFile = useFileStore(state => state.removeFile)
    const replaceFileContent = useFileStore(state => state.replaceFileContent)
    const setProcessing = useFileStore(state => state.setProcessing)

    const { trackFile, getStats } = useExperimentTracking()

    // 파일 추가 핸들러 (원본 파일 그대로 추가)
    const handleFileAdded = useCallback(
        async (addedFiles: File | File[] | FileList) => {
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
                fileList.forEach(trackFile)
                const success = await addFiles(fileList)
                if (!success) {
                    // 에러는 스토어에서 설정되므로 여기서는 추가 처리 없음
                    console.log('파일 추가 실패 또는 부분 성공')
                }
            } catch (error) {
                console.error('FileManager: Error adding files', error)
            }
        },
        [addFiles, errorToast]
    )

    // 5. 파일 변환 핸들러 - 단순해짐
    const handleFileConverted = useCallback(
        (originalFile: File, convertedFile: File) => {
            console.log('파일 변환 완료:', originalFile.name, '→', convertedFile.name)
            replaceFileContent(originalFile, convertedFile)
        },
        [replaceFileContent]
    )

    // 4. 파일 삭제 핸들러 - 단순해짐
    const handleFileDelete = useCallback(
        (fileId: string) => {
            if (!fileId) {
                console.error('FileManager: Invalid fileId for deletion')
                return
            }

            console.log('파일 삭제:', fileId)
            removeFile(fileId)
        },
        [removeFile]
    )

    // 6. 에러 핸들러
    const handleError = useCallback(
        (errorMessage: string) => {
            console.error('FileManager: Error:', errorMessage)
            errorToast(errorMessage)
        },
        [errorToast]
    )

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            const timer = setInterval(() => {
                const stats = getStats()
                if (stats?.collectedToday > 0) {
                    console.log('📊 실험 통계:', stats)
                }
            }, 10000)

            return () => clearInterval(timer)
        }
    }, [getStats])

    return (
        <div className={`file-manager `}>
            <div className='flex items-center justify-between my-2 text-sm'>
                <span className={count === maxFiles ? 'text-red-500' : ''}>
                    현재 {count}장 업로드 중. (최대 {maxFiles}장)
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
                {files.map((file, index) => {
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
                        <FilePreviewContainer
                            key={file.id}
                            file={file}
                            onDelete={handleFileDelete}
                            onConverted={handleFileConverted} // 변환 완료 콜백 전달
                        />
                    )
                })}
            </GridWithChildren>

            {/* 빈 상태 메시지 */}
            {count === 0 && !isProcessing && (
                <div className='mt-8 text-center text-gray-500'>
                    <p>업로드된 파일이 없습니다.</p>
                    <p className='mt-2 text-sm'> + 버튼을 클릭해서 이미지를 업로드해주세요.</p>
                </div>
            )}
        </div>
    )
})

FileManager.displayName = 'FileManager'

export default FileManager
