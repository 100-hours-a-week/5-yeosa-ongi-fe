import { ApiResponse } from '../types'
import { authenticatedFetch } from './authUtils'
import { API_BASE_URL } from './config'

export const updateUserInfo = async (
    userId: number,
    userInfo: any
): Promise<ApiResponse> => {
    try {
        const apiUrl = API_BASE_URL + `/api/user/${userId}`
        return await authenticatedFetch(apiUrl, {
            method: 'PUT',
            body: JSON.stringify(userInfo),
        })
    } catch (error) {
        console.error('유저 정보 업데이트 실패:', (error as Error).message)
        throw error
    }
}

export const getTotalData = async (): Promise<ApiResponse> => {
    try {
        const apiUrl = API_BASE_URL + `/api/user/statistics`
        return await authenticatedFetch(apiUrl, { method: 'GET' })
    } catch (error) {
        console.error('유저 통계:', (error as Error).message)
        throw error
    }
}
