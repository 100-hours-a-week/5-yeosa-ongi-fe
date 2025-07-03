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
    width: number
    height: number
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

function OptimizedImage({
    src,
    webpSrc,
    alt = '',
    className = '',
    style = {},
    lazy = true,
    placeholder = true,
    width,
    height,
    onLoad,
    onError,
    ...props
}: OptimizedImageProps) {
    const { supportsWebP, isChecked } = useWebPSupport()
    const { elementRef, isInView } = useIntersectionObserver()
    const [isLoaded, setIsLoaded] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [currentSrc, setCurrentSrc] = useState('')

    useEffect(() => {
        if (!isChecked) return
        setIsLoaded(false)
        setHasError(false)
        const imageSrc = supportsWebP && webpSrc ? webpSrc : src
        setCurrentSrc(imageSrc)
    }, [src, webpSrc, supportsWebP, isChecked])

    const handleLoad = useCallback(() => {
        setIsLoaded(true)
        onLoad?.()
    }, [onLoad])

    const handleError = useCallback(() => {
        if (currentSrc.includes('.webp') && currentSrc !== src) {
            setCurrentSrc(src)
            setHasError(false)
        } else {
            setHasError(true)
            onError?.()
        }
    }, [currentSrc, src, onError])

    const shouldLoad = !lazy || isInView

    if (hasError) {
        return (
            <div
                className={`flex items-center justify-center bg-gray-100 ${className}`}
                style={{ width, height, ...style }}
            >
                <span className='text-sm text-gray-500'>로드 실패</span>
            </div>
        )
    }

    return (
        <>
            <div ref={elementRef} className='absolute inset-0 pointer-events-none' />
            {shouldLoad && isChecked && currentSrc ? (
                <img
                    src={currentSrc}
                    alt={alt}
                    width={width}
                    height={height}
                    onLoad={handleLoad}
                    onError={handleError}
                    className={className}
                    style={style}
                    loading={lazy ? 'lazy' : 'eager'}
                    {...props}
                />
            ) : placeholder ? (
                <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
                    <div className='w-8 h-8 border-4 border-gray-300 rounded-full border-t-blue-500 animate-spin' />
                </div>
            ) : null}
        </>
    )
}
export default OptimizedImage
