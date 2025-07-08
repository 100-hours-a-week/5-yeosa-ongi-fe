import { convertToWebP } from '@/services/imageConversionService'
import { ConversionCacheManager } from '@/utils/conversionCache'
import { getFileTypeDisplay, isHEICFile } from '@/utils/fileHelpers'
import { useEffect, useRef, useState } from 'react'

interface FileConversionState {
    previewUrl: string
    isConverting: boolean
    error: string | null
}

export const useFileConversion = (
    file: File,
    onConverted?: (original: File, converted: File) => void,
    webPQuality: number = 0.8
): FileConversionState => {
    const [state, setState] = useState<FileConversionState>(() => {
        const needsConversion = isHEICFile(file) || file.type !== 'image/webp'

        let initialPreviewUrl = ''
        let initialFileType = getFileTypeDisplay(file)

        if (needsConversion) {
            return {
                previewUrl: '',
                isConverting: true,
                error: null,
            }
        } else {
            try {
                const initialPreviewUrl = URL.createObjectURL(file)
                return {
                    previewUrl: initialPreviewUrl,
                    isConverting: false,
                    error: null,
                }
            } catch (error) {
                return {
                    previewUrl: '',
                    isConverting: false,
                    error: '파일을 불러올 수 없습니다.',
                }
            }
        }
    })

    const isInitialized = useRef(false)
    const isDestroyed = useRef(false)

    useEffect(() => {
        if (isInitialized.current || isDestroyed.current) return
        isInitialized.current = true

        console.log('[useFileConversion] 파일 처리 시작:', file.name)

        const processFile = async () => {
            try {
                let processedFile = file
                let targetFileType = getFileTypeDisplay(file)

                // 1. HEIC 변환 처리
                if (isHEICFile(file)) {
                    // 캐시 확인
                    const cached = ConversionCacheManager.get(file)
                    if (cached) {
                        processedFile = cached.convertedFile
                        targetFileType = 'JPEG'
                    } else {
                        // 변환 중인지 확인

                        if (!isDestroyed.current) {
                            setState(prev => ({
                                ...prev,
                                isConverting: true,
                            }))
                        }

                        const converted = await ConversionCacheManager.convert(file)
                        processedFile = converted.convertedFile
                        targetFileType = 'JPEG'
                    }
                }

                // 2. WebP 변환 처리
                if (processedFile.type !== 'image/webp') {
                    console.log('[useFileConversion] WebP 변환 시작:', processedFile.name)

                    if (!isDestroyed.current) {
                        setState(prev => ({
                            ...prev,
                            isConverting: true,
                            fileType: `${targetFileType} → WebP`,
                        }))
                    }

                    processedFile = await convertToWebP(processedFile, webPQuality)
                    targetFileType = 'WebP'
                }

                // 3. 최종 결과 설정
                if (!isDestroyed.current) {
                    const finalPreviewUrl = URL.createObjectURL(processedFile)

                    setState({
                        previewUrl: finalPreviewUrl,
                        isConverting: false,
                        error: null,
                    })

                    // 변환 완료 콜백 호출
                    if (onConverted && processedFile !== file) {
                        console.log('[useFileConversion] 변환 완료 콜백 호출:', file.name, '→', processedFile.name)
                        onConverted(file, processedFile)
                    }
                }

                console.log('[useFileConversion] 파일 처리 완료:', file.name, '→', processedFile.name)
            } catch (error) {
                console.error('[useFileConversion] 파일 처리 중 오류:', file.name, error)
                if (!isDestroyed.current) {
                    setState(prev => ({
                        ...prev,
                        isConverting: false,
                        error: error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.',
                    }))
                }
            }
        }
        processFile()
    }, [file, onConverted, webPQuality])

    useEffect(() => {
        return () => {
            console.log('[useFileConversion] 언마운트:', file.name)
            isDestroyed.current = true
        }
    }, [file.name])

    return state
}
