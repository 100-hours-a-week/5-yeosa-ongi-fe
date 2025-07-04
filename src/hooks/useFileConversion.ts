import { ConversionCacheManager } from '@/utils/conversionCache'
import { getFileTypeDisplay, isHEICFile } from '@/utils/fileHelpers'
import { useEffect, useRef, useState } from 'react'

interface FileConversionState {
    previewUrl: string
    isConverting: boolean
    error: string | null
    fileType: string
}

interface ConversionOptions {
    toWebP?: boolean
    webPQuality?: number // 0.0 ~ 1.0
}

/**
 * WebP 변환 함수
 */
const convertToWebP = async (file: File, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx?.drawImage(img, 0, 0)

            canvas.toBlob(
                blob => {
                    if (blob) {
                        const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                            type: 'image/webp',
                        })
                        resolve(webpFile)
                    } else {
                        reject(new Error('WebP 변환 실패'))
                    }
                },
                'image/webp',
                quality
            )
        }

        img.onerror = () => reject(new Error('이미지 로드 실패'))
        img.src = URL.createObjectURL(file)
    })
}

/**
 * 파일 변환 로직을 담당하는 훅
 * HEIC 파일 감지, WebP 변환, 상태 관리 담당
 */
export const useFileConversion = (
    file: File,
    onConverted?: (original: File, converted: File) => void,
    options: ConversionOptions = {}
): FileConversionState => {
    const { toWebP = true, webPQuality = 0.8 } = options

    const [state, setState] = useState<FileConversionState>(() => {
        const isHeic = isHEICFile(file)
        const needsConversion = isHeic || toWebP

        let initialPreviewUrl = ''
        let initialFileType = getFileTypeDisplay(file)

        if (needsConversion) {
            console.log('[useFileConversion] 변환 필요한 파일 감지:', file.name)
            initialPreviewUrl = '' // 변환이 필요하면 빈 문자열로 시작

            if (isHeic && toWebP) {
                initialFileType = 'HEIC → WebP'
            } else if (isHeic) {
                initialFileType = 'HEIC → JPEG'
            } else if (toWebP) {
                initialFileType = `${initialFileType} → WebP`
            }
        } else {
            // 변환이 불필요한 일반 파일은 즉시 preview URL 생성
            try {
                initialPreviewUrl = URL.createObjectURL(file)
                console.log('[useFileConversion] 초기 preview URL 생성:', initialPreviewUrl)
            } catch (error) {
                console.error('[useFileConversion] 초기 preview URL 생성 실패:', error)
            }
        }

        return {
            previewUrl: initialPreviewUrl,
            isConverting: needsConversion,
            error: null,
            fileType: initialFileType,
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
                        console.log('[useFileConversion] HEIC 캐시된 변환 파일 사용:', file.name)
                        processedFile = cached.convertedFile
                        targetFileType = 'JPEG'
                    } else {
                        // 변환 중인지 확인
                        if (ConversionCacheManager.isConverting(file)) {
                            console.log('[useFileConversion] HEIC 이미  변환 중:', file.name)

                            if (!isDestroyed.current) {
                                setState(prev => ({
                                    ...prev,
                                    isConverting: true,
                                    fileType: toWebP ? 'HEIC → WebP' : 'HEIC → JPEG',
                                }))
                            }

                            const converted = await ConversionCacheManager.convert(file)
                            processedFile = converted.convertedFile
                            targetFileType = 'JPEG'
                        } else {
                            // HEIC 변환 시작
                            console.log('[useFileConversion] HEIC 변환 시작:', file.name)

                            if (!isDestroyed.current) {
                                setState(prev => ({
                                    ...prev,
                                    isConverting: true,
                                    fileType: toWebP ? 'HEIC → WebP' : 'HEIC → JPEG',
                                }))
                            }

                            const converted = await ConversionCacheManager.convert(file)
                            processedFile = converted.convertedFile
                            targetFileType = 'JPEG'
                        }
                    }
                }

                console.log('여까진옴')
                // 2. WebP 변환 처리
                if (toWebP && processedFile.type !== 'image/webp') {
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
                        fileType: targetFileType,
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

        // 변환이 필요한 경우에만 processFile 실행
        const needsConversion = isHEICFile(file) || toWebP
        if (needsConversion) {
            processFile()
        }
    }, [file, onConverted, toWebP, webPQuality])

    useEffect(() => {
        return () => {
            console.log('[useFileConversion] 언마운트:', file.name)
            isDestroyed.current = true
        }
    }, [file.name])

    return state
}
