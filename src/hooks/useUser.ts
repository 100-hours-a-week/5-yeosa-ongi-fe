// useUser.ts
import { PictureStatistic, PlaceStatistic, UserActivity, UserAPI, UserStatistics } from '@/api/UserAPI'
import useAuthStore from '@/stores/authStore'
import { APIError } from '@/types/api.types'
import { User } from '@/types/auth.types'
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query'

export const userKeys = {
    all: ['user'] as const,
    statistics: () => [...userKeys.all, 'statistics'] as const,
    activities: (yearMonth?: string) => [...userKeys.all, 'activities', yearMonth] as const,
    pictureStats: (yearMonth?: string) => [...userKeys.all, 'picture-stats', yearMonth] as const,
    placeStats: (yearMonth?: string) => [...userKeys.all, 'place-stats', yearMonth] as const,
} as const

// 유저 정보 업데이트
export const useUpdateUserInfo = (options?: {
    onSuccess?: (data: User) => void
    onError?: (error: APIError) => void
}) => {
    const queryClient = useQueryClient()
    const setUser = useAuthStore(state => state.setUser)

    return useMutation({
        mutationFn: async ({ userId, userInfo }: { userId: string; userInfo: Partial<User> }) => {
            const response = await UserAPI.updateUserInfo(userId, userInfo)
            return response.data!
        },
        onSuccess: data => {
            // 스토어의 사용자 정보 업데이트
            setUser(data)

            // 관련 쿼리 무효화
            queryClient.invalidateQueries({ queryKey: userKeys.all })

            console.log('유저 정보 업데이트 성공')
            options?.onSuccess?.(data)
        },
        onError: (error: APIError) => {
            console.error('유저 정보 업데이트 실패:', error.message)
            options?.onError?.(error)
        },
    })
}

// 전체 통계 조회
export const useTotalStatistics = (options?: UseQueryOptions<UserStatistics, APIError>) => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated)

    return useQuery({
        queryKey: userKeys.statistics(),
        queryFn: async () => {
            const response = await UserAPI.getTotalStatistics()
            return response.data!
        },
        enabled: isAuthenticated,
        staleTime: 5 * 60 * 1000, // 5분
        retry: 1,
        ...options,
    })
}

// 사용자 활동 조회
export const useUserActivities = (yearMonth: string, options?: UseQueryOptions<UserActivity[], APIError>) => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated)

    return useQuery({
        queryKey: userKeys.activities(yearMonth),
        queryFn: async () => {
            const response = await UserAPI.getUserActivities(yearMonth)
            return response.data!
        },
        enabled: isAuthenticated && !!yearMonth,
        staleTime: 10 * 60 * 1000, // 10분
        retry: 1,
        ...options,
    })
}

// 사진 통계 조회
export const usePictureStatistics = (yearMonth: string, options?: UseQueryOptions<PictureStatistic, APIError>) => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated)

    return useQuery({
        queryKey: userKeys.pictureStats(yearMonth),
        queryFn: async () => {
            const response = await UserAPI.getPictureStatistics(yearMonth)
            return response.data!
        },
        enabled: isAuthenticated && !!yearMonth,
        staleTime: 15 * 60 * 1000, // 15분
        retry: 1,
        ...options,
    })
}

// 장소 통계 조회
export const usePlaceStatistics = (yearMonth: string, options?: UseQueryOptions<PlaceStatistic, APIError>) => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated)

    return useQuery({
        queryKey: userKeys.placeStats(yearMonth),
        queryFn: async () => {
            const response = await UserAPI.getPlaceStatistics(yearMonth)
            return response.data!
        },
        enabled: isAuthenticated && !!yearMonth,
        staleTime: 15 * 60 * 1000, // 15분
        retry: 1,
        ...options,
    })
}

// 통계 데이터 새로고침
export const useRefreshStatistics = () => {
    const queryClient = useQueryClient()

    return {
        refreshAll: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all })
        },
        refreshStatistics: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.statistics() })
        },
        refreshActivities: (yearMonth?: string) => {
            queryClient.invalidateQueries({ queryKey: userKeys.activities(yearMonth) })
        },
        refreshPictureStats: (yearMonth?: string) => {
            queryClient.invalidateQueries({ queryKey: userKeys.pictureStats(yearMonth) })
        },
        refreshPlaceStats: (yearMonth?: string) => {
            queryClient.invalidateQueries({ queryKey: userKeys.placeStats(yearMonth) })
        },
    }
}
