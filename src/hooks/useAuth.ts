import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query'

import { AuthAPI } from '@/api/AuthAPI'
import { User } from '@/types/api.types'
import { AxiosError } from 'axios'

export const authKeys = {
    all: ['auths'] as const,
    lists: () => [...authKeys.all, 'list'] as const,
    list: (params?: any) => [...authKeys.lists(), params] as const,
    details: () => [...authKeys.all, 'detail'] as const,
    detail: (authorization_code: string) => [...authKeys.details(), authorization_code] as const,
}

export const useKakaoLogin = (authorization_code: string, options?: UseQueryOptions<User, AxiosError>) => {
    return useQuery({
        queryKey: authKeys.detail(authorization_code),
        queryFn: async () => {
            const response = await AuthAPI.kakaoLogin(authorization_code)
            return response.data.data
        },
        enabled: !!authorization_code,
        staleTime: 5 * 60 * 1000,
        retry: 2,
        ...options,
    })
}

export const useLogout = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (refreshToken?: string) => {
            const response = await AuthAPI.logout(refreshToken)
            return response.data
        },
        onSuccess: () => {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')

            // 3. React Query 캐시 클리어
            queryClient.removeQueries({ queryKey: authKeys.all })
            // 또는 특정 쿼리들만 제거
            // queryClient.removeQueries({ queryKey: ['user'] })
            // queryClient.removeQueries({ queryKey: ['profile'] })

            // 4. 필요시 전체 캐시 클리어
            // queryClient.clear()

            console.log('로그아웃 성공')
        },
        onError: (error: AxiosError) => {
            console.error('로그아웃 실패:', error)

            // 서버 에러여도 클라이언트 정리는 수행
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            queryClient.removeQueries({ queryKey: authKeys.all })
        },
    })
}
