import { FileItem } from '@/types/upload'
import { extractHEICMetadata, isHEICFile } from '@/utils/metadata'
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

    /**
     * 파일을 추가하는 함수 - 초과분은 무시하고 최대한도까지만 추가
     * @param {File|File[]} newFiles 추가할 파일(들)
     * @returns {boolean} 성공 여부
     */
    const addFile = useCallback(
        async (newFiles: File | File[]): Promise<boolean> => {
            if (!newFiles) return false

            // 배열이 아닌 경우 배열로 변환
            const filesToAdd = Array.isArray(newFiles) ? newFiles : [newFiles]
            if (filesToAdd.length === 0) return false

            // 현재 파일 수 + 추가할 파일 수가 최대 파일 수를 초과하는지 확인
            const totalFiles = files.length + filesToAdd.length

            if (totalFiles <= maxFiles) {
                // 최대 파일 수를 초과하지 않는 경우, 모든 파일 추가
                const newFileItems = await Promise.all(
                    filesToAdd.map(async (file): Promise<FileItem> => {
                        const metadata = isHEICFile(file) ? await extractHEICMetadata(file) : null
                        console.log(isHEICFile(file))
                        console.log(metadata)
                        return {
                            file,
                            preview: URL.createObjectURL(file),
                            id: Math.random().toString(36).substr(2, 9),
                            GPS: {
                                longitude: metadata?.gps?.longitude,
                                latitude: metadata?.gps?.latitude,
                            },

                            isProcessed: false, // 처리 상태 초기화
                        }
                    })
                )

                setFiles((prevFiles: FileItem[]) => [...prevFiles, ...newFileItems])
                setError('')
                return true
            } else {
                // 최대 파일 수를 초과하는 경우, 최대한도까지만 추가
                const remainingSlots = Math.max(0, maxFiles - files.length)

                if (remainingSlots > 0) {
                    // 추가 가능한 파일만 추가
                    const filesToKeep = filesToAdd.slice(0, remainingSlots)
                    const newFileItems = await Promise.all(
                        filesToKeep.map(async (file): Promise<FileItem> => {
                            const metadata = isHEICFile(file) ? await extractHEICMetadata(file) : null
                            return {
                                file,
                                preview: URL.createObjectURL(file),
                                id: Math.random().toString(36).substr(2, 9),
                                GPS: {
                                    longitude: metadata?.gps?.longitude,
                                    latitude: metadata?.gps?.latitude,
                                },
                                isProcessed: false,
                            }
                        })
                    )

                    setFiles((prevFiles: FileItem[]) => [...prevFiles, ...newFileItems])

                    // 초과분 정보만 오류 메시지로 표시
                    const excludedCount = filesToAdd.length - remainingSlots
                    setError(`최대 ${maxFiles}장까지만 업로드할 수 있습니다. ${excludedCount}장이 제외되었습니다.`)
                } else {
                    // 슬롯이 없는 경우 모든 파일이 제외됨
                    setError(
                        `이미 최대 파일 수(${maxFiles}장)에 도달했습니다. ${filesToAdd.length}장이 추가되지 않았습니다.`
                    )
                }

                return remainingSlots > 0 // 일부라도 추가되었으면 true 반환
            }
        },
        [files.length, maxFiles]
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
                    URL.revokeObjectURL(fileToRemove.preview) // 메모리 누수 방지

                    // 썸네일이나 추가 preview URL이 있다면 정리
                    if (fileToRemove.thumbnail) {
                        URL.revokeObjectURL(fileToRemove.thumbnail)
                    }
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
                        URL.revokeObjectURL(file.preview)
                    }

                    return { ...file, ...updates }
                }
                return file
            })
        )
    }, [])

    /**
     * 모든 파일을 초기화하는 함수
     */
    const clearFiles = useCallback((): void => {
        setFiles(prevFiles => {
            prevFiles.forEach(fileItem => {
                URL.revokeObjectURL(fileItem.preview)
                // 썸네일이나 추가 URL들도 정리
                if (fileItem.thumbnail) {
                    URL.revokeObjectURL(fileItem.thumbnail)
                }
            })
            return []
        })
        setError('')
    }, [])

    // 컴포넌트 언마운트 시 메모리 정리
    useEffect(() => {
        return (): void => {
            files.forEach(fileItem => {
                URL.revokeObjectURL(fileItem.preview)
                if (fileItem.thumbnail) {
                    URL.revokeObjectURL(fileItem.thumbnail)
                }
            })
        }
    }, [files])

    return {
        files,
        addFile,
        removeFile,
        updateFile, // 새로 추가된 함수
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
