import { User } from './auth.types'

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface HTTPHeaders {
    [key: string]: string
}

export interface HTTPParams {
    [key: string]: string | number | boolean | undefined
}

export interface APIResponse<T = any> {
    code: string
    message: string
    data?: T
}

// 로그인 전용 API 응답
export interface LoginAPIResponse {
    code: string
    message: string
    accessToken: string
    refreshToken: string
    refreshTokenExpiresIn: number
    user: User
}

// 토큰 갱신 응답
export interface TokenRefreshResponse {
    code: string
    message: string
    accessToken: string
}

export interface APIError {
    code: string
    message: string
    data: null
    statusCode?: number
}
