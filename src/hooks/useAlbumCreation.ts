import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlbumUploadService } from '../services/albumUploadService'
import { FileItem } from '../types/upload'

export const useAlbumCreation = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const createAlbumWithFiles = useCallback(
        async (albumTitle: string, files: FileItem[], albumId: string) => {
            if (files.length === 0 || loading) return

            const trimmedTitle = albumTitle.trim()
            if (!trimmedTitle) {
                setError('앨범 제목을 입력해주세요.')
                return
            }

            setLoading(true)
            setError(null)

            try {
                const result = await AlbumUploadService.createAlbum(trimmedTitle, files, albumId)

                if (albumId) {
                    navigate(`/album/${albumId}`)
                } else {
                    navigate('/main')
                }
            } catch (err) {
                console.error('앨범 생성 오류:', err)
                setError('앨범 생성 중 오류가 발생했습니다.')
            } finally {
                setLoading(false)
            }
        },
        [loading, navigate]
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
