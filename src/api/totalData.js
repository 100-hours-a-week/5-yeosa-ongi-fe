import { authenticatedFetch } from './auth/authUtils'
import { API_BASE_URL } from './config'

const getTotalData = async () => {
    try {
        const apiUrl = API_BASE_URL + `/api/user/statistics`
        return await authenticatedFetch(apiUrl, { method: 'GET' })
    } catch (error) {
        console.error('유저 통계:', error.message)
        throw error
    }
}

export default getTotalData
