import { AlbumAPI } from '@/api/AlbumAPI'
import { APIError } from '@/types/api.types'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { ALBUM_CACHE_POLICY } from './cache-config'
import { ALBUM_KEYS } from './keys'

/**
 * 월별 앨범 목록 조회
 */
export const useMonthlyAlbums = (yearMonth?: string, options?: UseQueryOptions<any, APIError>) => {
    return useQuery({
        queryKey: ALBUM_KEYS.MONTHLY(yearMonth),
        queryFn: async () => (await AlbumAPI.getMonthlyAlbums(yearMonth)).data,
        ...ALBUM_CACHE_POLICY.MONTHLY,
        ...options,
    })
}

/**
 * 앨범 상세 정보 조회
 */
export const useAlbumDetail = (
    albumId: string,
    options?: Omit<UseQueryOptions<any, APIError>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: ALBUM_KEYS.DETAIL(albumId),
        queryFn: async () => (await AlbumAPI.getAlbumDetail(albumId)).data,
        enabled: !!albumId,
        ...ALBUM_CACHE_POLICY.DETAIL,
        ...options,
    })
}

/**
 * 앨범 요약 정보 조회
 */
export const useAlbumSummary = (albumId: string, options?: UseQueryOptions<any, APIError>) => {
    return useQuery({
        queryKey: ALBUM_KEYS.SUMMARY(albumId),
        queryFn: async () => (await AlbumAPI.getAlbumSummary(albumId)).data,
        enabled: !!albumId,
        ...ALBUM_CACHE_POLICY.SUMMARY,
        ...options,
    })
}

/**
 * 앨범 권한 확인
 */
export const useAlbumAccess = (
    albumId: string,
    options?: Omit<UseQueryOptions<any, APIError>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: ALBUM_KEYS.ACCESS(albumId),
        queryFn: async () => (await AlbumAPI.getAlbumAccess(albumId)).data,

        enabled: !!albumId,
        ...ALBUM_CACHE_POLICY.ACCESS,
        ...options,
    })
}

/**
 * 공동 작업자 목록 조회
 */
export const useAlbumMembers = (
    albumId: string,
    options?: Omit<UseQueryOptions<any, APIError>, 'queryKey' | 'queryFn'>
) => {
    return useQuery({
        queryKey: ALBUM_KEYS.MEMBERS(albumId),
        queryFn: async () => (await AlbumAPI.getMembers(albumId)).data,

        enabled: !!albumId,
        ...ALBUM_CACHE_POLICY.MEMBERS,
        ...options,
    })
}

/**
 * 댓글 목록 조회
 */
export const useAlbumComments = (albumId: string, options?: UseQueryOptions<any, APIError>) => {
    return useQuery({
        queryKey: ALBUM_KEYS.COMMENTS(albumId),
        queryFn: async () => (await AlbumAPI.getComments(albumId)).data,
        enabled: !!albumId,
        ...ALBUM_CACHE_POLICY.COMMENTS,
        ...options,
    })
}

/**
 * 좋아요 정보 조회
 */
export const useAlbumLikes = (albumId: string, options?: UseQueryOptions<any, APIError>) => {
    return useQuery({
        queryKey: ALBUM_KEYS.LIKES(albumId),
        queryFn: async () => (await AlbumAPI.getLikes(albumId)).data,
        enabled: !!albumId,
        ...ALBUM_CACHE_POLICY.LIKES,
        ...options,
    })
}
