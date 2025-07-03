interface OptimizedImageProps {
    src: string
    alt: string
    width?: number
    height?: number
    className?: string
    lazy?: boolean
    placeholder?: boolean
    onLoad?: () => void
}

const OptimizedImage = ({
    src,
    alt,
    width,
    height,
    className,
    lazy = true,
    placeholder = true,
    onLoad,
}: OptimizedImageProps) => {
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

    return (
        <picture className={className}>
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
                onLoad={onLoad}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
            />
        </picture>
    )
}

export default OptimizedImage
