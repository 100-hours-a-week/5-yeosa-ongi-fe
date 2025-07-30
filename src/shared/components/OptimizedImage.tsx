import { imageUrlGenerator, type ImageSize, type ImageUrls } from '@/domains/album/utils/imageUrlGenerator'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'

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
    aspectRatio?: string
    size?: ImageSize | 'original'
    responsive?: boolean
    waitForProcessing?: boolean
}

const OptimizedImage = memo(
    ({
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

        // 이미지 처리 로직을 useCallback으로 최적화
        const processImage = useCallback(async () => {
            if (!src || src === '/default-thumbnail.jpg') {
                setProcessedSrc(src)
                return
            }

            try {
                const urls = imageUrlGenerator.getAllImageUrls(src)
                setAllImageUrls(urls)

                if (waitForProcessing) {
                    setIsProcessing(true)
                    if (size === 'original') {
                        setProcessedSrc(urls.original)
                        setIsProcessing(false)
                    } else {
                        const processedUrl = await imageUrlGenerator.waitForProcessedImage(src, size as ImageSize)
                        setProcessedSrc(processedUrl)
                        setIsProcessing(false)
                    }
                } else {
                    if (size === 'original') {
                        setProcessedSrc(urls.original)
                    } else {
                        setProcessedSrc(urls[size as ImageSize])
                    }
                }
            } catch (error) {
                console.error('이미지 처리 실패:', error)
                setProcessedSrc(src)
                setIsProcessing(false)
            }
        }, [src, size, waitForProcessing]) // 의존성 배열 명시

        useEffect(() => {
            processImage()
        }, [processImage])

        // 이미지 소스 처리 로직을 useMemo로 최적화
        const imageSources = useMemo(() => {
            const imageUrl = processedSrc || src

            if (!imageUrl || imageUrl === '/default-thumbnail.jpg') {
                return {
                    webpSrc: undefined,
                    fallbackSrc: imageUrl,
                }
            }

            if (imageUrl.endsWith('.webp')) {
                return {
                    webpSrc: imageUrl,
                    fallbackSrc: imageUrl,
                }
            }

            return {
                webpSrc: undefined,
                fallbackSrc: imageUrl,
            }
        }, [processedSrc, src])

        // 이벤트 핸들러들을 useCallback으로 최적화
        const handleLoad = useCallback(() => {
            setIsLoaded(true)
            setIsError(false)
            onLoad?.()
        }, [onLoad])

        const handleError = useCallback(() => {
            if (processedSrc !== src && allImageUrls) {
                setProcessedSrc(allImageUrls.original)
                return
            }
            setIsError(true)
            setIsLoaded(false)
        }, [processedSrc, src, allImageUrls])

        // CSS 클래스들을 useMemo로 최적화
        const containerClasses = useMemo(() => {
            return ['relative overflow-hidden bg-gray-200', aspectRatio, width && height ? '' : 'w-full', className]
                .filter(Boolean)
                .join(' ')
        }, [aspectRatio, width, height, className])

        const imageClasses = useMemo(() => {
            return [
                'absolute inset-0 w-full h-full object-cover',
                'transition-opacity duration-300 ease-in-out',
                isLoaded ? 'opacity-100' : 'opacity-0',
            ].join(' ')
        }, [isLoaded])

        const skeletonClasses = useMemo(() => {
            return [
                'absolute inset-0 w-full h-full',
                'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200',
                'bg-[length:200%_100%] animate-shimmer',
                'transition-opacity duration-300 ease-in-out',
                isLoaded ? 'opacity-0' : 'opacity-100',
            ].join(' ')
        }, [isLoaded])

        const processingClasses = useMemo(() => {
            return [
                'absolute inset-0 w-full h-full',
                'flex items-center justify-center',
                'bg-blue-50 text-blue-600 text-sm',
                'transition-opacity duration-300 ease-in-out',
                isProcessing ? 'opacity-100' : 'opacity-0 pointer-events-none',
            ].join(' ')
        }, [isProcessing])

        const errorClasses = useMemo(() => {
            return [
                'absolute inset-0 w-full h-full',
                'flex items-center justify-center',
                'bg-red-50 text-red-400 text-sm',
            ].join(' ')
        }, [])

        // 인라인 스타일을 useMemo로 최적화
        const containerStyle = useMemo(() => {
            return width && height ? { width: `${width}px`, height: `${height}px` } : {}
        }, [width, height])

        // 반응형 소스들을 useMemo로 최적화
        const responsiveSources = useMemo(() => {
            if (!responsive || !allImageUrls) return null

            return (
                <>
                    <source media='(max-width: 400px)' srcSet={allImageUrls.thumbnail} />
                    <source media='(max-width: 800px)' srcSet={allImageUrls.medium} />
                    <source srcSet={allImageUrls.large} />
                </>
            )
        }, [responsive, allImageUrls])

        return (
            <div className={containerClasses} style={containerStyle}>
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
                        {responsiveSources}

                        {imageSources.webpSrc && <source srcSet={imageSources.webpSrc} type='image/webp' />}

                        <img
                            src={imageSources.fallbackSrc}
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
)

OptimizedImage.displayName = 'OptimizedImage'

export default OptimizedImage
