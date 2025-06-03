import useAuthStore from '../stores/userStore'
import { ApiResponse } from '../types'
import { authenticatedFetch } from './authUtils'
import { API_BASE_URL } from './config'

export const getKakaoOauthLink = async (): Promise<ApiResponse> => {
    try {
        const apiUrl = API_BASE_URL + `/api/auth`
        return await authenticatedFetch(apiUrl, {
            method: 'GET',
        })
    } catch (error) {
        console.error('카카오 로그인 url 조회 실패:', (error as Error).message)
        throw error
    }
}

export const kakaoLogin = async (code: string): Promise<Boolean> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/auth/login/kakao?code=${code}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            }
        )

        const result = await response.json()
        console.log(result)
        useAuthStore.getState().login(result.data)
        return true
    } catch (error) {
        console.error('카카오 로그인 실패 :', error as Error)
        return false
    }
}
