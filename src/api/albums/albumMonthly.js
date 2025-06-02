import { authenticatedFetch } from '../auth/authUtils'
import { API_BASE_URL } from '../config'

const fetchAlbumData = async yearMonth => {
    try {
        const apiUrl =
            API_BASE_URL +
            `/api/album/monthly${yearMonth ? '?yearMonth=' + yearMonth : ''}`
        return await authenticatedFetch(apiUrl, { method: 'GET' })
    } catch (error) {
        console.error('앨범 데이터 Fetch 실패:', error.message)
        throw error
    }
}

export { fetchAlbumData }
