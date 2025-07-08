import { APIError, APIResponse, HTTPHeaders, HTTPMethod, HTTPParams } from '@/types/api.types'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { TokenManager } from './TokenManager'

class API {
    readonly method: HTTPMethod
    readonly url: string
    baseURL?: string
    headers?: HTTPHeaders
    params?: HTTPParams
    data?: unknown
    timeout?: number
    requiresAuth?: boolean

    constructor(method: HTTPMethod, url: string) {
        this.method = method
        this.url = url
    }

    async call<T>(): Promise<APIResponse<T>> {
        const http = axios.create({
            timeout: this.timeout || 10000,
        })

        // 요청 인터셉터 - 인증 토큰 추가
        http.interceptors.request.use(
            async config => {
                if (this.requiresAuth) {
                    const token = await TokenManager.getValidAccessToken()
                    if (token) {
                        config.headers['Authorization'] = `Bearer ${token}`
                    } else {
                        throw new Error('인증 토큰이 없습니다.')
                    }
                }
                return config
            },
            error => {
                return Promise.reject(error)
            }
        )

        // 에러 처리
        http.interceptors.response.use(
            response => {
                return response
            },
            async (error: AxiosError) => {
                const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

                if (error.response?.status === 401 && !originalRequest._retry && this.requiresAuth) {
                    originalRequest._retry = true

                    try {
                        // 토큰 갱신 시도
                        const newToken = await TokenManager.getValidAccessToken()
                        if (newToken && originalRequest.headers) {
                            originalRequest.headers['Authorization'] = `Bearer ${newToken}`
                            return http.request(originalRequest)
                        }
                    } catch (refreshError) {
                        TokenManager.clearTokens()
                        return Promise.reject(refreshError)
                    }
                }

                return Promise.reject(error)
            }
        )

        try {
            const response = await http.request({
                method: this.method,
                url: this.url,
                baseURL: this.baseURL,
                headers: this.headers,
                params: this.params,
                data: this.data,
            })

            return response.data as APIResponse<T>
        } catch (error) {
            // 에러 응답 정규화
            if (axios.isAxiosError(error)) {
                const apiError: APIError = {
                    code: error.response?.data?.code || 'UNKNOWN_ERROR',
                    message: error.response?.data?.message || error.message || '요청 처리 중 오류가 발생했습니다.',
                    data: null,
                    statusCode: error.response?.status,
                }
                throw apiError
            }

            throw error
        }
    }
}

export default API
