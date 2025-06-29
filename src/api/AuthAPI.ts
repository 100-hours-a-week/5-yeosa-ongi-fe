import { LoginAPIResponse, TokenRefreshResponse } from '@/types/api.types'
import { User } from '@/types/auth.types'
import APIBuilder from './core/APIBuilder'

export class AuthAPI {
    // 카카오 로그인 페이지로 리다이렉션
    static getKakaoLoginUrl() {
        return APIBuilder.get('/api/auth').build().call<void>()
    }

    // 카카오 로그인
    static async kakaoLogin(authorizationCode: string): Promise<LoginAPIResponse> {
        const response = await APIBuilder.get(`/auth/login/kakao`)
            .params({ code: authorizationCode })
            .build()
            .call<any>()

        console.log('Raw API 응답:', response)

        // 실제 응답 구조
        const loginResponse: LoginAPIResponse = {
            code: response.code,
            message: response.message,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            refreshTokenExpiresIn: response.data.refreshTokenExpiresIn,
            user: response.data.user,
        }

        return loginResponse
    }

    // 로그아웃
    static logout(refreshToken: string) {
        return APIBuilder.post('/api/auth', { refreshToken }).requiresAuth(true).build().call<void>()
    }

    // Access Token 갱신
    static async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
        const response = await APIBuilder.post('/api/auth/refresh', { refreshToken }).build().call<any>()

        // 응답 구조에 맞게 변환
        const tokenResponse: TokenRefreshResponse = {
            code: response.code,
            message: response.message,
            accessToken: response.data?.accessToken,
        }

        return tokenResponse
    }

    // 유저 정보 조회
    static getUserInfo(userId: string) {
        return APIBuilder.get(`/api/user/${userId}`).requiresAuth(true).build().call<User>()
    }
}
