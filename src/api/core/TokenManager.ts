import useAuthStore from '@/stores/authStore'

export class TokenManager {
    private static refreshPromise: Promise<boolean> | null = null

    static async getValidAccessToken(): Promise<string | null> {
        const store = useAuthStore.getState()

        // 유효한 액세스 토큰이 있으면 반환
        const validToken = store.getAccessToken()
        if (validToken) {
            return validToken
        }

        // 리프레시 토큰이 없으면 로그아웃
        if (!store.refreshToken) {
            store.logout()
            return null
        }

        // 토큰 갱신 (중복 요청 방지)
        try {
            if (!this.refreshPromise) {
                this.refreshPromise = store.refreshAccessToken()
            }

            const success = await this.refreshPromise
            this.refreshPromise = null

            if (success) {
                return store.getAccessToken()
            } else {
                return null
            }
        } catch (error) {
            this.refreshPromise = null
            store.logout()
            return null
        }
    }
}
