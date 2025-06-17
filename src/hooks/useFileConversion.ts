import { ConversionCacheManager } from '@/utils/conversionCache'
import { getFileTypeDisplay, isHEICFile } from '@/utils/fileHelpers'
import { useEffect, useRef, useState } from 'react'

interface FileConversionState {
    previewUrl: string
    isConverting: boolean
    error: string | null
    fileType: string
}

/**
 * 파일 변환 로직을 담당하는 훅
 * HEIC 파일 감지, 변환 처리, 상태 관리만 담당
 */
export const useFileConversion = (
    file: File,
    onConverted?: (original: File, converted: File) => void
): FileConversionState => {
    // 상태 초기화 (기존 FilePreview의 초기화 로직과 동일)
    const [state, setState] = useState<FileConversionState>(() => {
        const isHeic = isHEICFile(file)

        let initialPreviewUrl = ''
        let initialFileType = getFileTypeDisplay(file)

        if (isHeic) {
            console.log('[useFileConversion] HEIC 파일 감지, 변환 대기:', file.name)
            initialPreviewUrl = '' // HEIC는 빈 문자열로 시작
            initialFileType = 'HEIC'
        } else {
            // 일반 이미지 파일은 즉시 preview URL 생성
            try {
                initialPreviewUrl = URL.createObjectURL(file)
                console.log('[useFileConversion] 초기 preview URL 생성:', initialPreviewUrl)
            } catch (error) {
                console.error('[useFileConversion] 초기 preview URL 생성 실패:', error)
            }
        }

        return {
            previewUrl: initialPreviewUrl,
            isConverting: isHeic, // HEIC 파일이면 변환 중 상태로 시작
            error: null,
            fileType: initialFileType,
        }
    })

    // 실행 상태 추적 (기존과 동일)
    const isInitialized = useRef(false)
    const isDestroyed = useRef(false)

    // 파일 처리 로직 (기존 FilePreview의 useEffect 로직을 그대로 이동)
    useEffect(() => {
        if (isInitialized.current || isDestroyed.current) return
        isInitialized.current = true

        console.log('[useFileConversion] 파일 처리 시작:', file.name)

        const processFile = async () => {
            try {
                // 1. 캐시 확인
                const cached = ConversionCacheManager.get(file)
                if (cached) {
                    console.log('[useFileConversion] 캐시된 변환 파일 사용:', file.name)
                    if (!isDestroyed.current) {
                        setState({
                            previewUrl: cached.previewUrl,
                            isConverting: false,
                            error: null,
                            fileType: 'JPEG',
                        })

                        // 변환 완료 콜백 호출
                        if (onConverted) {
                            onConverted(file, cached.convertedFile)
                        }
                    }
                    return
                }

                // 2. 이미 변환 중인지 확인
                if (ConversionCacheManager.isConverting(file)) {
                    console.log('[useFileConversion] 이미 변환 중:', file.name)
                    if (!isDestroyed.current) {
                        setState(prev => ({
                            ...prev,
                            isConverting: true,
                            fileType: 'HEIC → JPEG',
                        }))
                    }

                    // 변환 완료 대기
                    try {
                        const converted = await ConversionCacheManager.convert(file)
                        if (!isDestroyed.current) {
                            setState({
                                previewUrl: converted.previewUrl,
                                isConverting: false,
                                error: null,
                                fileType: 'JPEG',
                            })

                            if (onConverted) {
                                console.log('[useFileConversion] 기존 변환 완료 콜백 호출:', file.name)
                                onConverted(file, converted.convertedFile)
                            }
                        }
                    } catch (error) {
                        console.error('[useFileConversion] 기존 변환 대기 실패:', error)
                        if (!isDestroyed.current) {
                            setState(prev => ({
                                ...prev,
                                isConverting: false,
                                error: '변환 중 오류가 발생했습니다.',
                            }))
                        }
                    }
                    return
                }

                // 3. HEIC 파일인지 확인
                if (!isHEICFile(file)) {
                    console.log('[useFileConversion] HEIC가 아닌 파일:', file.name)
                    return
                }

                // 4. HEIC 변환 시작
                console.log('[useFileConversion] HEIC 변환 시작:', file.name)

                if (!isDestroyed.current) {
                    setState(prev => ({
                        ...prev,
                        isConverting: true,
                        fileType: 'HEIC → JPEG',
                    }))
                }

                const converted = await ConversionCacheManager.convert(file)

                if (!isDestroyed.current) {
                    setState({
                        previewUrl: converted.previewUrl,
                        isConverting: false,
                        error: null,
                        fileType: 'JPEG',
                    })

                    // 변환 완료 콜백 호출
                    if (onConverted) {
                        console.log('[useFileConversion] 변환 완료 콜백 호출:', file.name)
                        onConverted(file, converted.convertedFile)
                    }
                }

                console.log('[useFileConversion] HEIC 변환 완료:', file.name)
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
    }, [file, onConverted]) // 기존과 동일한 의존성

    // 컴포넌트 언마운트 시 정리 (기존과 동일)
    useEffect(() => {
        return () => {
            console.log('[useFileConversion] 언마운트:', file.name)
            isDestroyed.current = true
        }
    }, [file.name])

    return state
}
