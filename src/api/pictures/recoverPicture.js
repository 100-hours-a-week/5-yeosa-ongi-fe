import { authenticatedFetch } from '../authUtils'
import { API_BASE_URL } from '../config'

const recoverAlbumPicture = async (albumId, selectedPictureIds) => {
    try {
        const apiUrl = API_BASE_URL + `/api/album/${albumId}/picture`
        return await authenticatedFetch(apiUrl, {
            method: 'PUT',
            body: JSON.stringify(selectedPictureIds),
        })
    } catch (error) {
        console.error('사진 복원 실패:', error.message)
        throw error
    }
}

export { recoverAlbumPicture }
