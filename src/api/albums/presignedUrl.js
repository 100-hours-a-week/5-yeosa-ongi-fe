import { authenticatedFetch } from '../auth/authUtils'
import { API_BASE_URL } from '../config'

const getPreSignedUrl = async pictures => {
    try {
        const apiUrl = API_BASE_URL + `/api/presigned-url`
        return await authenticatedFetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify(pictures),
        })
    } catch (error) {
        console.error('presigned URL 발급 실패:', error.message)
        throw error
    }
}

export { getPreSignedUrl }
