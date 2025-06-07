// hooks/useAlbumCreation2.ts (수정된 버전)

import { FileItem } from '@/types/upload'
import { useCallback, useMemo } from 'react'
import { useAlbumCreation } from './useAlbumCreation'
import { useAlbumTitle } from './useAlbumTitle'

interface UseAlbumCreationUIProps {
    files: FileItem[]
    isProcessing: boolean
    albumId?: string
}

interface UseAlbumCreationUIReturn {
    // 앨범 생성 관련
    loading: boolean
    error: string | null
    createAlbumWithFiles: (albumTitle: string, files: FileItem[], albumId: string) => Promise<void>

    // 제목 관련
    albumTitle: string
    handleTitleChange: (title: string) => void

    // UI 로직
    handleCreateAlbum: () => Promise<void>
    isButtonDisabled: boolean
}

const useAlbumCreationUI = ({ files, isProcessing, albumId }: UseAlbumCreationUIProps): UseAlbumCreationUIReturn => {
    const albumData = useAlbumCreation()
    const titleData = useAlbumTitle()

    // 앨범 생성 핸들러
    const handleCreateAlbum = useCallback(async (): Promise<void> => {
        // 생성 조건 검사 (1장 이상으로 변경)
        if (files.length < 1 || albumData.loading || isProcessing) {
            return
        }

        try {
            await albumData.createAlbumWithFiles(titleData.albumTitle, files, albumId as string)
        } catch (error) {
            console.error('앨범 생성 중 오류:', error)
        }
    }, [files, albumData.loading, albumData.createAlbumWithFiles, isProcessing, titleData.albumTitle, albumId])

    const isButtonDisabled = useMemo((): boolean => {
        // 제목이 비어있거나, 파일이 1장 미만이거나, 로딩 중이거나, 처리 중일 때 비활성화
        console.log(titleData.albumTitle.trim() === '', files.length < 1, albumData.loading, isProcessing)
        return titleData.albumTitle.trim() === '' || files.length < 1 || albumData.loading || isProcessing
    }, [titleData.albumTitle, files.length, albumData.loading, isProcessing])

    return {
        // 앨범 생성 관련 데이터
        loading: albumData.loading,
        error: albumData.error,
        createAlbumWithFiles: albumData.createAlbumWithFiles,

        // 제목 관련 데이터
        albumTitle: titleData.albumTitle,
        handleTitleChange: titleData.handleTitleChange,

        // UI 로직
        handleCreateAlbum,
        isButtonDisabled,
    }
}

export { useAlbumCreationUI }
export type { UseAlbumCreationUIProps, UseAlbumCreationUIReturn }
