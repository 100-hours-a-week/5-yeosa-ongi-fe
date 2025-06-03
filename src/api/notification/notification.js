import { authenticatedFetch } from '../authUtils'
import { API_BASE_URL } from '../config'

const getNotification = async lastNotificationId => {
    try {
        const apiUrl =
            API_BASE_URL + `/api/notification?cursor${lastNotificationId}`
        return await authenticatedFetch(apiUrl, { method: 'GET' })
    } catch (error) {
        console.error('알림 조회 실패 :', error.message)
        throw error
    }
}

const readNotification = async notificationId => {
    try {
        const apiUrl =
            API_BASE_URL + `/api/notification/${notificationId}/status`
        return await authenticatedFetch(apiUrl, { method: 'POST' })
    } catch (error) {
        console.error('알림 읽음 처리 실패 :', error.message)
        throw error
    }
}

export { getNotification, readNotification }
