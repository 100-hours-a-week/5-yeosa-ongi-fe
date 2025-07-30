// types/upload.ts
export interface FileMetadata {
    dateTime?: string
    gps?: {
        latitude?: number
        longitude?: number
    }
}

export interface UploadState {
    file: File | null
    metadata: FileMetadata | null
    preview: {
        instant?: boolean
        thumbnail?: string
        converted?: string
    }
    uploadStatus: 'idle' | 'uploading' | 'completed' | 'error'
}

export interface FileItem {
    id: string
    file: File
    preview: string

    // 변환 관련 필드 추가
    convertedFile?: File
    convertedPreview?: string
    isConverting?: boolean
    conversionError?: string

    GPS?: {
        latitude?: number | null | string
        longitude?: number | null | string
    }
    isProcessed: boolean
    thumbnail?: string
}
