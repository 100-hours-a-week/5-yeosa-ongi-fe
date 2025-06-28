// src/types/api.types.ts
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface HTTPHeaders {
    [key: string]: string
}

export interface HTTPParams {
    [key: string]: string | number | boolean | undefined
}

// 사용자 관련 타입
export interface User {
    userId: string
    nickname: string
    profileImageURL: string
    cacheTtl: number
}

export interface CreateUserRequest {
    name: string
    email: string
}

export interface UpdateUserRequest {
    name?: string
    email?: string
}

export interface APIResponse<T = any> {
    data: T
    message?: string
    error?: string
    code?: string
}

export interface AuthAPIResponse<T = any> {
    message?: string
    error?: string
    code?: string
    data?: unknown
    accessToken?: string
    refreshTokenExpiresIn?: number
    refreshToken: string
    user: User
}
// export interface PaginatedResponse<T> {
//     data: T[]
//     pagination: {
//         page: number
//         limit: number
//         total: number
//         totalPages: number
//     }
// }
