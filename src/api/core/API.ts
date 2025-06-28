import { HTTPHeaders, HTTPMethod, HTTPParams } from '@/types/api.types'
import axios, { AxiosPromise } from 'axios'

class API {
    readonly method: HTTPMethod
    readonly url: string
    baseURL?: string
    headers?: HTTPHeaders
    params?: HTTPParams
    data?: unknown
    timeout?: number
    withCredentials?: boolean

    constructor(method: HTTPMethod, url: string) {
        this.method = method
        this.url = url
    }

    call<T>(): AxiosPromise<T> {
        const http = axios.create()

        if (this.withCredentials) {
            http.interceptors.response.use(
                response => response,
                error => {
                    if (error.response && error.response.status === 401) {
                        // 토큰 만료 시 처리 로직
                        window.location.href = '/login'
                    }
                    return Promise.reject(error)
                }
            )
        }

        return http.request({ ...this })
    }
}

export default API
