import { authenticatedFetch } from '../auth/authUtils'
import { API_BASE_URL } from '../config'

const addAlbumPicture = async (albumId, albumData) => {
    try {
        const apiUrl = API_BASE_URL + `/api/album/${albumId}`
        return await authenticatedFetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify(albumData),
        })
    } catch (error) {
        console.error('앨범 사진 추가 실패:', error.message)
        throw error
    }
}

export { addAlbumPicture }
