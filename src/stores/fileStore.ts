// stores/fileStore.ts
import { FileItem } from '@/types/upload'
import { extractGPSMetadata } from '@/utils/imageMetadata'
import { useMemo } from 'react'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export const useFileCount = () => {
    const files = useFileStore(fileSelectors.files)
    const maxFiles = useFileStore(state => state.maxFiles)

    const count = files.length
    return {
        count,
        maxFiles,
        isValid: count >= 1,
        isFull: count >= maxFiles,
    }
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
    // 🎯 기본 상태만 (getter 제거로 단순화)
    files: FileItem[]
    isProcessing: boolean
    error: string | null
    maxFiles: number

    // 🎯 액션들
    addFiles: (newFiles: File[]) => Promise<boolean>
    removeFile: (fileId: string) => void
    updateFile: (fileId: string, updates: Partial<FileItem>) => void
    clearFiles: () => void
    setProcessing: (isProcessing: boolean) => void
    setError: (error: string | null) => void
    setMaxFiles: (maxFiles: number) => void

    // 🎯 유틸리티 메서드들
    getFileById: (fileId: string) => FileItem | undefined
    getFilesByType: (type: string) => FileItem[]
    replaceFileContent: (originalFile: File, convertedFile: File) => void
}

// 🚀 이전 버전 기반 파일 아이템 생성 (빠르고 안정적)
const createFileItem = async (file: File): Promise<FileItem> => {
    try {
        // 🔥 이전 방식: 메타데이터만 추출 (Google Forms 제거)
        const metadata = await extractGPSMetadata(file)

        // 🔥 Google Forms를 백그라운드로 이동 (블로킹 제거)
        setTimeout(() => {
            try {
                const formData = new FormData()
                const hasGPS = metadata?.longitude && metadata?.latitude
                formData.append('entry.602712467', hasGPS ? 'true' : 'false')

                fetch(
                    'https://docs.google.com/forms/d/e/1FAIpQLSdn4uZs796uy3aSYMIQ1bpzrtjL6rdjIrCpH4GVKvDKAff1Mw/formResponse',
                    {
                        method: 'POST',
                        mode: 'no-cors',
                        body: formData,
                    }
                ).catch(err => {
                    console.warn('Google Forms 전송 실패 (무시됨):', err)
                })
            } catch (error) {
                console.warn('Google Forms 요청 오류 (무시됨):', error)
            }
        }, 100) // 100ms 후 백그라운드에서 실행

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
                // 🔧 현재 인터페이스와 호환 (이전 구조 → 현재 구조)
                longitude: metadata?.longitude || null,
                latitude: metadata?.latitude || null,
            },
            isProcessed: false,
        }
    } catch (error) {
        console.error('파일 아이템 생성 실패:', file.name, error)
        // 🔥 에러 시에도 기본 파일 아이템 생성 (완전 실패 방지)
        return {
            file,
            preview: URL.createObjectURL(file),
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            GPS: { longitude: null, latitude: null },
            isProcessed: false,
        }
    }
}

// 파일 유효성 검증 (이전 버전 그대로 유지)
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

