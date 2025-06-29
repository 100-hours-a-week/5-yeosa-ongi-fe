import { AuthAPI } from '@/api/AuthAPI'
import useAuthStore from '@/stores/authStore'
import { APIError } from '@/types/api.types'
import { LoginResponse, User } from '@/types/auth.types'
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query'

export const authKeys = {
    all: ['auth'] as const,
    user: (userId: string) => [...authKeys.all, 'user', userId] as const,
    kakaoLogin: (code: string) => [...authKeys.all, 'kakao-login', code] as const,
} as const

// 사용자 정보 조회
export const useUserInfo = (userId: string, options?: UseQueryOptions<User, APIError>) => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated)

    return useQuery({
        queryKey: authKeys.user(userId),
        queryFn: async () => {
            const response = await AuthAPI.getUserInfo(userId)
            return response.data!
        },
        enabled: isAuthenticated && !!userId,
        staleTime: 5 * 60 * 1000, // 5분
        retry: 1,
        ...options,
    })
}

// 카카오 로그인 - 응답 처리 수정
export const useKakaoLogin = (options?: {
    onSuccess?: (data: LoginResponse) => void
    onError?: (error: APIError) => void
}) => {
    const login = useAuthStore(state => state.login)

    return useMutation({
        mutationFn: async (authorizationCode: string) => {
            const response = await AuthAPI.kakaoLogin(authorizationCode)

            // LoginAPIResponse를 LoginResponse로 변환 (실제로는 같은 구조)
            const loginData: LoginResponse = {
                code: response.code,
                message: response.message,
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
                refreshTokenExpiresIn: response.refreshTokenExpiresIn,
                user: response.user,
            }

            return loginData
        },
        onSuccess: data => {
            login(data)
            console.log('카카오 로그인 성공:', data.message)
            options?.onSuccess?.(data)
        },
        onError: (error: APIError) => {
            console.error('카카오 로그인 실패:', error.message)
            options?.onError?.(error)
        },
    })
}

// 로그아웃 - 무한 루프 수정
export const useLogout = (options?: { onSuccess?: () => void; onError?: (error: APIError) => void }) => {
    const queryClient = useQueryClient()
    // ✅ 각각 따로 가져와서 참조 안정성 확보
    const refreshToken = useAuthStore(state => state.refreshToken)
    const logout = useAuthStore(state => state.logout)

    return useMutation({
        mutationFn: async (customRefreshToken?: string) => {
            const tokenToUse = customRefreshToken || refreshToken

            // 서버에 로그아웃 요청
            if (tokenToUse) {
                try {
                    await AuthAPI.logout(tokenToUse)
                } catch (error) {
                    // 서버 로그아웃 실패해도 클라이언트 정리는 진행
                    console.warn('서버 로그아웃 실패:', error)
                }
            }
        },
        onSuccess: () => {
            // 클라이언트 상태 정리
            logout()

            // React Query 캐시 클리어
            queryClient.removeQueries({ queryKey: authKeys.all })

            console.log('로그아웃 완료')
            options?.onSuccess?.()
        },
        onError: (error: APIError) => {
            console.error('로그아웃 중 오류:', error.message)

            // 에러가 있어도 클라이언트 정리는 수행
            logout()
            queryClient.removeQueries({ queryKey: authKeys.all })

            options?.onError?.(error)
        },
    })
}

// 토큰 수동 갱신 - 응답 처리 수정
export const useRefreshToken = () => {
    const refreshToken = useAuthStore(state => state.refreshToken)
    const setAccessToken = useAuthStore(state => state.setAccessToken)
    const logout = useAuthStore(state => state.logout)

    return useMutation({
        mutationFn: async () => {
            if (!refreshToken) {
                throw new Error('리프레시 토큰이 없습니다')
            }

            const response = await AuthAPI.refreshToken(refreshToken)
            return response // TokenRefreshResponse 타입
        },
        onSuccess: data => {
            setAccessToken(data.accessToken)
            console.log('토큰 갱신 성공')
        },
        onError: error => {
            console.error('토큰 갱신 실패:', error)
            logout()
        },
    })
}

// 인증 상태 확인 hook - 개별 선택자 사용
export const useAuthStatus = () => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated)
    const user = useAuthStore(state => state.user)

    return {
        isAuthenticated,
        user,
        isLoggedIn: isAuthenticated && !!user,
    }
}
