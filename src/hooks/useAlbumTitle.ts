import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const useAlbumTitle = (initialTitle = '이름 없는 앨범') => {
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
