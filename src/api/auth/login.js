import useAuthStore from '../../stores/userStore'
import { API_BASE_URL } from '../config'

const getKakaoOauthLink = async () => {
    try {
        const apiUrl = '/api/auth'
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors',
        }
        const response = await fetch(apiUrl, requestOptions)

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(
                errorData.message || `HTTP 에러! 상태: ${response.status}`
            )
        }
    } catch (error) {
        console.error('로그인 실패:', error.message)
    }
}

const kakaoLogin = async code => {
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
        console.error('kakaoLogin 에러 :', error)
        return false
    }
}

export { getKakaoOauthLink, kakaoLogin }
