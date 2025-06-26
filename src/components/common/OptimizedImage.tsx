import React, { CSSProperties, ImgHTMLAttributes, useCallback, useEffect, useRef, useState } from 'react'

// TypeScript 인터페이스 정의
interface WebPSupportResult {
    supportsWebP: boolean
    isChecked: boolean
}

interface IntersectionObserverResult {
    elementRef: React.RefObject<HTMLDivElement | null>
    isInView: boolean
}

interface IntersectionObserverOptions {
    threshold?: number
    rootMargin?: string
}

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onLoad' | 'onError'> {
    src: string
    webpSrc?: string
    alt?: string
    className?: string
    style?: CSSProperties
    lazy?: boolean
    placeholder?: boolean
    quality?: number
    onLoad?: () => void
    onError?: () => void
    sizes?: string
}

// WebP 지원 확인 Hook
function useWebPSupport(): WebPSupportResult {
    const [supportsWebP, setSupportsWebP] = useState<boolean>(false)
    const [isChecked, setIsChecked] = useState<boolean>(false)

    useEffect(() => {
        const checkWebPSupport = async () => {
            try {
                // 더 정확한 WebP 지원 확인
                const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA='

                const img = new Image()
                img.onload = () => {
                    setSupportsWebP(img.width === 1 && img.height === 1)
                    setIsChecked(true)
                }
                img.onerror = () => {
                    setSupportsWebP(false)
                    setIsChecked(true)
                }
                img.src = webpData
            } catch (error) {
                setSupportsWebP(false)
                setIsChecked(true)
            }
        }

        checkWebPSupport()
    }, [])

    return { supportsWebP, isChecked }
}

// Intersection Observer Hook
function useIntersectionObserver(options: IntersectionObserverOptions = {}): IntersectionObserverResult {
    const [isInView, setIsInView] = useState<boolean>(false)
    const [isObserved, setIsObserved] = useState<boolean>(false)
    const elementRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const element = elementRef.current
        if (!element) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isObserved) {
                    setIsInView(true)
                    setIsObserved(true)
                    observer.unobserve(element)
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px',
                ...options,
            }
        )

        observer.observe(element)

        return () => {
            if (element) {
                observer.unobserve(element)
            }
            observer.disconnect()
        }
    }, [isObserved, options])

    return { elementRef, isInView }
}
// 메인 OptimizedImage 컴포넌트
function OptimizedImage({
    src,
    webpSrc,
    alt = '',
    className = '',
    style = {},
    lazy = true,
    placeholder = true,
    quality = 75,
    onLoad,
    onError,
    sizes,
    ...props
}: OptimizedImageProps) {
    const { supportsWebP, isChecked } = useWebPSupport()
    const { elementRef, isInView } = useIntersectionObserver()
    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    const [hasError, setHasError] = useState<boolean>(false)
    const [currentSrc, setCurrentSrc] = useState<string>('')

    // 이미지 소스 결정 - 의존성 배열 최소화
    useEffect(() => {
        if (!isChecked) return

        // 상태 초기화
        setIsLoaded(false)
        setHasError(false)

        let imageSrc = src

        // WebP 지원 시 webpSrc 사용
        if (supportsWebP && webpSrc) {
            imageSrc = webpSrc
        }

        setCurrentSrc(imageSrc)
    }, [src, webpSrc, supportsWebP, isChecked]) // isWebpFailed 제거

    const handleLoad = useCallback(() => {
        setIsLoaded(true)
        setHasError(false)
        onLoad?.()
    }, [onLoad])

    const handleError = useCallback(() => {
        // WebP 실패 시 즉시 원본으로 전환
        if (currentSrc.includes('.webp') && currentSrc !== src) {
            setCurrentSrc(src)
            setHasError(false)
        } else {
            setHasError(true)
            onError?.()
        }
    }, [currentSrc, src, onError])

    // Lazy loading 체크
    const shouldLoad = !lazy || isInView

    // 스타일 정의
    const placeholderStyle: CSSProperties = {
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        ...style,
    }

    const imageStyle: CSSProperties = {
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        ...style,
    }

    return (
        <div
            ref={elementRef}
            className={`optimized-image-container ${className}`}
            style={{ position: 'relative', overflow: 'hidden' }}
        >
            {/* 로딩 플레이스홀더 */}
            {placeholder && !isLoaded && !hasError && shouldLoad && (
                <div style={placeholderStyle}>
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid #3498db',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                        }}
                    />
                </div>
            )}

            {/* 에러 플레이스홀더 */}
            {hasError && (
                <div style={placeholderStyle}>
                    <span style={{ color: '#999', fontSize: '14px' }}>이미지를 불러올 수 없습니다</span>
                </div>
            )}

            {/* 실제 이미지 */}
            {shouldLoad && isChecked && currentSrc && !hasError && (
                <img
                    src={currentSrc}
                    alt={alt}
                    onLoad={handleLoad}
                    onError={handleError}
                    style={imageStyle}
                    loading={lazy ? 'lazy' : 'eager'}
                    {...props}
                />
            )}
        </div>
    )
}

export default OptimizedImage
