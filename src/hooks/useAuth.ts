import { useQuery, UseQueryOptions } from '@tanstack/react-query'

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

export const useAuth = (authorization_code: string, options?: UseQueryOptions<User, AxiosError>) => {
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
