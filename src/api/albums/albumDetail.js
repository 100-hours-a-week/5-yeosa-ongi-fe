import { authenticatedFetch } from '../auth/authUtils'
import { API_BASE_URL } from '../config'

const getAlbumDetail = async albumId => {
    try {
        const apiUrl = API_BASE_URL + `/api/album/${albumId}`
        return await authenticatedFetch(apiUrl, { method: 'GET' })
    } catch (error) {
        console.error('앨범 상세 데이터 Fetch 실패:', error.message)
        throw error
    }
}

export { getAlbumDetail }
