import { FileItem } from '@/types/upload'

/**
 * HEIC 형식인지 검사하는 함수
 * @param file
 * @returns
 */
export const isHEICFile = (file: File): boolean => {
    return (
        file.type === 'image/heic' ||
        file.type === 'image/heif' ||
        file.name?.toLowerCase().endsWith('.heic') ||
        file.name?.toLowerCase().endsWith('.heif')
    )
}

/**
 * 파일 타입 표시 함수 (디버깅 용)
 * @param file
 * @param isConverting
 * @returns
 */
export const getFileTypeDisplay = (file: File, isConverting: boolean = false): string => {
    if (isHEICFile(file)) {
        return isConverting ? 'HEIC → JPEG' : 'HEIC'
    }
    return file.type?.split('/')[1]?.toUpperCase() || 'Unknown'
}

/**
 * 안전한 미리보기 URL을 생성하는 함수
 * @param file
 * @returns
 */
export const createSafePreviewURL = (file: File): string => {
    try {
        return URL.createObjectURL(file)
    } catch (error) {
        console.error('Preview URL 생성 실패:', error)
        return ''
    }
}

/**
 * 배열 내에서 파일을 찾는 함수
 * @param files
 * @param targetFile
 * @returns
 */
export const findFileInArray = (files: FileItem[], targetFile: File): FileItem | undefined => {
    return files.find(
        fileItem =>
            fileItem.file === targetFile ||
            (fileItem.file.name === targetFile.name &&
                fileItem.file.size === targetFile.size &&
                fileItem.file.lastModified === targetFile.lastModified)
    )
}
