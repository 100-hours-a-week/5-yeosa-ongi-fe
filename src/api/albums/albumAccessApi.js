import { authenticatedFetch } from '../auth/authUtils'
import { API_BASE_URL } from '../config'

const getAlbumAccess = async albumId => {
    try {
        const apiUrl = API_BASE_URL + `/api/album/${albumId}/role`
        return await authenticatedFetch(apiUrl, { method: 'GET' })
    } catch (error) {
        console.error('앨범 권한 확인 실패:', error.message)
        throw error
    }
}

export { getAlbumAccess }
