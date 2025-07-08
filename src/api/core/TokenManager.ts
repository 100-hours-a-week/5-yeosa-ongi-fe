import useAuthStore from '@/stores/authStore'
import { User } from '@/types/auth.types'

export class TokenManager {
    private static refreshPromise: Promise<string | null> | null = null

    /**
     * 유효한 액세스 토큰을 반환합니다.
     * 만료된 경우 자동으로 갱신을 시도합니다.
     */
    static async getValidAccessToken(): Promise<string | null> {
        const store = useAuthStore.getState()

        // 1. 유효한 액세스 토큰이 있으면 바로 반환
        const validToken = store.getAccessToken()
        if (validToken) {
            return validToken
        }

        // 2. 리프레시 토큰이 없으면 로그아웃
        if (!store.refreshToken) {
            console.warn('리프레시 토큰이 없어 로그아웃 처리합니다.')
            store.logout()
            return null
        }

        // 3. 이미 갱신 중이면 기존 Promise 반환
        if (this.refreshPromise) {
            return this.refreshPromise
        }

        // 4. 새로운 토큰 갱신 시작
        this.refreshPromise = this.executeRefresh()

        try {
            return await this.refreshPromise
        } finally {
            this.refreshPromise = null
        }
    }

    /**
     * 실제 토큰 갱신 로직 실행
     */
    private static async executeRefresh(): Promise<string | null> {
        const store = useAuthStore.getState()

        try {
            const success = await store.refreshAccessToken()

            if (success) {
                const newToken = store.getAccessToken()
                console.log('토큰 갱신 성공')
                return newToken
            } else {
                console.warn('토큰 갱신 실패')
                return null
            }
        } catch (error) {
            console.error('토큰 갱신 중 오류:', error)
            store.logout()
            return null
        }
    }

    /**
     * 현재 액세스 토큰을 반환합니다 (갱신 시도 없음)
     */
    static getCurrentAccessToken(): string | null {
        const store = useAuthStore.getState()
        return store.getAccessToken()
    }

    /**
     * 액세스 토큰이 유효한지 확인합니다
     */
    static isAccessTokenValid(): boolean {
        const store = useAuthStore.getState()
        return store.isAccessTokenValid()
    }

    /**
     * 액세스 토큰이 곧 만료되는지 확인합니다 (1분 이내)
     */
    static willAccessTokenExpireSoon(): boolean {
        const store = useAuthStore.getState()
        const { accessTokenExpiresAt } = store

        if (!accessTokenExpiresAt) return false

        const oneMinute = 60 * 1000
        return Date.now() + oneMinute >= accessTokenExpiresAt
    }

    /**
     * 모든 토큰을 정리하고 로그아웃합니다
     */
    static clearTokens(): void {
        // 진행 중인 갱신 작업도 정리
        this.refreshPromise = null

        const store = useAuthStore.getState()
        store.clearTokens()
    }

    /**
     * 사용자 정보를 반환합니다
     */
    static getUser(): User | null {
        const store = useAuthStore.getState()
        return store.user
    }

    /**
     * 인증 상태를 확인합니다
     */
    static isAuthenticated(): boolean {
        const store = useAuthStore.getState()
        return store.isAuthenticated
    }

    /**
     * 수동으로 토큰 갱신을 시도합니다
     */
    static async refreshTokens(): Promise<boolean> {
        // 기존 갱신 프로세스가 있다면 정리
        this.refreshPromise = null

        const store = useAuthStore.getState()
        return store.refreshAccessToken()
    }
}
