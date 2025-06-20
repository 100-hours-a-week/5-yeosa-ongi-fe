import { useToast } from '@/contexts/ToastContext'
import { FileItem } from '@/types/upload'
import { extractHEICMetadata, extractJPEGMetadata, isHEICFile } from '@/utils/metadata'
import { useCallback, useEffect, useState } from 'react'
interface UseFileUploadOptions {
    maxFiles?: number
}

interface UseFileUploadReturn {
    files: FileItem[]
    addFile: (files: File[] | File) => void
    removeFile: (id: string) => void
    updateFile: (fileId: string, updates: Partial<FileItem>) => void
    clearFiles: () => void
    error: string
    isFull: boolean
    count: number
    maxFiles: number
    isProcessing: boolean
    setProcessing: (isProcessing: boolean) => void
}

/**
 * 파일 업로드를 관리하는 커스텀 훅
 * @param {Object} options 파일 업로드 옵션
 * @param {number} options.maxFiles 최대 파일 수 (기본값: 10)
 * @returns {Object} 파일 관리 객체와 메서드
 */
const useFileUpload = (options: UseFileUploadOptions = {}): UseFileUploadReturn => {
    const { maxFiles = 10 } = options
    const [files, setFiles] = useState<FileItem[]>([])
    const [error, setError] = useState<string>('')
    const [isProcessing, setProcessing] = useState<boolean>(false)

    const { success, error: errorToast, warning, info } = useToast()

    /**
     * 입력 파일 정규화
     */
    const normalizeFileInput = useCallback((newFiles: File | File[]): File[] => {
        if (!newFiles) return []
        const filesToAdd = Array.isArray(newFiles) ? newFiles : [newFiles]
        console.log('[normalizeFileInput]', filesToAdd.length, '개 파일 정규화')
        return filesToAdd
    }, [])

    /**
     * 파일 수 제한 검증
     */
    const validateFileCount = useCallback((currentCount: number, newCount: number, maxFiles: number) => {
        const totalFiles = currentCount + newCount

        if (totalFiles <= maxFiles) {
            return {
                canAddAll: true,
                canAddSome: false,
                allowedCount: newCount,
                message: '',
            }
        } else {
            const remainingSlots = Math.max(0, maxFiles - currentCount)
            if (remainingSlots > 0) {
                const excludedCount = newCount - remainingSlots
                return {
                    canAddAll: false,
                    canAddSome: true,
                    allowedCount: remainingSlots,
                    message: `최대 ${maxFiles}장까지만 업로드할 수 있습니다. ${excludedCount}장이 제외되었습니다.`,
                }
            } else {
                return {
                    canAddAll: false,
                    canAddSome: false,
                    allowedCount: 0,
                    message: `이미 최대 파일 수(${maxFiles}장)에 도달했습니다. ${newCount}장이 추가되지 않았습니다.`,
                }
            }
        }
    }, [])

    /**
     * 단일 파일 아이템 생성
     */
    const createSingleFileItem = useCallback(async (file: File): Promise<FileItem> => {
        try {
            let metadata
            if (isHEICFile(file)) {
                console.log('HIEC 추출')
                metadata = await extractHEICMetadata(file)
            } else {
                console.log('JPG 추출')
                metadata = await extractJPEGMetadata(file)
            }
            console.log(metadata)
            const fileItem: FileItem = {
                file,
                preview: createPreviewURL(file),
                id: Math.random().toString(36).substr(2, 9),
                GPS: {
                    longitude: metadata?.gps?.longitude,
                    latitude: metadata?.gps?.latitude,
                },
                isProcessed: false,
            }

            console.log('[createSingleFileItem] 생성 완료:', file.name)
            return fileItem
        } catch (error) {
            console.error('[createSingleFileItem] 생성 실패:', file.name, error)
            throw error
        }
    }, [])

    /**
     * 여러 파일 아이템 생성
     */
    const createMultipleFileItems = useCallback(
        async (filesToProcess: File[]): Promise<FileItem[]> => {
            console.log('[createMultipleFileItems] 시작:', filesToProcess.length, '개')

            try {
                const newFileItems = await Promise.all(filesToProcess.map(file => createSingleFileItem(file)))

                console.log('[createMultipleFileItems] 완료:', newFileItems.length, '개')
                return newFileItems
            } catch (error) {
                console.error('[createMultipleFileItems] 실패:', error)
                throw error
            }
        },
        [createSingleFileItem]
    )

    const addAllFiles = useCallback(
        async (filesToAdd: File[]): Promise<boolean> => {
            try {
                console.log('[addAllFiles] 전체 파일 추가 시작:', filesToAdd.length, '개')

                const newFileItems = await createMultipleFileItems(filesToAdd)

                setFiles(prevFiles => [...prevFiles, ...newFileItems])
                setError('')

                console.log('[addAllFiles] 전체 파일 추가 완료')
                return true
            } catch (error) {
                console.error('[addAllFiles] 전체 파일 추가 실패:', error)
                setError('파일 처리 중 오류가 발생했습니다.')
                errorToast('파일 처리 중 오류가 발생했습니다.')
                return false
            }
        },
        [createMultipleFileItems]
    )

    /**
     * 6. 일부 파일만 추가 (제한 적용)
     */
    const addPartialFiles = useCallback(
        async (filesToAdd: File[], allowedCount: number, errorMessage: string): Promise<boolean> => {
            try {
                console.log('[addPartialFiles] 부분 파일 추가 시작:', allowedCount, '/', filesToAdd.length, '개')

                const filesToKeep = filesToAdd.slice(0, allowedCount)
                const newFileItems = await createMultipleFileItems(filesToKeep)

                setFiles(prevFiles => [...prevFiles, ...newFileItems])
                setError(errorMessage)

                console.log('[addPartialFiles] 부분 파일 추가 완료')
                return true
            } catch (error) {
                console.error('[addPartialFiles] 부분 파일 추가 실패:', error)
                setError('파일 처리 중 오류가 발생했습니다.')
                return false
            }
        },
        [createMultipleFileItems]
    )

    /**
     * 7. 파일 추가 거절
     */
    const rejectFiles = useCallback((errorMessage: string): boolean => {
        console.log('[rejectFiles] 파일 추가 거절:', errorMessage)
        setError(errorMessage)
        return false
    }, [])

    const addFile = useCallback(
        async (newFiles: File | File[]): Promise<boolean> => {
            // 1. 입력 정규화
            const filesToAdd = normalizeFileInput(newFiles)
            if (filesToAdd.length === 0) return false

            // 2. 파일 수 검증
            const validation = validateFileCount(files.length, filesToAdd.length, maxFiles)

            // 3. 검증 결과에 따라 적절한 함수 호출
            if (validation.canAddAll) {
                return await addAllFiles(filesToAdd)
            } else if (validation.canAddSome) {
                return await addPartialFiles(filesToAdd, validation.allowedCount, validation.message)
            } else {
                return rejectFiles(validation.message)
            }
        },
        [files.length, maxFiles, normalizeFileInput, validateFileCount, addAllFiles, addPartialFiles, rejectFiles]
    )

    /**
     * 파일을 제거하는 함수
     * @param {string} fileId 제거할 파일 ID
     */
    const removeFile = useCallback(
        (fileId: string): void => {
            setFiles(prevFiles => {
                const fileToRemove = prevFiles.find(item => item.id === fileId)
                if (fileToRemove) {
                    cleanupFileItem(fileToRemove)
                } else {
                    console.warn('[removeFile] 파일을 찾을 수 없음:', fileId)
                }

                const updatedFiles = prevFiles.filter(item => item.id !== fileId)

                // 파일이 제거되면 error 초기화
                if (updatedFiles.length < maxFiles) {
                    setError('')
                }

                return updatedFiles
            })
        },
        [maxFiles]
    )

    /**
     * 파일 정보를 업데이트하는 함수
     * @param {string} fileId 업데이트할 파일 ID
     * @param {Partial<FileItem>} updates 업데이트할 필드들
     */
    const updateFile = useCallback((fileId: string, updates: Partial<FileItem>): void => {
        setFiles(prevFiles =>
            prevFiles.map(file => {
                if (file.id === fileId) {
                    // 기존 preview URL 정리 (새로운 preview가 제공된 경우)
                    if (updates.preview && updates.preview !== file.preview) {
                        safeRevokeURL(file.preview)
                    }

                    return { ...file, ...updates }
                }
                return file
            })
        )
    }, [])

    const createPreviewURL = useCallback((file: File): string => {
        try {
            const url = URL.createObjectURL(file)
            console.log('[createPreviewURL] URL 생성 성공:', file.name, url.substring(0, 20) + '...')
            return url
        } catch (error) {
            console.error('[createPreviewURL] URL 생성 실패:', file.name, error)
            return '' // 빈 문자열 반환으로 안전 처리
        }
    }, [])

    const safeRevokeURL = useCallback((url: string): void => {
        if (!url) return // 빈 문자열이면 스킵

        if (!url.startsWith('blob:')) {
            console.warn('[safeRevokeURL] blob URL이 아님:', url.substring(0, 30) + '...')
            return
        }

        try {
            URL.revokeObjectURL(url)
            console.log('[safeRevokeURL] URL 해제 성공:', url.substring(0, 20) + '...')
        } catch (error) {
            console.warn('[safeRevokeURL] URL 해제 실패:', url.substring(0, 20) + '...', error)
            // 에러가 발생해도 계속 진행 (앱이 멈추지 않도록)
        }
    }, [])

    /**
     * 단일 FileItem의 모든 URL 정리
     */
    const cleanupFileItem = useCallback(
        (fileItem: FileItem): void => {
            if (!fileItem) {
                console.warn('[cleanupFileItem] fileItem이 null/undefined')
                return
            }

            console.log('[cleanupFileItem] 정리 시작:', fileItem.id, fileItem.file.name)

            // preview URL 정리
            if (fileItem.preview) {
                safeRevokeURL(fileItem.preview)
            }

            // thumbnail URL 정리 (있는 경우)
            if (fileItem.thumbnail) {
                safeRevokeURL(fileItem.thumbnail)
            }

            console.log('[cleanupFileItem] 정리 완료:', fileItem.id)
        },
        [safeRevokeURL]
    )

    /**
     * 여러 FileItem들의 URL 일괄 정리
     */
    const cleanupMultipleFileItems = useCallback(
        (fileItems: FileItem[]): void => {
            if (!Array.isArray(fileItems)) {
                console.warn('[cleanupMultipleFileItems] fileItems가 배열이 아님:', typeof fileItems)
                return
            }

            console.log('[cleanupMultipleFileItems] 다중 정리 시작:', fileItems.length, '개')

            fileItems.forEach((fileItem, index) => {
                try {
                    cleanupFileItem(fileItem)
                } catch (error) {
                    console.error(`[cleanupMultipleFileItems] ${index}번째 아이템 정리 실패:`, error)
                    // 에러가 발생해도 다음 아이템 계속 처리
                }
            })

            console.log('[cleanupMultipleFileItems] 다중 정리 완료')
        },
        [cleanupFileItem]
    )

    /**
     * 모든 파일을 초기화하는 함수
     */
    const clearFiles = useCallback((): void => {
        setFiles(prevFiles => {
            cleanupMultipleFileItems(prevFiles)
            return []
        })
        setError('')
    }, [cleanupMultipleFileItems])

    useEffect(() => {
        return (): void => {
            console.log('[useFileUpload] 언마운트 시 메모리 정리 시작')
            cleanupMultipleFileItems(files)
            console.log('[useFileUpload] 언마운트 시 메모리 정리 완료')
        }
    }, [files, cleanupMultipleFileItems])

    return {
        files,
        addFile,
        removeFile,
        updateFile,
        clearFiles,
        error,
        isFull: files.length >= maxFiles,
        count: files.length,
        maxFiles,
        isProcessing,
        setProcessing,
    }
}

export default useFileUpload
