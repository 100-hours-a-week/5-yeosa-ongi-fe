// OptimizedImage.tsx - 기존 컴포넌트 개선
interface OptimizedImageProps {
    src: string
    webpSrc?: string
    avifSrc?: string // 추가
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
    webpSrc,
    avifSrc, // 추가
    alt,
    width,
    height,
    className,
    lazy = true,
    placeholder = true,
    onLoad,
}: OptimizedImageProps) => {
    return (
        <picture className={className}>
            {/* AVIF 우선 */}
            {avifSrc && <source srcSet={avifSrc} type='image/avif' />}

            {/* WebP 차선 */}
            {webpSrc && <source srcSet={webpSrc} type='image/webp' />}

            {/* 기본 fallback */}
            <img
                src={src}
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
