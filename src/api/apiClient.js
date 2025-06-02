import useAuthStore from '../../stores/userStore'
import { API_BASE_URL } from './config'

export const apiClient = {
    getAccessToken() {
        return useAuthStore.getState().getAccessToken()
    },

    async request(endpoint, method = 'GET', data = null, params = {}) {
        const accessToken = this.getAccessToken()

        // URL 파라미터 처리
        const queryParams = Object.entries(params)
            .filter(([_, value]) => value !== null && value !== undefined)
            .map(([key, value]) => `${key}=${value}`)
            .join('&')

        const url =
            API_BASE_URL + endpoint + (queryParams ? `?${queryParams}` : '')

        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        }

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data)
        }

        try {
            const response = await fetch(url, options)

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(
                    errorData.message || `HTTP 에러! 상태: ${response.status}`
                )
            }

            return await response.json()
        } catch (error) {
            console.error(
                `API 호출 실패 (${method} ${endpoint}):`,
                error.message
            )
            throw error
        }
    },
}
