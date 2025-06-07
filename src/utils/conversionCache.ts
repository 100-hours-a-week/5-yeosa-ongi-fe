// utils/conversionCache.ts

import { convertHEICtoJPG } from '@/services/imageConversionService'

/**
 * 변환된 파일 정보
 */
interface ConvertedFileData {
    originalFile: File
    convertedFile: File
    previewUrl: string
    convertedAt: number
}

/**
 * 파일 고유 키 생성
 * 파일명, 크기, 수정일시를 조합하여 동일한 파일은 같은 키를 가지도록 함
 */
const generateFileKey = (file: File): string => {
    return `${file.name}_${file.size}_${file.lastModified}`
}

/**
 * HEIC 파일 여부 확인
 */
const isHeicFile = (file: File): boolean => {
    return (
        file.type === 'image/heic' ||
        file.type === 'image/heif' ||
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif')
    )
}

// 모듈 레벨 캐시 저장소
const conversionCache = new Map<string, ConvertedFileData>()

// 현재 변환 중인 파일들의 Promise를 저장 (중복 변환 방지)
const conversionPromises = new Map<string, Promise<ConvertedFileData>>()

/**
 * 변환 캐시 관리자
 */
export const ConversionCacheManager = {
    /**
     * 캐시에서 변환된 파일 조회
     */
    get(file: File): ConvertedFileData | null {
        const key = generateFileKey(file)
        return conversionCache.get(key) || null
    },

    /**
     * 파일이 현재 변환 중인지 확인
     */
    isConverting(file: File): boolean {
        const key = generateFileKey(file)
        return conversionPromises.has(key)
    },

    /**
     * 파일 변환 시작 (중복 변환 방지 포함)
     */
    async convert(file: File): Promise<ConvertedFileData> {
        const key = generateFileKey(file)

        // 1. 이미 변환된 파일이 있는지 확인
        const cached = conversionCache.get(key)
        if (cached) {
            return cached
        }

        // 2. 현재 변환 중인지 확인 (중복 변환 방지)
        const existingPromise = conversionPromises.get(key)
        if (existingPromise) {
            return existingPromise
        }

        // 3. HEIC 파일이 아니면 원본 그대로 캐싱
        if (!isHeicFile(file)) {
            const previewUrl = URL.createObjectURL(file)
            const data: ConvertedFileData = {
                originalFile: file,
                convertedFile: file,
                previewUrl,
                convertedAt: Date.now(),
            }

            conversionCache.set(key, data)
            return data
        }

        // 4. HEIC 파일 변환 시작
        const conversionPromise = this._performConversion(file, key)
        conversionPromises.set(key, conversionPromise)

        try {
            const result = await conversionPromise
            return result
        } finally {
            // 변환 완료 또는 실패 시 Promise에서 제거
            conversionPromises.delete(key)
        }
    },

    /**
     * 실제 HEIC 변환 수행 (내부 메서드)
     */
    async _performConversion(file: File, key: string): Promise<ConvertedFileData> {
        try {
            console.log('HEIC 변환 시작:', file.name)

            const convertedFile = await convertHEICtoJPG(file, {
                quality: 0.8,
                toType: 'image/jpeg',
            })

            const previewUrl = URL.createObjectURL(convertedFile as File)

            const data: ConvertedFileData = {
                originalFile: file,
                convertedFile: convertedFile as File,
                previewUrl,
                convertedAt: Date.now(),
            }

            // 캐시에 저장
            conversionCache.set(key, data)

            console.log('HEIC 변환 완료:', file.name)
            return data
        } catch (error) {
            console.error('HEIC 변환 실패:', file.name, error)
            throw error
        }
    },

    /**
     * 특정 파일을 캐시에서 제거
     */
    remove(file: File): void {
        const key = generateFileKey(file)
        const cached = conversionCache.get(key)

        if (cached) {
            // URL 객체 해제
            URL.revokeObjectURL(cached.previewUrl)
            conversionCache.delete(key)
        }

        // 변환 중이던 Promise도 제거
        conversionPromises.delete(key)
    },

    /**
     * 전체 캐시 정리
     */
    clear(): void {
        // 모든 URL 객체 해제
        conversionCache.forEach(data => {
            URL.revokeObjectURL(data.previewUrl)
        })

        conversionCache.clear()
        conversionPromises.clear()
    },

    /**
     * 캐시 상태 정보
     */
    getStatus() {
        return {
            cacheSize: conversionCache.size,
            convertingCount: conversionPromises.size,
            cachedFiles: Array.from(conversionCache.keys()),
            convertingFiles: Array.from(conversionPromises.keys()),
        }
    },

    /**
     * 오래된 캐시 정리 (선택적)
     * @param maxAgeMs 최대 보관 시간 (기본: 1시간)
     */
    cleanOldCache(maxAgeMs: number = 60 * 60 * 1000): void {
        const now = Date.now()
        const toRemove: string[] = []

        conversionCache.forEach((data, key) => {
            if (now - data.convertedAt > maxAgeMs) {
                toRemove.push(key)
            }
        })

        toRemove.forEach(key => {
            const data = conversionCache.get(key)
            if (data) {
                URL.revokeObjectURL(data.previewUrl)
                conversionCache.delete(key)
            }
        })

        if (toRemove.length > 0) {
            console.log(`오래된 캐시 ${toRemove.length}개 정리 완료`)
        }
    },
}