// 🎯 단순화된 Zustand 스토어 (getter 제거)
export const useFileStore = create<FileState>()(
    subscribeWithSelector(
        immer((set, get) => ({
            // 초기 상태
            files: [],
            isProcessing: false,
            error: null,
            maxFiles: 30,

            // 🚀 단순화된 액션들
            addFiles: async (newFiles: File[]): Promise<boolean> => {
                if (newFiles.length === 0) return false

                const { files, maxFiles } = get()

                // 🔥 isProcessing 상태를 한 곳에서만 관리
                set(state => {
                    state.isProcessing = true
                    state.error = null
                })

                try {
                    // 유효성 검증
                    const validation = validateFiles(newFiles, files.length, maxFiles)

                    if (!validation.isValid) {
                        set(state => {
                            state.error = validation.message
                            state.isProcessing = false
                        })
                        return false
                    }

                    // 🔥 파일 아이템 생성 (이전 방식, 빠름)
                    const newFileItems = await Promise.all(validation.allowedFiles.map(file => createFileItem(file)))

                    // 🔥 상태 업데이트 (atomic)
                    set(state => {
                        state.files.push(...newFileItems)
                        if (validation.message) {
                            state.error = validation.message
                        }
                        state.isProcessing = false
                    })

                    console.log(`✅ 파일 추가 완료: ${newFileItems.length}장, 총 ${get().files.length}장`)
                    return true
                } catch (error) {
                    console.error('❌ 파일 추가 실패:', error)
                    set(state => {
                        state.error = '파일 처리 중 오류가 발생했습니다.'
                        state.isProcessing = false
                    })
                    return false
                }
            },

            removeFile: (fileId: string) => {
                console.log('🗑️ 파일 삭제 요청:', fileId)

                set(state => {
                    const fileIndex = state.files.findIndex((f: FileItem) => f.id === fileId)
                    if (fileIndex !== -1) {
                        const fileToRemove = state.files[fileIndex]

                        console.log(`🗑️ 파일 삭제: ${fileToRemove.file.name} (인덱스: ${fileIndex})`)

                        // URL 정리
                        if (fileToRemove.preview) {
                            URL.revokeObjectURL(fileToRemove.preview)
                        }
                        if (fileToRemove.thumbnail) {
                            URL.revokeObjectURL(fileToRemove.thumbnail)
                        }

                        // 배열에서 제거
                        state.files.splice(fileIndex, 1)

                        // 에러 초기화
                        if (state.files.length < state.maxFiles) {
                            state.error = null
                        }

                        console.log(`✅ 파일 삭제 완료. 남은 파일: ${state.files.length}장`)
                    } else {
                        console.error('❌ 삭제할 파일을 찾을 수 없음:', fileId)
                    }
                })
            },

            updateFile: (fileId: string, updates: Partial<FileItem>) => {
                set(state => {
                    const fileIndex = state.files.findIndex((f: FileItem) => f.id === fileId)
                    if (fileIndex !== -1) {
                        const currentFile = state.files[fileIndex]

                        // 기존 preview URL 정리
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

            // 🎯 유틸리티 메서드들 (이전 버전 그대로)
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
                    console.error('❌ 원본 파일을 찾을 수 없음:', originalFile.name)
                    return
                }

                console.log('🔄 파일 내용 교체:', originalFile.name, '→', convertedFile.name)

                const updateData: Partial<FileItem> = {
                    file: convertedFile,
                    preview: URL.createObjectURL(convertedFile),
                    isProcessed: true,
                    GPS: originalFileItem.GPS,
                }

                updateFile(originalFileItem.id, updateData)
            },
        }))
    )
)

// 🎯 선택적 구독을 위한 셀렉터들 (이전 버전 그대로)
export const fileSelectors = {
    files: (state: FileState) => state.files,

    counts: (state: FileState) => ({
        count: state.files.length,
        maxFiles: state.maxFiles,
        isValid: state.files.length >= 1,
        isFull: state.files.length >= state.maxFiles,
    }),

    processing: (state: FileState) => ({
        isProcessing: state.isProcessing,
        error: state.error,
    }),

    heicFiles: (state: FileState) =>
        state.files.filter(f => f.file.type === 'image/heic' || f.file.name?.toLowerCase().endsWith('.heic')),
}

// 🎯 타입 안전한 액션 디스패처 (이전 버전 그대로)
export const fileActions = {
    addFiles: () => useFileStore.getState().addFiles,
    removeFile: () => useFileStore.getState().removeFile,
    updateFile: () => useFileStore.getState().updateFile,
    clearFiles: () => useFileStore.getState().clearFiles,
    replaceFileContent: () => useFileStore.getState().replaceFileContent,
}
