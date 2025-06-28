import { APIResponse, User } from '@/types/api.types'
import APIBuilder from './core/APIBuilder'

export class AuthAPI {
    // 로그인
    static login() {
        return APIBuilder.get(`/api/auth`).build().call<APIResponse>()
    }

    static kakaoLogin(authorization_code: string) {
        return APIBuilder.get(`/auth/login/kakao?code=${authorization_code}`).build().call<APIResponse<User>>()
    }

    // Access Token 재발급
    static refreshAuth(refreshToken: string) {
        return APIBuilder.post(`/api/auth/refresh`, { refreshToken }).build().call<APIResponse>
    }

    // 로그아웃
    static logout(refreshToken?: string) {
        const payload = refreshToken ? { refreshToken } : {}

        return APIBuilder.post('/api/auth', payload)
            .withCredentials(true) // 인증 필요
            .build()
            .call<APIResponse<void>>()
    }
}
