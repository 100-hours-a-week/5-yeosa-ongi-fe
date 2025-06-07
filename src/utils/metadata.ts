// utils/metadata.ts (정적 import 버전)

// exifr를 정적으로 import
import { gps, parse } from 'exifr'

// 기존 타입 정의들...
export interface GPSMetadata {
    latitude: number | null
    longitude: number | null
    altitude?: number | null
    hasGPS: boolean
    accuracy?: {
        horizontal?: number
        unit: string
    } | null
    extractedAt?: number
    extractionSkipped?: boolean
    extractionFailed?: boolean
    skipReason?: string
    error?: string
    message?: string
}

export interface EXIFMetadata {
    camera?: {
        make: string | null
        model: string | null
        software: string | null
    }
    dateTime?: {
        dateTime: string | null
        dateTimeOriginal: string | null
        formatted: any
    }
    settings?: {
        exposureTime: number | null
        fNumber: number | null
        iso: number | null
        focalLength: number | null
        flash: number | null
        whiteBalance: number | null
    }
    image?: {
        width: number | null
        height: number | null
        orientation: number | null
    }
    extractedAt?: number
    extractionSkipped?: boolean
    extractionFailed?: boolean
    skipReason?: string
    error?: string
    message?: string
}

/**
 * HEIC 파일 여부 확인
 */
export const isHEICFile = (file: File): boolean => {
    return (
        file.type === 'image/heic' ||
        file.type === 'image/heif' ||
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif')
    )
}

/**
 * GPS 메타데이터 추출
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
                altitude: gpsData.latitude || null,
                hasGPS: true,
                accuracy: calculateGPSAccuracy(gpsData),
                extractedAt: Date.now(),
            }
        }

        console.log('GPS 데이터 없음:', file.name)
        return {
            latitude: null,
            longitude: null,
            hasGPS: false,
            extractionSkipped: false,
            message: 'GPS 정보가 없습니다.',
        }
    } catch (error) {
        console.warn('GPS 추출 실패:', file.name, error)
        return {
            latitude: null,
            longitude: null,
            hasGPS: false,
            extractionFailed: true,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

/**
 * HEIC 파일 메타데이터 추출 (원본 파일에서 직접 추출)
 */
export const extractHEICMetadata = async (file: File): Promise<{ gps?: GPSMetadata; exif?: EXIFMetadata } | null> => {
    try {
        console.log('HEIC 원본 파일에서 메타데이터 추출 시작:', file.name)

        const result: { gps?: GPSMetadata; exif?: EXIFMetadata } = {}

        // GPS 데이터 추출 시도
        try {
            console.log('HEIC 파일에서 GPS 추출 시도')
            const gpsData = await gps(file)

            if (gpsData && typeof gpsData.latitude === 'number' && typeof gpsData.longitude === 'number') {
                console.log('HEIC GPS 데이터 성공:', gpsData)
                result.gps = {
                    latitude: gpsData.latitude,
                    longitude: gpsData.longitude,
                    altitude: gpsData.latitude || null,
                    hasGPS: true,
                    accuracy: calculateGPSAccuracy(gpsData),
                    extractedAt: Date.now(),
                }
            } else {
                console.log('HEIC GPS 데이터 없음')
                result.gps = {
                    latitude: null,
                    longitude: null,
                    hasGPS: false,
                    message: 'HEIC 파일에 GPS 정보가 없습니다.',
                }
            }
        } catch (gpsError) {
            console.warn('HEIC GPS 추출 실패:', gpsError)
            result.gps = {
                latitude: null,
                longitude: null,
                hasGPS: false,
                extractionFailed: true,
                error: gpsError instanceof Error ? gpsError.message : 'GPS 추출 실패',
            }
        }

        // EXIF 데이터 추출 시도
        try {
            console.log('HEIC 파일에서 EXIF 추출 시도')
            const exifData = await parse(file, {
                pick: [
                    'Make',
                    'Model',
                    'DateTime',
                    'DateTimeOriginal',
                    'ExposureTime',
                    'FNumber',
                    'ISO',
                    'FocalLength',
                    'Flash',
                    'WhiteBalance',
                    'ImageWidth',
                    'ImageHeight',
                    'Orientation',
                    'Software',
                ],
            })

            if (exifData && typeof exifData === 'object') {
                console.log('HEIC EXIF 데이터 성공:', exifData)
                result.exif = {
                    camera: {
                        make: exifData.Make || null,
                        model: exifData.Model || null,
                        software: exifData.Software || null,
                    },
                    dateTime: {
                        dateTime: exifData.DateTime || null,
                        dateTimeOriginal: exifData.DateTimeOriginal || null,
                        formatted: formatDateTime(exifData.DateTimeOriginal || exifData.DateTime),
                    },
                    settings: {
                        exposureTime: exifData.ExposureTime || null,
                        fNumber: exifData.FNumber || null,
                        iso: exifData.ISO || null,
                        focalLength: exifData.FocalLength || null,
                        flash: exifData.Flash || null,
                        whiteBalance: exifData.WhiteBalance || null,
                    },
                    image: {
                        width: exifData.ImageWidth || null,
                        height: exifData.ImageHeight || null,
                        orientation: exifData.Orientation || null,
                    },
                    extractedAt: Date.now(),
                }
            } else {
                console.log('HEIC EXIF 데이터 없음')
                result.exif = {
                    message: 'HEIC 파일에 EXIF 정보가 없습니다.',
                }
            }
        } catch (exifError) {
            console.warn('HEIC EXIF 추출 실패:', exifError)
            result.exif = {
                extractionFailed: true,
                error: exifError instanceof Error ? exifError.message : 'EXIF 추출 실패',
            }
        }

        return result
    } catch (error) {
        console.error('HEIC 메타데이터 추출 중 전체 오류:', error)
        return {
            gps: {
                latitude: null,
                longitude: null,
                hasGPS: false,
                extractionFailed: true,
                error: error instanceof Error ? error.message : 'HEIC 메타데이터 추출 실패',
            },
        }
    }
}

// 헬퍼 함수들
const formatDateTime = (dateTime: any) => {
    if (!dateTime) return null
    try {
        const date = new Date(dateTime)
        return {
            date: date.toLocaleDateString('ko-KR'),
            time: date.toLocaleTimeString('ko-KR'),
            iso: date.toISOString(),
        }
    } catch {
        return { raw: dateTime }
    }
}

const calculateGPSAccuracy = (gpsData: any) => {
    if (gpsData.GPSHPositioningError) {
        return {
            horizontal: gpsData.GPSHPositioningError,
            unit: 'meters',
        }
    }
    return null
}
