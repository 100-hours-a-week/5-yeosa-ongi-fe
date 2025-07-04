import { useState } from 'react'

interface OptimizedImageProps {
    src: string
    alt: string
    width?: number
    height?: number
    className?: string
    lazy?: boolean
    placeholder?: boolean
    onLoad?: () => void
    aspectRatio?: string // Tailwind aspect ratio 클래스 (예: 'aspect-square', 'aspect-video')
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
    aspectRatio = 'aspect-square',
}: OptimizedImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isError, setIsError] = useState(false)

    // 이미지 소스 처리 로직을 내부에서 처리
    const getImageSources = (originalUrl: string) => {
        if (!originalUrl || originalUrl === '/default-thumbnail.jpg') {
            return {
                webpSrc: undefined,
                fallbackSrc: originalUrl,
            }
        }

        // 이미 WebP인 경우: WebP 그대로 사용
        if (originalUrl.endsWith('.webp')) {
            return {
                webpSrc: originalUrl,
                fallbackSrc: originalUrl,
            }
        }

        // JPG/JPEG인 경우: JPG를 fallback으로 사용, WebP는 undefined
        return {
            webpSrc: undefined,
            fallbackSrc: originalUrl,
        }
    }

    const { webpSrc, fallbackSrc } = getImageSources(src)

    const handleLoad = () => {
        setIsLoaded(true)
        setIsError(false)
        onLoad?.()
    }

    const handleError = () => {
        setIsError(true)
        setIsLoaded(false)
    }

    // 컨테이너 클래스 - 고정 비율 확보
    const containerClasses = `
        relative overflow-hidden bg-gray-200
        ${aspectRatio}
        ${width && height ? '' : 'w-full'}
        ${className}
    `.trim()

    // 이미지 클래스 - 부드러운 전환
    const imageClasses = `
        absolute inset-0 w-full h-full object-cover
        transition-opacity duration-300 ease-in-out
        ${isLoaded ? 'opacity-100' : 'opacity-0'}
    `.trim()

    // 스켈레톤 클래스 - shimmer 애니메이션
    const skeletonClasses = `
        absolute inset-0 w-full h-full
        bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200
        bg-[length:200%_100%] animate-shimmer
        transition-opacity duration-300 ease-in-out
        ${isLoaded ? 'opacity-0' : 'opacity-100'}
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

            {/* 실제 이미지 */}
            {!isError && (
                <picture className='absolute inset-0'>
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
