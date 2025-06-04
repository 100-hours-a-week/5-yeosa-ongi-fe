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
    preview: string // blob URL for preview
}
