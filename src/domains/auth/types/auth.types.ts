export interface User {
    userId: string
    nickname: string
    profileImageURL: string
    cacheTtl: number
}

export interface AuthTokens {
    accessToken: string
    refreshToken: string
    refreshTokenExpiresIn: number
}

export interface LoginResponse {
    accessToken: string
    refreshToken: string
    refreshTokenExpiresIn: number
    user: User
    code: string
    message: string
}
