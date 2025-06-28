import { HTTPHeaders, HTTPMethod, HTTPParams } from '@/types/api.types'
import { API_BASE_URL } from '../config'
import API from './API'

class APIBuilder {
    private _instance: API

    constructor(method: HTTPMethod, url: string, data?: unknown) {
        this._instance = new API(method, url)
        this._instance.baseURL = API_BASE_URL
        this._instance.data = data
        this._instance.headers = {
            'Content-Type': 'application/json; charset=utf-8',
        }
        this._instance.timeout = 10000
        this._instance.withCredentials = false
    }

    static get = (url: string) => new APIBuilder('GET', url)
    static put = (url: string, data: unknown) => new APIBuilder('PUT', url, data)
    static post = (url: string, data: unknown) => new APIBuilder('POST', url, data)
    static delete = (url: string) => new APIBuilder('DELETE', url)

    baseURL(value: string): APIBuilder {
        this._instance.baseURL = value
        return this
    }

    headers(value: HTTPHeaders): APIBuilder {
        this._instance.headers = { ...this._instance.headers, ...value }
        return this
    }

    timeout(value: number): APIBuilder {
        this._instance.timeout = value
        return this
    }

    params(value: HTTPParams): APIBuilder {
        this._instance.params = value
        return this
    }

    data(value: unknown): APIBuilder {
        this._instance.data = value
        return this
    }

    withCredentials(value: boolean = true): APIBuilder {
        this._instance.withCredentials = value
        return this
    }

    build(): API {
        return this._instance
    }
}

export default APIBuilder
