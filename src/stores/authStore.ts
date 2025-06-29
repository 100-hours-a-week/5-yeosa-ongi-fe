import { API_BASE_URL } from '@/api/config'
import { LoginResponse, User } from '@/types/auth.types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const ACCESS_TOKEN_EXPIRY_TIME = 300 * 1000 // 5분

interface AuthState {
    // Persistent data (sessionStorage에 저장됨)
    refreshToken: string | null
    refreshTokenExpiresIn: number | null
    user: User | null
    isAuthenticated: boolean

    // Memory data (새로고침 시 사라짐)
    accessToken: string | null
    accessTokenExpiresAt: number | null

    // 토큰 갱신 중 상태 (중복 요청 방지)
    isRefreshing: boolean

    // Actions
    setAccessToken: (token: string | null) => void
    getAccessToken: () => string | null
    isAccessTokenValid: () => boolean
    setUser: (userData: User) => void
    login: (authData: LoginResponse) => void
    logout: () => void
    refreshAccessToken: () => Promise<boolean>
    clearTokens: () => void
}

const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // Persistent state
            refreshToken: null,
            refreshTokenExpiresIn: null,
            user: null,
            isAuthenticated: false,

            // Memory state
            accessToken: null,
            accessTokenExpiresAt: null,
            isRefreshing: false,

            // Access Token 관리
            setAccessToken: token => {
                set({
                    accessToken: token,
                    accessTokenExpiresAt: token ? Date.now() + ACCESS_TOKEN_EXPIRY_TIME : null,
                })
            },

            getAccessToken: () => {
                const { accessToken, accessTokenExpiresAt } = get()

                // 토큰이 있고 만료되지 않았으면 반환
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
            setUser: userData => {
                set({ user: userData })
            },

            // 로그인
            login: authData => {
                const { accessToken, refreshToken, refreshTokenExpiresIn, user } = authData

                set({
                    accessToken,
                    accessTokenExpiresAt: Date.now() + ACCESS_TOKEN_EXPIRY_TIME,
                    refreshToken,
                    refreshTokenExpiresIn,
                    user,
                    isAuthenticated: true,
                    isRefreshing: false,
                })

                console.log('로그인 성공:', user.nickname)
            },

            // 로그아웃
            logout: () => {
                set({
                    accessToken: null,
                    accessTokenExpiresAt: null,
                    refreshToken: null,
                    refreshTokenExpiresIn: null,
                    user: null,
                    isAuthenticated: false,
                    isRefreshing: false,
                })

                console.log('로그아웃 완료')
            },

            // 토큰 정리
            clearTokens: () => {
                get().logout()
            },

            refreshAccessToken: async () => {
                const { refreshToken, isRefreshing } = get()

                // 이미 갱신 중이면 기다리지 않고 바로 false 반환
                if (isRefreshing) {
                    return false
                }

                if (!refreshToken) {
                    console.error('리프레시 토큰이 없습니다.')
                    get().logout()
                    return false
                }

                // 리프레시 토큰 만료 확인
                const { refreshTokenExpiresIn } = get()
                if (refreshTokenExpiresIn && Date.now() > refreshTokenExpiresIn) {
                    console.error('리프레시 토큰이 만료되었습니다.')
                    get().logout()
                    return false
                }

                // 갱신 시작
                set({ isRefreshing: true })

                try {
                    const controller = new AbortController()
                    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃

                    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ refreshToken }),
                        signal: controller.signal,
                    })

                    clearTimeout(timeoutId)

                    if (!response.ok) {
                        // 401/403이면 리프레시 토큰 만료
                        if (response.status === 401 || response.status === 403) {
                            console.error('리프레시 토큰이 유효하지 않습니다.')
                            get().logout()
                            return false
                        }
                        throw new Error(`토큰 갱신 실패: ${response.status}`)
                    }

                    const result = await response.json()

                    if (!result.data?.accessToken) {
                        throw new Error('유효하지 않은 응답: accessToken이 없습니다.')
                    }

                    const newAccessToken = result.data.accessToken

                    // 새 토큰 설정
                    set({
                        accessToken: newAccessToken,
                        accessTokenExpiresAt: Date.now() + ACCESS_TOKEN_EXPIRY_TIME,
                        isRefreshing: false,
                    })

                    console.log('액세스 토큰 갱신 성공')
                    return true
                } catch (error) {
                    console.error('액세스 토큰 갱신 실패:', error)

                    set({ isRefreshing: false })

                    // 네트워크 오류가 아닌 경우에만 로그아웃
                    if (error instanceof Error) {
                        if (error.name === 'AbortError') {
                            console.error('토큰 갱신 요청 타임아웃')
                        } else if (error.message.includes('401') || error.message.includes('403')) {
                            get().logout()
                        }
                        // 기타 네트워크 오류는 로그아웃하지 않음
                    }

                    return false
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => sessionStorage),
            // 메모리 상태는 persist에서 제외
            partialize: state => ({
                refreshToken: state.refreshToken,
                refreshTokenExpiresIn: state.refreshTokenExpiresIn,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
            // 스토리지에서 불러올 때 메모리 상태 초기화
            onRehydrateStorage: () => state => {
                if (state) {
                    state.accessToken = null
                    state.accessTokenExpiresAt = null
                    state.isRefreshing = false
                }
            },
        }
    )
)

export default useAuthStore
