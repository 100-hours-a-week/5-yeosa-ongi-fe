import { gps, parse } from 'exifr'
import ExifReader from 'exifreader'
import { formatDateTime } from './timeUtils'

export interface GPSMetadata {
    latitude: number | null | string
    longitude: number | null | string
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

export const extractJPEGMetadata = async (file: File): Promise<{ gps?: GPSMetadata; exif?: EXIFMetadata } | null> => {
    try {
        // ExifReader로 메타데이터 읽기
        const tags = await ExifReader.load(file)

        let gpsMetadata: GPSMetadata = { latitude: null, longitude: null, hasGPS: false }
        let exifMetadata: EXIFMetadata | undefined

        // GPS 정보 처리
        const gpsLat = tags['GPSLatitude']
        const gpsLatRef = tags['GPSLatitudeRef']
        const gpsLon = tags['GPSLongitude']
        const gpsLonRef = tags['GPSLongitudeRef']
        const gpsAlt = tags['GPSAltitude']

        if (gpsLat?.value && gpsLatRef?.value && gpsLon?.value && gpsLonRef?.value && gpsMetadata) {
            const latitude = gpsLat.description
            const longitude = gpsLon.description
            gpsMetadata.latitude = latitude
            gpsMetadata.longitude = longitude
            gpsMetadata.hasGPS = true
            // 고도 정보 추가
            if (gpsAlt?.value) {
                gpsMetadata.altitude = parseFraction(gpsAlt.value)
            }
        }

        if (gpsMetadata) {
            console.log('정상 추출 완료')
            return { gps: gpsMetadata }
        } else {
            console.log('정상 추출 실패')
            return null
        }
    } catch (error) {
        console.error('EXIF 데이터 추출 중 오류:', error)
        return null
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

const calculateGPSAccuracy = (gpsData: any) => {
    if (gpsData.GPSHPositioningError) {
        return {
            horizontal: gpsData.GPSHPositioningError,
            unit: 'meters',
        }
    }
    return null
}
