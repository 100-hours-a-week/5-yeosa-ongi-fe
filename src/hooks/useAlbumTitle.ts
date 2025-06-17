import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface useAlbumTitleReturn {
    albumTitle: string
    handleTitleChange: (newTitle: string) => void
}

export const useAlbumTitle = (initialTitle = '이름 없는 앨범'): useAlbumTitleReturn => {
    const [albumTitle, setAlbumTitle] = useState(initialTitle)
    const navigate = useNavigate()

    const handleTitleChange = useCallback((newTitle: string) => {
        setAlbumTitle(newTitle)
    }, [])

    return {
        albumTitle,
        handleTitleChange,
    }
}
