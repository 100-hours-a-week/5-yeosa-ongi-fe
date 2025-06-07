// components/FilePreview.tsx (초안정 버전)

import { ConversionCacheManager } from '@/utils/conversionCache'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import crossIcon from '../../assets/cross_icon.png'
import { FileItem } from '../../types/upload'

interface FilePreviewProps {
    file: FileItem
    onDelete: (fileId: string) => void
    onConverted?: (originalFile: File, convertedFile: File) => void // 새로운 콜백 추가
}

interface ConversionState {
    previewUrl: string
    isConverting: boolean
    conversionError: string | null
    fileType: string
}

const FilePreview = memo(
    ({ file, onDelete, onConverted }: FilePreviewProps) => {
        // 안전성 체크
        if (!file || !file.file) {
            return (
                <div className='relative flex items-center justify-center w-full h-full bg-gray-200'>
                    <span className='text-gray-500'>파일 오류</span>
                </div>
            )
        }

        // 실행 상태 추적 (절대 변경되지 않는 ref들)
        const isInitialized = useRef(false)
        const isDestroyed = useRef(false)

        // 변환 상태 관리 (안전한 초기화)
        const [conversionState, setConversionState] = useState<ConversionState>(() => {
            // HEIC 파일인지 먼저 확인
            const isHeic =
                file.file.type === 'image/heic' ||
                file.file.type === 'image/heif' ||
                file.file.name?.toLowerCase().endsWith('.heic') ||
                file.file.name?.toLowerCase().endsWith('.heif')

            let initialPreviewUrl = ''
            let initialFileType = file.file.type?.split('/')[1]?.toUpperCase() || 'Unknown'

            if (isHeic) {
                // HEIC 파일은 변환이 필요하므로 preview URL 생성하지 않음
                console.log('HEIC 파일 감지, 변환 대기:', file.file.name)
                initialPreviewUrl = '' // 빈 문자열로 시작
                initialFileType = 'HEIC'
            } else {
                // 일반 이미지 파일만 preview URL 생성
                if (file.preview && typeof file.preview === 'string') {
                    initialPreviewUrl = file.preview
                } else {
                    try {
                        initialPreviewUrl = URL.createObjectURL(file.file)
                        console.log('초기 preview URL 생성:', initialPreviewUrl)
                    } catch (error) {
                        console.error('초기 preview URL 생성 실패:', error)
                    }
                }
            }

            return {
                previewUrl: initialPreviewUrl,
                isConverting: isHeic, // HEIC 파일이면 변환 중 상태로 시작
                conversionError: null,
                fileType: initialFileType,
            }
        })

        // 삭제 핸들러
        const handleDelete = useCallback(() => {
            try {
                isDestroyed.current = true
                ConversionCacheManager.remove(file.file)
                onDelete(file.id)
            } catch (error) {
                console.error('파일 삭제 중 오류:', error)
            }
        }, [file.file, file.id, onDelete])

        // 이미지 로드 에러 핸들링 (최적화)
        const handleImageError = useCallback(() => {
            if (isDestroyed.current) return

            console.warn('이미지 로드 실패:', file.file.name, 'Type:', file.file.type)

            // HEIC 파일인 경우 변환이 필요함을 표시
            const isHeic =
                file.file.type === 'image/heic' ||
                file.file.type === 'image/heif' ||
                file.file.name?.toLowerCase().endsWith('.heic') ||
                file.file.name?.toLowerCase().endsWith('.heif')

            if (isHeic) {
                console.log('HEIC 파일 로드 실패 - 변환 필요:', file.file.name)
                setConversionState(prev => ({
                    ...prev,
                    isConverting: true,
                    fileType: 'HEIC → JPEG',
                    conversionError: null,
                }))

                // HEIC 변환 시작
                ConversionCacheManager.convert(file.file)
                    .then(converted => {
                        if (!isDestroyed.current) {
                            setConversionState({
                                previewUrl: converted.previewUrl,
                                isConverting: false,
                                conversionError: null,
                                fileType: 'JPEG',
                            })
                        }
                    })
                    .catch(error => {
                        console.error('HEIC 변환 실패:', error)
                        if (!isDestroyed.current) {
                            setConversionState(prev => ({
                                ...prev,
                                isConverting: false,
                                conversionError: 'HEIC 변환에 실패했습니다.',
                            }))
                        }
                    })
                return
            }

            // 일반 이미지 파일의 경우 새 URL 생성 시도
            try {
                // 기존 URL과 다른 새로운 URL 생성
                const newUrl = URL.createObjectURL(file.file)
                console.log('새 fallback URL 생성:', newUrl)

                setConversionState(prev => ({
                    ...prev,
                    previewUrl: newUrl,
                    conversionError: null,
                }))
            } catch (error) {
                console.error('Fallback URL 생성 실패:', error)
                setConversionState(prev => ({
                    ...prev,
                    conversionError: '이미지를 로드할 수 없습니다.',
                }))
            }
        }, [file.file]) // 의존성 최소화

        // 파일 초기화 (한 번만 실행)
        useEffect(() => {
            if (isInitialized.current || isDestroyed.current) return
            isInitialized.current = true

            console.log('FilePreview 초기화:', file.file.name)

            const processFile = async () => {
                try {
                    // 1. 캐시 확인
                    const cached = ConversionCacheManager.get(file.file)
                    if (cached) {
                        console.log('캐시된 변환 파일 사용:', file.file.name)
                        if (!isDestroyed.current) {
                            setConversionState({
                                previewUrl: cached.previewUrl,
                                isConverting: false,
                                conversionError: null,
                                fileType: 'JPEG',
                            })
                        }
                        return
                    }

                    // 2. 이미 변환 중인지 확인
                    if (ConversionCacheManager.isConverting(file.file)) {
                        console.log('이미 변환 중:', file.file.name)
                        if (!isDestroyed.current) {
                            setConversionState(prev => ({
                                ...prev,
                                isConverting: true,
                                fileType: 'HEIC → JPEG',
                            }))
                        }

                        // 변환 완료 대기 (Promise 기반)
                        try {
                            const converted = await ConversionCacheManager.convert(file.file)
                            if (!isDestroyed.current) {
                                setConversionState({
                                    previewUrl: converted.previewUrl,
                                    isConverting: false,
                                    conversionError: null,
                                    fileType: 'JPEG',
                                })

                                // 변환 완료를 부모에게 알림
                                if (onConverted) {
                                    console.log(
                                        '기존 변환 완료 콜백 호출:',
                                        file.file.name,
                                        '→',
                                        converted.convertedFile.name
                                    )
                                    onConverted(file.file, converted.convertedFile)
                                }
                            }
                        } catch (error) {
                            console.error('기존 변환 대기 실패:', error)
                            if (!isDestroyed.current) {
                                setConversionState(prev => ({
                                    ...prev,
                                    isConverting: false,
                                    conversionError: '변환 중 오류가 발생했습니다.',
                                }))
                            }
                        }
                        return
                    }

                    // 3. HEIC 파일인지 확인
                    const isHeic =
                        file.file.type === 'image/heic' ||
                        file.file.type === 'image/heif' ||
                        file.file.name?.toLowerCase().endsWith('.heic') ||
                        file.file.name?.toLowerCase().endsWith('.heif')

                    if (!isHeic) {
                        console.log('HEIC가 아닌 파일:', file.file.name)
                        // 이미 초기 상태가 설정되어 있으므로 추가 처리 불필요
                        return
                    }

                    // 4. HEIC 변환 시작
                    console.log('HEIC 변환 시작:', file.file.name)

                    if (!isDestroyed.current) {
                        setConversionState(prev => ({
                            ...prev,
                            isConverting: true,
                            fileType: 'HEIC → JPEG',
                        }))
                    }

                    const converted = await ConversionCacheManager.convert(file.file)

                    if (!isDestroyed.current) {
                        setConversionState({
                            previewUrl: converted.previewUrl,
                            isConverting: false,
                            conversionError: null,
                            fileType: 'JPEG',
                        })

                        // 변환 완료를 부모에게 알림
                        if (onConverted) {
                            console.log('변환 완료 콜백 호출:', file.file.name, '→', converted.convertedFile.name)
                            onConverted(file.file, converted.convertedFile)
                        }
                    }

                    console.log('HEIC 변환 완료:', file.file.name)
                } catch (error) {
                    console.error('파일 처리 중 오류:', file.file.name, error)
                    if (!isDestroyed.current) {
                        setConversionState(prev => ({
                            ...prev,
                            isConverting: false,
                            conversionError: error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.',
                        }))
                    }
                }
            }

            processFile()
        }, []) // 빈 의존성 배열 - 절대 재실행되지 않음

        // 컴포넌트 언마운트 시 정리
        useEffect(() => {
            return () => {
                console.log('FilePreview 언마운트:', file.file.name)
                isDestroyed.current = true

                // 원본 preview URL만 정리
                if (file.preview && file.preview.startsWith('blob:')) {
                    try {
                        URL.revokeObjectURL(file.preview)
                    } catch (error) {
                        console.warn('URL 해제 중 오류:', error)
                    }
                }
            }
        }, [file.preview, file.file.name])

        // 프리뷰 URL이 없으면 로딩 표시
        if (!conversionState.previewUrl) {
            return (
                <div className='relative flex items-center justify-center w-full h-full bg-gray-200'>
                    <span className='text-gray-500'>로딩 중...</span>
                    <button className='absolute z-10 top-2 right-2' onClick={handleDelete}>
                        <img className='w-4 h-4' src={crossIcon} alt='삭제' />
                    </button>
                </div>
            )
        }

        return (
            <div className='relative w-full h-full'>
                {/* 메인 이미지 - 조건부 렌더링 */}
                {conversionState.previewUrl ? (
                    <img
                        src={conversionState.previewUrl}
                        alt={`Preview ${file.id}`}
                        className='absolute inset-0 object-cover w-full h-full'
                        onError={handleImageError}
                        onLoad={() => console.log('이미지 로드 성공:', file.file.name)}
                    />
                ) : (
                    <div className='absolute inset-0 flex items-center justify-center bg-gray-100'>
                        <span className='text-gray-400'>미리보기 준비 중...</span>
                    </div>
                )}

                {/* 삭제 버튼 */}
                <button
                    className='absolute z-10 top-2 right-2'
                    onClick={handleDelete}
                    disabled={conversionState.isConverting}
                >
                    <img className='w-4 h-4' src={crossIcon} alt='삭제' />
                </button>

                {/* 변환 중 오버레이 */}
                {conversionState.isConverting && (
                    <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50'>
                        <div className='text-sm text-white'>변환 중...</div>
                    </div>
                )}

                {/* 에러 표시 */}
                {conversionState.conversionError && (
                    <div className='absolute bottom-2 left-2 right-2'>
                        <div className='px-2 py-1 text-xs text-white bg-red-500 rounded'>
                            {conversionState.conversionError}
                        </div>
                    </div>
                )}

                {/* 파일 형식 표시 */}
                <div className='absolute top-2 left-2'>
                    <span className='px-1 py-0.5 text-xs text-white bg-black bg-opacity-50 rounded'>
                        {conversionState.fileType}
                    </span>
                </div>
            </div>
        )
    },
    (prevProps, nextProps) => {
        // 극도로 엄격한 비교
        if (!prevProps.file?.id || !nextProps.file?.id) return false

        return prevProps.file.id === nextProps.file.id && prevProps.onDelete === nextProps.onDelete
    }
)

FilePreview.displayName = 'FilePreview'

export default FilePreview
