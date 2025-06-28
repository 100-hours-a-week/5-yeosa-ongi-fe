import { HTTPHeaders, HTTPMethod, HTTPParams } from '@/types/api.types'
import axios, { AxiosPromise } from 'axios'
import { TokenManager } from './TokenManager'

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
            http.interceptors.request.use(async config => {
                const token = await TokenManager.getValidAccessToken()

                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`
                }
                return config
            })
        }

        return http.request({ ...this })
    }
}

export default API
