import { convertToWebP } from '@/domains/editor/services/imageConversionService'
import { ConversionCacheManager } from '@/domains/editor/utils/conversionCache'
import { isHEICFile } from '@/domains/editor/utils/imageMetadata'
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

    // 🔧 refs로 current 값들 관리
    const fileRef = useRef<File>(file)
    const onConvertedRef = useRef(onConverted)
    const qualityRef = useRef(webPQuality)
    const isInitialized = useRef(false)
    const isDestroyed = useRef(false)
    const currentPreviewUrl = useRef<string>('')

    // 🔧 refs 업데이트 (리렌더링 트리거하지 않음)
    fileRef.current = file
    onConvertedRef.current = onConverted
    qualityRef.current = webPQuality

    // 🔧 파일 고유 키 생성 (객체 참조 대신 사용)
    const fileKey = `${file.name}-${file.size}-${file.lastModified}`
    const fileKeyRef = useRef(fileKey)

    // 🔧 파일이 실제로 변경되었을 때만 처리
    useEffect(() => {
        // 파일이 정말 바뀐 경우만 처리
        if (fileKeyRef.current === fileKey && isInitialized.current) {
            return
        }

        // 이전 처리 중단
        isDestroyed.current = true

        // 이전 preview URL 정리
        if (currentPreviewUrl.current) {
            URL.revokeObjectURL(currentPreviewUrl.current)
            currentPreviewUrl.current = ''
        }

        // 새 파일 처리를 위해 플래그 리셋
        isDestroyed.current = false
        isInitialized.current = false
        fileKeyRef.current = fileKey

        console.log('[useFileConversion] 파일 변경 감지, 처리 시작:', file.name)

        // 변환이 필요하지 않은 경우 즉시 preview 설정
        const needsConversion = isHEICFile(file) || file.type !== 'image/webp'
        if (!needsConversion) {
            try {
                const previewUrl = URL.createObjectURL(file)
                currentPreviewUrl.current = previewUrl
                setState({
                    previewUrl,
                    isConverting: false,
                    error: null,
                })
                return
            } catch (error) {
                setState({
                    previewUrl: '',
                    isConverting: false,
                    error: '파일을 불러올 수 없습니다.',
                })
                return
            }
        }

        // 비동기 처리
        const processFile = async () => {
            if (isInitialized.current || isDestroyed.current) return
            isInitialized.current = true

            try {
                let processedFile = fileRef.current

                // 1. HEIC 변환 처리
                if (isHEICFile(fileRef.current)) {
                    if (isDestroyed.current) return

                    // 캐시 확인
                    const cached = ConversionCacheManager.get(fileRef.current)
                    if (cached) {
                        processedFile = cached.convertedFile
                    } else {
                        setState(prev => ({
                            ...prev,
                            isConverting: true,
                        }))

                        const converted = await ConversionCacheManager.convert(fileRef.current)
                        if (isDestroyed.current) return
                        processedFile = converted.convertedFile
                    }
                }

                // 2. WebP 변환 처리
                if (processedFile.type !== 'image/webp') {
                    if (isDestroyed.current) return

                    console.log('[useFileConversion] WebP 변환 시작:', processedFile.name)

                    setState(prev => ({
                        ...prev,
                        isConverting: true,
                    }))

                    processedFile = await convertToWebP(processedFile, qualityRef.current)
                    if (isDestroyed.current) return
                }

                // 3. 최종 결과 설정
                const finalPreviewUrl = URL.createObjectURL(processedFile)
                currentPreviewUrl.current = finalPreviewUrl

                setState({
                    previewUrl: finalPreviewUrl,
                    isConverting: false,
                    error: null,
                })

                // 변환 완료 콜백 호출
                if (onConvertedRef.current && processedFile !== fileRef.current) {
                    console.log(
                        '[useFileConversion] 변환 완료 콜백 호출:',
                        fileRef.current.name,
                        '→',
                        processedFile.name
                    )
                    onConvertedRef.current(fileRef.current, processedFile)
                }

                console.log('[useFileConversion] 파일 처리 완료:', fileRef.current.name, '→', processedFile.name)
            } catch (error) {
                console.error('[useFileConversion] 파일 처리 중 오류:', fileRef.current.name, error)
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
    }, [fileKey]) // 🔧 fileKey만 의존성으로 사용

    // 🔧 컴포넌트 언마운트 시에만 cleanup 실행
    useEffect(() => {
        return () => {
            console.log('[useFileConversion] 컴포넌트 언마운트:', file.name)
            isDestroyed.current = true

            // preview URL 정리
            if (currentPreviewUrl.current) {
                URL.revokeObjectURL(currentPreviewUrl.current)
                currentPreviewUrl.current = ''
            }
        }
    }, []) // 🔧 빈 의존성 배열 - 컴포넌트 언마운트 시에만

    return state
}
