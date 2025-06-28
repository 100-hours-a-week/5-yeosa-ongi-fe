import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { API_BASE_URL } from '../api/config'

const ACCESS_TOKEN_EXPIRY_TIME = 300 * 1000 // 5분

interface User {
    userId: string | null
    nickname: string | null
    profileImageURL: string | null
    cacheTtl: number | null
}

interface AuthState {
    // Persistent data (sessionStorage)
    refreshToken: string | null
    refreshTokenExpiresIn: number | null
    user: User
    isAuthenticated: boolean

    // Memory data (not persisted)
    accessToken: string | null
    accessTokenExpiresAt: number | null

    // Actions
    setAccessToken: (token: string | null) => void
    getAccessToken: () => string | null
    isAccessTokenValid: () => boolean

    setUser: (userData: Partial<User>) => void
    login: (authData: any) => void
    logout: () => void
    refreshAccessToken: () => Promise<boolean>
}

const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // Persistent state
            refreshToken: null,
            refreshTokenExpiresIn: null,
            user: {
                userId: null,
                nickname: null,
                profileImageURL: null,
                cacheTtl: null,
            },
            isAuthenticated: false,

            // Memory state (이 부분들은 persist에서 제외됨)
            accessToken: null,
            accessTokenExpiresAt: null,

            // Access Token 관리
            setAccessToken: token =>
                set({
                    accessToken: token,
                    accessTokenExpiresAt: token ? Date.now() + ACCESS_TOKEN_EXPIRY_TIME : null,
                }),

            getAccessToken: () => {
                const { accessToken, accessTokenExpiresAt } = get()
                if (accessToken && accessTokenExpiresAt && Date.now() < accessTokenExpiresAt) {
                    return accessToken
                }
                return null
            },

            isAccessTokenValid: () => {
                const { accessTokenExpiresAt } = get()
                return accessTokenExpiresAt ? Date.now() < accessTokenExpiresAt : false
            },

            // User 관리
            setUser: userData =>
                set(state => ({
                    user: { ...state.user, ...userData },
                })),

            // 로그인
            login: authData => {
                const { accessToken, refreshToken, refreshTokenExpiresIn, user } = authData

                set({
                    accessToken,
                    accessTokenExpiresAt: accessToken ? Date.now() + ACCESS_TOKEN_EXPIRY_TIME : null,
                    refreshToken,
                    refreshTokenExpiresIn,
                    user,
                    isAuthenticated: true,
                })

                console.log('로그인 성공')
            },

            // 로그아웃
            logout: () => {
                set({
                    accessToken: null,
                    accessTokenExpiresAt: null,
                    refreshToken: null,
                    refreshTokenExpiresIn: null,
                    user: {
                        userId: null,
                        nickname: null,
                        profileImageURL: null,
                        cacheTtl: null,
                    },
                    isAuthenticated: false,
                })
                console.log('로그아웃 완료')
            },

            // 액세스 토큰 갱신
            refreshAccessToken: async () => {
                const { refreshToken } = get()

                if (!refreshToken) {
                    console.error('리프레시 토큰이 없습니다.')
                    get().logout()
                    return false
                }

                try {
                    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken }),
                    })

                    if (!response.ok) {
                        throw new Error('토큰 갱신 실패')
                    }

                    const result = await response.json()
                    const newAccessToken = result.data.accessToken

                    get().setAccessToken(newAccessToken)
                    console.log('액세스 토큰 갱신 성공')

                    return true
                } catch (error) {
                    console.error('액세스 토큰 갱신 실패:', error)
                    get().logout()
                    return false
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => sessionStorage),
            // accessToken과 accessTokenExpiresAt은 메모리에만 저장 (persist 제외)
            partialize: state => ({
                refreshToken: state.refreshToken,
                refreshTokenExpiresIn: state.refreshTokenExpiresIn,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)

export default useAuthStore
