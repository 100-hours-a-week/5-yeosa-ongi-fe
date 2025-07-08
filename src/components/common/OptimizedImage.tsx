import { imageUrlGenerator, type ImageSize, type ImageUrls } from '@/utils/imageUrlGenerator'
import { useEffect, useState } from 'react'

interface OptimizedImageProps {
    src: string
    alt: string
    width?: number
    height?: number
    className?: string
    lazy?: boolean
    placeholder?: boolean
    onLoad?: () => void
    fetchpriority?: boolean
    aspectRatio?: string // Tailwind aspect ratio 클래스 (예: 'aspect-square', 'aspect-video')
    size?: ImageSize | 'original' // 이미지 크기 선택
    responsive?: boolean // 반응형 이미지 사용 여부
    waitForProcessing?: boolean // 처리 완료까지 대기 여부
}

const OptimizedImage = ({
    src,
    alt,
    width,
    height,
    className = '',
    lazy = true,
    placeholder = true,
    onLoad,
    fetchpriority = false,
    aspectRatio = 'aspect-square',
    size = 'medium',
    responsive = false,
    waitForProcessing = false,
}: OptimizedImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isError, setIsError] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [processedSrc, setProcessedSrc] = useState<string>('')
    const [allImageUrls, setAllImageUrls] = useState<ImageUrls | null>(null)

    // 처리된 이미지 URL 생성 및 대기 로직
    useEffect(() => {
        async function processImage() {
            if (!src || src === '/default-thumbnail.jpg') {
                setProcessedSrc(src)
                return
            }

            try {
                // 리사이징된 이미지 URLs 생성
                const urls = imageUrlGenerator.getAllImageUrls(src)
                setAllImageUrls(urls)

                if (waitForProcessing) {
                    setIsProcessing(true)
                    // 처리 완료까지 대기
                    if (size === 'original') {
                        setProcessedSrc(urls.original)
                        setIsProcessing(false)
                    } else {
                        const processedUrl = await imageUrlGenerator.waitForProcessedImage(src, size as ImageSize)
                        setProcessedSrc(processedUrl)
                        setIsProcessing(false)
                    }
                } else {
                    // 즉시 처리된 URL 사용 (존재하지 않을 수 있음)
                    if (size === 'original') {
                        setProcessedSrc(urls.original)
                    } else {
                        setProcessedSrc(urls[size as ImageSize])
                    }
                }
            } catch (error) {
                console.error('이미지 처리 실패:', error)
                setProcessedSrc(src) // 원본으로 폴백
                setIsProcessing(false)
            }
        }

        processImage()
    }, [src, size, waitForProcessing])

    // 이미지 소스 처리 로직
    const getImageSources = (imageUrl: string) => {
        if (!imageUrl || imageUrl === '/default-thumbnail.jpg') {
            return {
                webpSrc: undefined,
                fallbackSrc: imageUrl,
            }
        }

        // 이미 WebP인 경우
        if (imageUrl.endsWith('.webp')) {
            return {
                webpSrc: imageUrl,
                fallbackSrc: imageUrl,
            }
        }

        // JPG/JPEG인 경우
        return {
            webpSrc: undefined,
            fallbackSrc: imageUrl,
        }
    }

    const { webpSrc, fallbackSrc } = getImageSources(processedSrc || src)

    const handleLoad = () => {
        setIsLoaded(true)
        setIsError(false)
        onLoad?.()
    }

    const handleError = () => {
        // 처리된 이미지 로드 실패시 원본으로 폴백
        if (processedSrc !== src && allImageUrls) {
            setProcessedSrc(allImageUrls.original)
            return
        }
        setIsError(true)
        setIsLoaded(false)
    }

    // 컨테이너 클래스
    const containerClasses = `
        relative overflow-hidden bg-gray-200
        ${aspectRatio}
        ${width && height ? '' : 'w-full'}
        ${className}
    `.trim()

    // 이미지 클래스
    const imageClasses = `
        absolute inset-0 w-full h-full object-cover
        transition-opacity duration-300 ease-in-out
        ${isLoaded ? 'opacity-100' : 'opacity-0'}
    `.trim()

    // 스켈레톤 클래스
    const skeletonClasses = `
        absolute inset-0 w-full h-full
        bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200
        bg-[length:200%_100%] animate-shimmer
        transition-opacity duration-300 ease-in-out
        ${isLoaded ? 'opacity-0' : 'opacity-100'}
    `.trim()

    // 처리 중 상태 클래스
    const processingClasses = `
        absolute inset-0 w-full h-full
        flex items-center justify-center
        bg-blue-50 text-blue-600 text-sm
        transition-opacity duration-300 ease-in-out
        ${isProcessing ? 'opacity-100' : 'opacity-0 pointer-events-none'}
    `.trim()

    // 에러 상태 클래스
    const errorClasses = `
        absolute inset-0 w-full h-full
        flex items-center justify-center
        bg-red-50 text-red-400 text-sm
    `.trim()

    return (
        <div className={containerClasses} style={width && height ? { width: `${width}px`, height: `${height}px` } : {}}>
            {/* 스켈레톤 UI */}
            {placeholder && !isError && <div className={skeletonClasses} />}

            {/* 처리 중 상태 */}
            {isProcessing && (
                <div className={processingClasses}>
                    <div className='text-center'>
                        <div className='w-4 h-4 mx-auto mb-2 border-2 border-blue-600 rounded-full animate-spin border-t-transparent'></div>
                        <div className='text-xs opacity-80'>이미지 처리 중...</div>
                    </div>
                </div>
            )}

            {/* 실제 이미지 */}
            {!isError && processedSrc && (
                <picture className='absolute inset-0'>
                    {/* 반응형 이미지인 경우 */}
                    {responsive && allImageUrls && (
                        <>
                            <source media='(max-width: 400px)' srcSet={allImageUrls.thumbnail} />
                            <source media='(max-width: 800px)' srcSet={allImageUrls.medium} />
                            <source srcSet={allImageUrls.large} />
                        </>
                    )}

                    {/* WebP가 있는 경우만 source 태그 생성 */}
                    {webpSrc && <source srcSet={webpSrc} type='image/webp' />}

                    {/* 기본 fallback */}
                    <img
                        src={fallbackSrc}
                        alt={alt}
                        width={width}
                        height={height}
                        loading={lazy ? 'lazy' : 'eager'}
                        decoding='async'
                        onLoad={handleLoad}
                        onError={handleError}
                        fetchPriority={fetchpriority ? 'high' : 'low'}
                        className={imageClasses}
                    />
                </picture>
            )}

            {/* 에러 상태 */}
            {isError && (
                <div className={errorClasses}>
                    <div className='text-center'>
                        <div className='text-xs opacity-80'>이미지 로드 실패</div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OptimizedImage
