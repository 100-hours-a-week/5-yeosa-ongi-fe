import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlbumUploadService } from '../services/albumUploadService'
import { FileItem } from '../types/upload'
// 실제 앨범 관련 API 훅들을 import하세요
import { useToast } from '@/contexts/ToastContext'
import { useAddPicture, useCreateAlbum, useGetPreSignedUrl } from '@/hooks/useAlbum'

interface useAlbumCreationReturn {
    loading: boolean
    error: string | null
    createAlbumWithFiles: (albumTitle: string, files: FileItem[], albumId: string, tags: string[]) => Promise<void>
    clearError: () => void
}

export const useAlbumCreation = (): useAlbumCreationReturn => {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const { error: errorToast } = useToast()
    // API 훅들 초기화
    const getPreSignedUrlMutation = useGetPreSignedUrl()
    const createAlbumMutation = useCreateAlbum()
    const addAlbumPictureMutation = useAddPicture()

    const createAlbumWithFiles = useCallback(
        async (albumTitle: string, files: FileItem[], albumId: string, tags: string[]) => {
            if (files.length === 0 || loading) return

            const trimmedTitle = albumTitle.trim()
            if (!trimmedTitle) {
                setError('앨범 제목을 입력해주세요.')
                return
            }

            setLoading(true)
            setError(null)

            try {
                // API 훅들을 AlbumUploadService에 전달
                const apiHooks = {
                    getPreSignedUrlMutation,
                    createAlbumMutation,
                    addAlbumPictureMutation,
                }

                const result = await AlbumUploadService.createAlbum(trimmedTitle, files, albumId, tags, apiHooks)

                if (albumId) {
                    navigate(`/album/${albumId}`)
                } else {
                    navigate('/main')
                }
            } catch (err) {
                console.error('앨범 생성 오류:', err)
                setError('앨범 생성 중 오류가 발생했습니다.')
                //@ts-ignore
                errorToast(err?.message as string)
            } finally {
                setLoading(false)
            }
        },
        [loading, navigate, getPreSignedUrlMutation, createAlbumMutation, addAlbumPictureMutation]
    )

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    return {
        loading,
        error,
        createAlbumWithFiles,
        clearError,
    }
}
