import { gps } from 'exifr'
import ExifReader from 'exifreader'

export interface GPSMetadata {
    latitude: number | null | string
    longitude: number | null | string
    altitude?: number | null
    hasGPS: boolean
}

/**
 * 파일 확장자 기반 검사
 */
export const hasHEICExtension = (fileName: string): boolean => {
    const name = fileName.toLowerCase()
    return name.endsWith('.heic') || name.endsWith('.heif')
}

/**
 * MIME 타입 기반 검사
 */
export const hasHEICMimeType = (mimeType: string): boolean => {
    return mimeType === 'image/heic' || mimeType === 'image/heif'
}

/**
 * 종합적인 HEIC 파일 검사
 */
export const isHEICFile = (file: File): boolean => {
    return hasHEICMimeType(file.type) || hasHEICExtension(file.name)
}

/**
 * 더 엄격한 검사 (MIME 타입 우선)
 */
export const isHEICFileStrict = (file: File): boolean => {
    // MIME 타입이 있으면 우선 신뢰
    if (file.type) {
        return hasHEICMimeType(file.type)
    }
    // MIME 타입이 없으면 확장자로 판단
    return hasHEICExtension(file.name)
}

/**
 * 파일 타입 상세 정보 반환
 */
export const getFileTypeInfo = (file: File) => {
    return {
        mimeType: file.type,
        extension: getFileExtension(file.name),
        isHEICByMime: hasHEICMimeType(file.type),
        isHEICByExtension: hasHEICExtension(file.name),
        isHEIC: isHEICFile(file),
    }
}

/**
 * 파일 확장자 추출
 */
export const getFileExtension = (fileName: string): string => {
    const lastDotIndex = fileName.lastIndexOf('.')
    return lastDotIndex !== -1 ? fileName.slice(lastDotIndex).toLowerCase() : ''
}

/**
 * 지원되는 이미지 파일인지 검사
 */
export const isSupportedImageFile = (file: File): boolean => {
    const supportedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
    const supportedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif']
    return (
        supportedMimeTypes.includes(file.type) || supportedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    )
}

/**
 * GPS 메타데이터 추출 (모든 이미지 형식 지원)
 */
export const extractGPSMetadata = async (file: File): Promise<GPSMetadata> => {
    try {
        console.log('GPS 메타데이터 추출 시작:', file.name)

        const gpsData = await gps(file)

        if (gpsData && typeof gpsData.latitude === 'number' && typeof gpsData.longitude === 'number') {
            console.log('GPS 데이터 발견:', gpsData)
            return {
                latitude: gpsData.latitude,
                longitude: gpsData.longitude,
                hasGPS: true,
            }
        }

        console.log('GPS 데이터 없음:', file.name)
        return {
            latitude: null,
            longitude: null,
            hasGPS: false,
        }
    } catch (error) {
        console.warn('GPS 추출 실패:', file.name, error)
        return {
            latitude: null,
            longitude: null,
            hasGPS: false,
        }
    }
}

// GPS DMS(도분초)를 십진수로 변환하는 함수
const convertDMSToDD = (dmsArray: number[], direction: string): number => {
    if (!dmsArray || dmsArray.length < 3) return 0
    const [degrees, minutes, seconds] = dmsArray
    let dd = degrees + minutes / 60 + seconds / (60 * 60)
    if (direction === 'S' || direction === 'W') {
        dd = dd * -1
    }
    return dd
}

// 분수를 소수로 변환 (ExifReader에서 분수 형태로 오는 경우)
const parseFraction = (fraction: any): number => {
    if (typeof fraction === 'number') return fraction
    if (typeof fraction === 'string' && fraction.includes('/')) {
        const [numerator, denominator] = fraction.split('/').map(Number)
        return numerator / denominator
    }
    return parseFloat(fraction) || 0
}

/**
 * JPEG 파일의 GPS 메타데이터 추출 (ExifReader 사용)
 */
export const extractJPEGGPSMetadata = async (file: File): Promise<GPSMetadata> => {
    try {
        const tags = await ExifReader.load(file)

        const gpsLat = tags['GPSLatitude']
        const gpsLatRef = tags['GPSLatitudeRef']
        const gpsLon = tags['GPSLongitude']
        const gpsLonRef = tags['GPSLongitudeRef']
        const gpsAlt = tags['GPSAltitude']

        if (gpsLat?.value && gpsLatRef?.value && gpsLon?.value && gpsLonRef?.value) {
            const latitude = gpsLat.description
            const longitude = gpsLon.description
            const altitude = gpsAlt?.value ? parseFraction(gpsAlt.value) : null

            return {
                latitude,
                longitude,
                altitude,
                hasGPS: true,
            }
        }
        console.log('GPS 데이터 발견:')
        return {
            latitude: null,
            longitude: null,
            hasGPS: false,
        }
    } catch (error) {
        console.error('JPEG GPS 데이터 추출 중 오류:', error)
        return {
            latitude: null,
            longitude: null,
            hasGPS: false,
        }
    }
}

/**
 * 통합 GPS 메타데이터 추출 함수
 */
export const extractImageGPSMetadata = async (file: File): Promise<GPSMetadata> => {
    // HEIC 파일이거나 exifr이 더 안정적인 경우
    if (isHEICFile(file)) {
        return extractGPSMetadata(file)
    }

    // JPEG 등 다른 형식은 ExifReader 시도 후 exifr로 fallback
    try {
        const result = await extractJPEGGPSMetadata(file)
        if (result.hasGPS) {
            return result
        }
    } catch (error) {
        console.warn('ExifReader GPS 추출 실패, exifr로 재시도:', error)
    }

    // fallback to exifr
    return extractGPSMetadata(file)
}
