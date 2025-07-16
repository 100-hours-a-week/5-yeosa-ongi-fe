// stores/fileStore.ts
import { FileItem } from '@/types/upload'
import { extractGPSMetadata, extractJPEGGPSMetadata, isHEICFile } from '@/utils/imageMetadata'
import { useMemo } from 'react'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export const useFileCount = () => {
    const files = useFileStore(fileSelectors.files)
    const maxFiles = useFileStore(state => state.maxFiles)

    return useMemo(() => {
        const count = files.length
        return {
            count,
            maxFiles,
            isValid: count >= 1,
            isFull: count >= maxFiles,
        }
    }, [files.length, maxFiles]) // files.length만 의존성으로 사용
}

export const useFileProcessing = () => {
    const isProcessing = useFileStore(state => state.isProcessing)
    const error = useFileStore(state => state.error)

    return useMemo(
        () => ({
            isProcessing,
            error,
        }),
        [isProcessing, error]
    )
}

interface FileState {
    // 상태
    files: FileItem[]
    isProcessing: boolean
    error: string | null
    maxFiles: number

    // 계산된 값들 (selector로 사용)
    fileCount: number
    isValid: boolean
    isFull: boolean

    // 액션들
    addFiles: (newFiles: File[]) => Promise<boolean>
    removeFile: (fileId: string) => void
    updateFile: (fileId: string, updates: Partial<FileItem>) => void
    clearFiles: () => void
    setProcessing: (isProcessing: boolean) => void
    setError: (error: string | null) => void
    setMaxFiles: (maxFiles: number) => void

    // 유틸리티 메서드들
    getFileById: (fileId: string) => FileItem | undefined
    getFilesByType: (type: string) => FileItem[]
    replaceFileContent: (originalFile: File, convertedFile: File) => void
}

// 1. 파일 아이템 생성 유틸리티
const createFileItem = async (file: File): Promise<FileItem> => {
    try {
        let metadata
        if (isHEICFile(file)) {
            metadata = await extractGPSMetadata(file)
        } else {
            metadata = await extractJPEGGPSMetadata(file)
        }

        const formData = new FormData()
        if (metadata.longitude && metadata.latitude) {
            formData.append('entry.602712467', 'true')
        } else {
            formData.append('entry.602712467', 'false')
        }
        await fetch(
            'https://docs.google.com/forms/d/e/1FAIpQLSdn4uZs796uy3aSYMIQ1bpzrtjL6rdjIrCpH4GVKvDKAff1Mw/formResponse',
            {
                method: 'POST',
                mode: 'no-cors',
                body: formData,
            }
        )
        return {
            file,
            preview: URL.createObjectURL(file),
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            GPS: {
                longitude: metadata?.longitude,
                latitude: metadata?.latitude,
            },
            isProcessed: false,
        }
    } catch (error) {
        console.error('파일 아이템 생성 실패:', file.name, error)
        throw error
    }
}

// 2. 파일 유효성 검증
const validateFiles = (files: File[], currentCount: number, maxFiles: number) => {
    const totalCount = currentCount + files.length

    if (totalCount <= maxFiles) {
        return { isValid: true, allowedFiles: files, message: null }
    }

    const remainingSlots = Math.max(0, maxFiles - currentCount)
    if (remainingSlots > 0) {
        return {
            isValid: true,
            allowedFiles: files.slice(0, remainingSlots),
            message: `최대 ${maxFiles}장까지만 업로드할 수 있습니다. ${files.length - remainingSlots}장이 제외되었습니다.`,
        }
    }

    return {
        isValid: false,
        allowedFiles: [],
        message: `이미 최대 파일 수(${maxFiles}장)에 도달했습니다.`,
    }
}

