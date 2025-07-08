// utils/imageUrlGenerator.ts

export type ImageSize = 'thumbnail' | 'medium' | 'large'

export interface ImageUrls {
    thumbnail: string
    medium: string
    large: string
    original: string
}

export interface SizeConfig {
    width: number
    height: number
}

/**
 * 환경변수 기반 이미지 URL 생성 유틸리티
 */
export class ImageUrlGenerator {
    private readonly cdnUrl: string
    private readonly sizes: Record<ImageSize, SizeConfig>

    constructor() {
        // 환경변수에서 CDN URL 가져오기
        this.cdnUrl = this.getCdnUrl()
        this.sizes = {
            thumbnail: { width: 200, height: 200 },
            medium: { width: 800, height: 600 },
            large: { width: 1200, height: 900 },
        }
    }

    /**
     * 환경변수에서 CDN URL 추출 (Vite 환경)
     */
    private getCdnUrl(): string {
        // Vite 환경변수 (VITE_ 접두사)
        const envCdnUrl = import.meta.env.VITE_CDN_URL

        if (envCdnUrl) {
            return envCdnUrl
        }

        // 환경변수가 없을 때 MODE 기반 기본값 (Vite의 NODE_ENV 대신 MODE 사용)
        const mode = import.meta.env.MODE || 'development'

        switch (mode) {
            case 'production':
                return 'https://cdn.ongi.today'
            case 'staging':
                return 'https://cdn-staging.ongi.today'
            default:
                return 'https://cdn-dev.ongi.today'
        }
    }

    /**
     * CDN URL에서 파일명만 추출
     */
    private extractFileName(urlOrFileName: string): string {
        if (!urlOrFileName.includes('http')) {
            return urlOrFileName
        }
        return urlOrFileName.split('/').pop() || ''
    }

    /**
     * 파일명에서 확장자 제거
     */
    private removeFileExtension(fileName: string): string {
        return fileName.replace(/\.[^/.]+$/, '')
    }

    /**
     * 특정 크기의 리사이징된 이미지 URL 생성
     */
    getResizedImageUrl(originalUrlOrFileName: string, size: ImageSize = 'medium'): string {
        const fileName = this.extractFileName(originalUrlOrFileName)
        const fileNameWithoutExt = this.removeFileExtension(fileName)
        const { width, height } = this.sizes[size]

        return `${this.cdnUrl}/resized/${size}/${fileNameWithoutExt}_${width}x${height}.webp`
    }

    /**
     * 원본 이미지 URL 생성
     */
    getOriginalImageUrl(originalUrlOrFileName: string): string {
        if (originalUrlOrFileName.includes('http')) {
            return originalUrlOrFileName
        }
        return `${this.cdnUrl}/${originalUrlOrFileName}`
    }

    /**
     * 모든 크기의 이미지 URL 반환
     */
    getAllImageUrls(originalUrlOrFileName: string): ImageUrls {
        return {
            thumbnail: this.getResizedImageUrl(originalUrlOrFileName, 'thumbnail'),
            medium: this.getResizedImageUrl(originalUrlOrFileName, 'medium'),
            large: this.getResizedImageUrl(originalUrlOrFileName, 'large'),
            original: this.getOriginalImageUrl(originalUrlOrFileName),
        }
    }

    /**
     * 반응형 이미지를 위한 srcSet 생성
     */
    generateSrcSet(originalUrlOrFileName: string): string {
        const urls = this.getAllImageUrls(originalUrlOrFileName)
        return [`${urls.thumbnail} 200w`, `${urls.medium} 800w`, `${urls.large} 1200w`].join(', ')
    }

    /**
     * img 태그를 사용한 이미지 존재 확인
     */
    checkImageExists(url: string): Promise<boolean> {
        return new Promise(resolve => {
            const img = new Image()

            const cleanup = () => {
                img.onload = null
                img.onerror = null
            }

            img.onload = () => {
                cleanup()
                resolve(true)
            }

            img.onerror = () => {
                cleanup()
                resolve(false)
            }

            // 캐시 방지
            img.src = `${url}?t=${Date.now()}`

            // 10초 타임아웃
            setTimeout(() => {
                cleanup()
                resolve(false)
            }, 10000)
        })
    }

    /**
     * 처리된 이미지가 준비될 때까지 대기
     */
    async waitForProcessedImage(
        originalUrlOrFileName: string,
        size: ImageSize = 'medium',
        maxAttempts: number = 15
    ): Promise<string> {
        const url = this.getResizedImageUrl(originalUrlOrFileName, size)

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            console.log(`🔄 이미지 처리 대기 중... (${attempt}/${maxAttempts})`)

            const exists = await this.checkImageExists(url)

            if (exists) {
                console.log(`✅ 이미지 처리 완료: ${url}`)
                return url
            }

            // 첫 번째 시도는 1초, 나머지는 2초 대기
            const waitTime = attempt === 1 ? 1000 : 2000
            await new Promise(resolve => setTimeout(resolve, waitTime))
        }

        console.warn(`⚠️ 이미지 처리 시간 초과: ${url}`)
        throw new Error(`이미지 처리 시간 초과`)
    }

    /**
     * 현재 CDN URL 반환
     */
    getCdnBaseUrl(): string {
        return this.cdnUrl
    }

    /**
     * 크기 설정 정보 반환
     */
    getSizeConfig(size: ImageSize): SizeConfig {
        return { ...this.sizes[size] }
    }

    /**
     * 모든 크기 설정 정보 반환
     */
    getAllSizeConfigs(): Record<ImageSize, SizeConfig> {
        return { ...this.sizes }
    }
}

// 싱글톤 인스턴스
export const imageUrlGenerator = new ImageUrlGenerator()

// 편의 함수들
export const getResizedImageUrl = (originalUrl: string, size: ImageSize = 'medium') =>
    imageUrlGenerator.getResizedImageUrl(originalUrl, size)

export const getAllImageUrls = (originalUrl: string) => imageUrlGenerator.getAllImageUrls(originalUrl)

export const generateSrcSet = (originalUrl: string) => imageUrlGenerator.generateSrcSet(originalUrl)

export const waitForProcessedImage = (originalUrl: string, size: ImageSize = 'medium', maxAttempts?: number) =>
    imageUrlGenerator.waitForProcessedImage(originalUrl, size, maxAttempts)

export const getOriginalImageUrl = (originalUrl: string) => imageUrlGenerator.getOriginalImageUrl(originalUrl)
