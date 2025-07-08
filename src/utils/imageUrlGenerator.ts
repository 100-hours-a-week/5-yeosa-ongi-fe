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
 * 이미지 URL 생성 및 관리를 위한 유틸리티 클래스
 */
export class ImageUrlGenerator {
    private readonly originalCdnUrl: string
    private readonly sizes: Record<ImageSize, SizeConfig>

    constructor(originalCdnUrl = 'https://cdn-dev.ongi.today') {
        this.originalCdnUrl = originalCdnUrl
        this.sizes = {
            thumbnail: { width: 200, height: 200 },
            medium: { width: 800, height: 600 },
            large: { width: 1200, height: 900 },
        }
    }

    /**
     * CDN URL에서 파일명만 추출
     */
    getFileNameFromCdnUrl(cdnUrl: string): string {
        return cdnUrl.split('/').pop() || ''
    }

    /**
     * 파일명에서 확장자 제거
     */
    getFileNameWithoutExtension(fileName: string): string {
        return fileName.replace(/\.[^/.]+$/, '')
    }

    /**
     * 특정 크기의 리사이징된 이미지 URL 생성 (같은 CDN, resized 폴더)
     */
    getResizedImageUrl(originalCdnUrlOrFileName: string, size: ImageSize = 'medium'): string {
        const fileName = originalCdnUrlOrFileName.includes('http')
            ? this.getFileNameFromCdnUrl(originalCdnUrlOrFileName)
            : originalCdnUrlOrFileName

        const fileNameWithoutExt = this.getFileNameWithoutExtension(fileName)
        const { width, height } = this.sizes[size]

        // 같은 CDN의 resized 폴더 사용
        return `${this.originalCdnUrl}/resized/${size}/${fileNameWithoutExt}_${width}x${height}.webp`
    }

    /**
     * 모든 크기의 이미지 URL 반환
     */
    getAllImageUrls(originalCdnUrlOrFileName: string): ImageUrls {
        const originalUrl = originalCdnUrlOrFileName.includes('http')
            ? originalCdnUrlOrFileName
            : `${this.originalCdnUrl}/${originalCdnUrlOrFileName}`

        return {
            thumbnail: this.getResizedImageUrl(originalCdnUrlOrFileName, 'thumbnail'),
            medium: this.getResizedImageUrl(originalCdnUrlOrFileName, 'medium'),
            large: this.getResizedImageUrl(originalCdnUrlOrFileName, 'large'),
            original: originalUrl,
        }
    }

    /**
     * 반응형 이미지를 위한 srcSet 생성
     */
    generateSrcSet(originalCdnUrlOrFileName: string): string {
        const urls = this.getAllImageUrls(originalCdnUrlOrFileName)
        return `
            ${urls.thumbnail} 200w,
            ${urls.medium} 800w,
            ${urls.large} 1200w
        `.trim()
    }

    /**
     * 이미지 존재 여부 확인 (향상된 버전)
     */
    async checkImageExists(url: string): Promise<boolean> {
        try {
            // 먼저 HEAD 요청으로 시도
            const headResponse = await fetch(url, {
                method: 'HEAD',
                cache: 'no-cache', // 캐시 무시
            })

            if (headResponse.ok) {
                return true
            }

            // HEAD 요청 실패시 GET 요청으로 재시도 (CORS 문제일 수 있음)
            const getResponse = await fetch(url, {
                method: 'GET',
                cache: 'no-cache',
            })

            return getResponse.ok
        } catch (error) {
            console.warn(`이미지 존재 확인 실패: ${url}`, error)
            return false
        }
    }

    /**
     * 더 안전한 이미지 존재 확인 (img 태그 사용)
     */
    async checkImageExistsWithImg(url: string): Promise<boolean> {
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

            // 캐시 방지를 위해 타임스탬프 추가
            img.src = `${url}?t=${Date.now()}`

            // 10초 타임아웃
            setTimeout(() => {
                cleanup()
                resolve(false)
            }, 10000)
        })
    }

    /**
     * 처리된 이미지가 준비될 때까지 대기 (향상된 버전)
     */
    async waitForProcessedImage(
        originalCdnUrlOrFileName: string,
        size: ImageSize = 'medium',
        maxAttempts: number = 15,
        useImgCheck: boolean = true // img 태그 방식 사용 여부
    ): Promise<string> {
        const url = this.getResizedImageUrl(originalCdnUrlOrFileName, size)

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            console.log(`이미지 처리 대기 중... (${attempt}/${maxAttempts}) - ${url}`)

            const exists = useImgCheck ? await this.checkImageExistsWithImg(url) : await this.checkImageExists(url)

            if (exists) {
                console.log(`✅ 이미지 처리 완료: ${url}`)
                return url
            }

            // 대기 시간을 점진적으로 증가 (첫 번째는 1초, 이후 2초)
            const waitTime = attempt === 1 ? 1000 : 2000
            await new Promise(resolve => setTimeout(resolve, waitTime))
        }

        console.warn(`⚠️ 이미지 처리 시간 초과: ${url}`)
        throw new Error(`이미지 처리 시간 초과: ${url}`)
    }

    /**
     * 크기 설정 정보 반환
     */
    getSizeConfig(size: ImageSize): SizeConfig {
        return this.sizes[size]
    }

    /**
     * 모든 크기 설정 정보 반환
     */
    getAllSizeConfigs(): Record<ImageSize, SizeConfig> {
        return { ...this.sizes }
    }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const imageUrlGenerator = new ImageUrlGenerator()

// 편의성을 위한 헬퍼 함수들
export const getResizedImageUrl = (originalUrl: string, size: ImageSize = 'medium') =>
    imageUrlGenerator.getResizedImageUrl(originalUrl, size)

export const getAllImageUrls = (originalUrl: string) => imageUrlGenerator.getAllImageUrls(originalUrl)

export const generateSrcSet = (originalUrl: string) => imageUrlGenerator.generateSrcSet(originalUrl)

export const waitForProcessedImage = (originalUrl: string, size: ImageSize = 'medium', maxAttempts?: number) =>
    imageUrlGenerator.waitForProcessedImage(originalUrl, size, maxAttempts)