// 3. Zustand 스토어 생성
export const useFileStore = create<FileState>()(
    subscribeWithSelector(
        immer((set, get) => ({
            // 초기 상태
            files: [],
            isProcessing: false,
            error: null,
            maxFiles: 30,

            // 계산된 값들 - getter로 구현
            get fileCount() {
                return get().files.length
            },

            get isValid() {
                return get().files.length >= 1
            },

            get isFull() {
                const { files, maxFiles } = get()
                return files.length >= maxFiles
            },

            // 액션들
            addFiles: async (newFiles: File[]): Promise<boolean> => {
                const { files, maxFiles, setProcessing, setError } = get()

                if (newFiles.length === 0) return false

                setProcessing(true)
                setError(null)

                try {
                    // 유효성 검증
                    const validation = validateFiles(newFiles, files.length, maxFiles)

                    if (!validation.isValid) {
                        setError(validation.message)
                        return false
                    }

                    // 파일 아이템 생성
                    const newFileItems = await Promise.all(validation.allowedFiles.map(file => createFileItem(file)))

                    // 상태 업데이트
                    set(state => {
                        state.files.push(...newFileItems)
                        if (validation.message) {
                            state.error = validation.message
                        }
                    })

                    console.log(`파일 추가 완료: ${newFileItems.length}장`)
                    return true
                } catch (error) {
                    console.error('파일 추가 실패:', error)
                    setError('파일 처리 중 오류가 발생했습니다.')
                    return false
                } finally {
                    setProcessing(false)
                }
            },

            removeFile: (fileId: string) => {
                set(state => {
                    const fileIndex = state.files.findIndex((f: FileItem) => f.id === fileId)
                    if (fileIndex !== -1) {
                        const fileToRemove = state.files[fileIndex]

                        // URL 정리
                        if (fileToRemove.preview) {
                            URL.revokeObjectURL(fileToRemove.preview)
                        }
                        if (fileToRemove.thumbnail) {
                            URL.revokeObjectURL(fileToRemove.thumbnail)
                        }

                        state.files.splice(fileIndex, 1)

                        // 파일이 제거되면 에러 초기화 (여유 공간 생김)
                        if (state.files.length < state.maxFiles) {
                            state.error = null
                        }
                    }
                })
            },

            updateFile: (fileId: string, updates: Partial<FileItem>) => {
                set(state => {
                    const fileIndex = state.files.findIndex((f: FileItem) => f.id === fileId)
                    if (fileIndex !== -1) {
                        const currentFile = state.files[fileIndex]

                        // 기존 preview URL 정리 (새로운 preview가 제공된 경우)
                        if (updates.preview && updates.preview !== currentFile.preview && currentFile.preview) {
                            URL.revokeObjectURL(currentFile.preview)
                        }

                        // 업데이트 적용
                        Object.assign(state.files[fileIndex], updates)
                    }
                })
            },

            clearFiles: () => {
                const { files } = get()

                // 모든 URL 정리
                files.forEach(file => {
                    if (file.preview) URL.revokeObjectURL(file.preview)
                    if (file.thumbnail) URL.revokeObjectURL(file.thumbnail)
                })

                set(state => {
                    state.files = []
                    state.error = null
                    state.isProcessing = false
                })
            },

            setProcessing: (isProcessing: boolean) => {
                set(state => {
                    state.isProcessing = isProcessing
                })
            },

            setError: (error: string | null) => {
                set(state => {
                    state.error = error
                })
            },

            setMaxFiles: (maxFiles: number) => {
                set(state => {
                    state.maxFiles = maxFiles
                })
            },

            // 유틸리티 메서드들
            getFileById: (fileId: string) => {
                return get().files.find(f => f.id === fileId)
            },

            getFilesByType: (type: string) => {
                return get().files.filter(f => f.file.type.includes(type))
            },

            replaceFileContent: (originalFile: File, convertedFile: File) => {
                const { files, updateFile } = get()

                const originalFileItem = files.find(
                    fileItem =>
                        fileItem.file === originalFile ||
                        (fileItem.file.name === originalFile.name &&
                            fileItem.file.size === originalFile.size &&
                            fileItem.file.lastModified === originalFile.lastModified)
                )

                if (!originalFileItem) {
                    console.error('원본 파일을 찾을 수 없음:', originalFile.name)
                    return
                }

                console.log('파일 내용 교체:', originalFile.name, '→', convertedFile.name)

                const updateData: Partial<FileItem> = {
                    file: convertedFile,
                    preview: URL.createObjectURL(convertedFile),
                    isProcessed: true,
                    // GPS 정보는 원본 것을 보존
                    GPS: originalFileItem.GPS,
                }

                updateFile(originalFileItem.id, updateData)
            },
        }))
    )
)

// 4. 선택적 구독을 위한 셀렉터들
export const fileSelectors = {
    // 파일 목록만 구독
    files: (state: FileState) => state.files,

    // 카운트 정보만 구독
    counts: (state: FileState) => ({
        count: state.files.length,
        maxFiles: state.maxFiles,
        isValid: state.files.length >= 1,
        isFull: state.files.length >= state.maxFiles,
    }),

    // 처리 상태만 구독
    processing: (state: FileState) => ({
        isProcessing: state.isProcessing,
        error: state.error,
    }),

    // 특정 파일 타입만 구독
    heicFiles: (state: FileState) =>
        state.files.filter(f => f.file.type === 'image/heic' || f.file.name?.toLowerCase().endsWith('.heic')),
}

// 5. 타입 안전한 액션 디스패처
export const fileActions = {
    addFiles: () => useFileStore.getState().addFiles,
    removeFile: () => useFileStore.getState().removeFile,
    updateFile: () => useFileStore.getState().updateFile,
    clearFiles: () => useFileStore.getState().clearFiles,
    replaceFileContent: () => useFileStore.getState().replaceFileContent,
}
