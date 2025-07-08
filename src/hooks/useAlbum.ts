import { AlbumAPI } from '@/api/AlbumAPI'
import { APIError } from '@/types/api.types'
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query'

// 올바른 타입 정의
type QueryOptions<T> = {
    enabled?: boolean
    staleTime?: number
    retry?: number | boolean
    refetchOnWindowFocus?: boolean
    refetchInterval?: number
    onSuccess?: (data: T) => void
    onError?: (error: APIError) => void
}

// Query Keys
export const albumKeys = {
    all: ['album'] as const,
    monthly: (yearMonth?: string) => [...albumKeys.all, 'monthly', yearMonth] as const,
    detail: (albumId: string) => [...albumKeys.all, 'detail', albumId] as const,
    summary: (albumId: string) => [...albumKeys.all, 'summary', albumId] as const,
    access: (albumId: string) => [...albumKeys.all, 'access', albumId] as const,
    members: (albumId: string) => [...albumKeys.all, 'members', albumId] as const,
    comments: (albumId: string) => [...albumKeys.all, 'comments', albumId] as const,
    likes: (albumId: string) => [...albumKeys.all, 'likes', albumId] as const,
    pictures: (albumId: string) => [...albumKeys.all, 'pictures', albumId] as const,
} as const

// ============= 조회 Query Hooks =============

/**
 * 월별 앨범 목록 조회
 */
export const useMonthlyAlbums = (yearMonth?: string, options?: UseQueryOptions<any, APIError>) => {
    return useQuery({
        queryKey: albumKeys.monthly(yearMonth),
        queryFn: async () => {
            const response = await AlbumAPI.getMonthlyAlbums(yearMonth)
            return response.data
        },
        staleTime: 3 * 60 * 1000, // 3분
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
        queryKey: albumKeys.detail(albumId),
        queryFn: async () => {
            const response = await AlbumAPI.getAlbumDetail(albumId)
            return response.data
        },
        enabled: !!albumId,
        staleTime: 2 * 60 * 1000, // 2분
        ...options,
    })
}

/**
 * 앨범 요약 정보 조회
 */
export const useAlbumSummary = (albumId: string, options?: UseQueryOptions<any, APIError>) => {
    return useQuery({
        queryKey: albumKeys.summary(albumId),
        queryFn: async () => {
            const response = await AlbumAPI.getAlbumSummary(albumId)
            return response.data
        },
        enabled: !!albumId,
        staleTime: 5 * 60 * 1000, // 5분
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
        queryKey: albumKeys.access(albumId),
        queryFn: async () => {
            const response = await AlbumAPI.getAlbumAccess(albumId)
            return response.data
        },
        enabled: !!albumId,
        staleTime: 10 * 60 * 1000, // 10분 (권한은 자주 바뀌지 않음)
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
        queryKey: albumKeys.members(albumId),
        queryFn: async () => {
            const response = await AlbumAPI.getMembers(albumId)
            return response.data
        },
        enabled: !!albumId,
        staleTime: 3 * 60 * 1000, // 3분
        ...options,
    })
}

/**
 * 댓글 목록 조회
 */
export const useAlbumComments = (albumId: string, options?: UseQueryOptions<any, APIError>) => {
    return useQuery({
        queryKey: albumKeys.comments(albumId),
        queryFn: async () => {
            const response = await AlbumAPI.getComments(albumId)
            return response.data
        },
        enabled: !!albumId,
        staleTime: 1 * 60 * 1000, // 1분 (댓글은 실시간성이 중요)
        ...options,
    })
}

/**
 * 좋아요 정보 조회
 */
export const useAlbumLikes = (albumId: string, options?: UseQueryOptions<any, APIError>) => {
    return useQuery({
        queryKey: albumKeys.likes(albumId),
        queryFn: async () => {
            const response = await AlbumAPI.getLikes(albumId)
            return response.data
        },
        enabled: !!albumId,
        staleTime: 30 * 1000, // 30초 (좋아요도 실시간성이 중요)
        ...options,
    })
}

// ============= Mutation Hooks =============

/**
 * 앨범 생성
 */
export const useCreateAlbum = (options?: { onSuccess?: (data: any) => void; onError?: (error: APIError) => void }) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (albumData: any) => {
            const response = await AlbumAPI.createAlbum(albumData)
            return response.data
        },
        onSuccess: data => {
            // 월별 앨범 목록 캐시 무효화
            queryClient.invalidateQueries({ queryKey: albumKeys.all })
            console.log('앨범 생성 성공')
            options?.onSuccess?.(data)
        },
        onError: (error: APIError) => {
            console.error('앨범 생성 실패:', error.message)
            options?.onError?.(error)
        },
    })
}

/**
 * 앨범 이름 수정
 */
export const useUpdateAlbumName = (options?: {
    onSuccess?: (data: any) => void
    onError?: (error: APIError) => void
}) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ albumId, albumName }: { albumId: string; albumName: string }) => {
            const response = await AlbumAPI.updateAlbumName(albumId, albumName)
            return response.data
        },
        onSuccess: (data, variables) => {
            // 해당 앨범 관련 캐시 무효화
            queryClient.invalidateQueries({ queryKey: albumKeys.detail(variables.albumId) })
            queryClient.invalidateQueries({ queryKey: albumKeys.all })
            console.log('앨범 이름 수정 성공')
            options?.onSuccess?.(data)
        },
        onError: (error: APIError) => {
            console.error('앨범 이름 수정 실패:', error.message)
            options?.onError?.(error)
        },
    })
}

/**
 * 앨범 삭제
 */
export const useDeleteAlbum = (options?: { onSuccess?: () => void; onError?: (error: APIError) => void }) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (albumId: string) => {
            await AlbumAPI.deleteAlbum(albumId)
        },
        onSuccess: (_, albumId) => {
            // 모든 앨범 관련 캐시 무효화
            queryClient.invalidateQueries({ queryKey: albumKeys.all })
            // 삭제된 앨범의 모든 캐시 제거
            queryClient.removeQueries({ queryKey: albumKeys.detail(albumId) })
            queryClient.removeQueries({ queryKey: albumKeys.summary(albumId) })
            queryClient.removeQueries({ queryKey: albumKeys.access(albumId) })
            queryClient.removeQueries({ queryKey: albumKeys.members(albumId) })
            queryClient.removeQueries({ queryKey: albumKeys.comments(albumId) })
            queryClient.removeQueries({ queryKey: albumKeys.likes(albumId) })
            console.log('앨범 삭제 성공')
            options?.onSuccess?.()
        },
        onError: (error: APIError) => {
            console.error('앨범 삭제 실패:', error.message)
            options?.onError?.(error)
        },
    })
}

/**
 * 사진 추가
 */
export const useAddPicture = (options?: { onSuccess?: (data: any) => void; onError?: (error: APIError) => void }) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ albumId, pictureData }: { albumId: number; pictureData: any }) => {
            const response = await AlbumAPI.addPicture(albumId, pictureData)
            return response.data
        },
        onSuccess: (data, variables) => {
            // 앨범 상세 정보 캐시 무효화
            queryClient.invalidateQueries({ queryKey: albumKeys.detail(variables.albumId.toString()) })
            console.log('사진 추가 성공')
            options?.onSuccess?.(data)
        },
        onError: (error: APIError) => {
            console.error('사진 추가 실패:', error.message)
            options?.onError?.(error)
        },
    })
}

/**
 * 앨범 사진 삭제
 */
export const useDeleteAlbumPictures = (options?: { onSuccess?: () => void; onError?: (error: APIError) => void }) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ albumId, pictureIds }: { albumId: string; pictureIds: string[] }) => {
            console.log(pictureIds)
            const response = await AlbumAPI.deleteAlbumPictures(albumId, pictureIds)
            return response
        },
        onSuccess: (_, variables) => {
            // 해당 앨범의 사진 목록 캐시 무효화
            queryClient.invalidateQueries({
                queryKey: albumKeys.pictures(variables.albumId),
            })

            // 앨범 상세 정보도 무효화 (사진 개수 등이 변경될 수 있음)
            queryClient.invalidateQueries({
                queryKey: albumKeys.detail(variables.albumId),
            })

            console.log('앨범 사진 삭제 성공')
            options?.onSuccess?.()
        },
        onError: (error: APIError) => {
            console.error('앨범 사진 삭제 실패:', error.message)
            options?.onError?.(error)
        },
    })
}

/**
 * 앨범 사진 복원
 */
export const useRecoverAlbumPictures = (options?: { onSuccess?: () => void; onError?: (error: APIError) => void }) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ albumId, pictureIds }: { albumId: string; pictureIds: string[] }) => {
            const response = await AlbumAPI.recoverAlbumPictures(albumId, pictureIds)
            return response
        },
        onSuccess: (_, variables) => {
            // 해당 앨범의 사진 목록 캐시 무효화
            queryClient.invalidateQueries({
                queryKey: albumKeys.pictures(variables.albumId),
            })

            // 앨범 상세 정보도 무효화
            queryClient.invalidateQueries({
                queryKey: albumKeys.detail(variables.albumId),
            })

            console.log('앨범 사진 복원 성공')
            options?.onSuccess?.()
        },
        onError: (error: APIError) => {
            console.error('앨범 사진 복원 실패:', error.message)
            options?.onError?.(error)
        },
    })
}

/**
 * PreSigned URL 발급
 */
export const useGetPreSignedUrl = (options?: {
    onSuccess?: (data: any) => void
    onError?: (error: APIError) => void
}) => {
    return useMutation({
        mutationFn: async (pictures: any) => {
            const response = await AlbumAPI.getPreSignedUrl(pictures)
            return response.data
        },
        onSuccess: data => {
            console.log('PreSigned URL 발급 성공')
            options?.onSuccess?.(data)
        },
        onError: (error: APIError) => {
            console.error('PreSigned URL 발급 실패:', error.message)
            options?.onError?.(error)
        },
    })
}

/**
 * 클러스터 제목 변경
 */
export const useUpdateClusterTitle = (options?: {
    onSuccess?: (data: any) => void
    onError?: (error: APIError) => void
}) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            albumId,
            clusterId,
            clusterName,
        }: {
            albumId: string
            clusterId: string
            clusterName: string
        }) => {
            const response = await AlbumAPI.updateClusterTitle(albumId, clusterId, clusterName)
            return response.data
        },
        onSuccess: (data, variables) => {
            // 앨범 상세 정보 캐시 무효화
            queryClient.invalidateQueries({ queryKey: albumKeys.detail(variables.albumId) })
            console.log('클러스터 제목 변경 성공')
            options?.onSuccess?.(data)
        },
        onError: (error: APIError) => {
            console.error('클러스터 제목 변경 실패:', error.message)
            options?.onError?.(error)
        },
    })
}

/**
 * 초대 링크 생성
 */
export const useCreateInviteLink = (options?: {
    onSuccess?: (data: any) => void
    onError?: (error: APIError) => void
}) => {
    return useMutation({
        mutationFn: async (albumId: string) => {
            const response = await AlbumAPI.createInviteLink(albumId)
            return response.data
        },
        onSuccess: data => {
            console.log('초대 링크 생성 성공')
            options?.onSuccess?.(data)
        },
        onError: (error: APIError) => {
            console.error('초대 링크 생성 실패:', error.message)
            options?.onError?.(error)
        },
    })
}

/**
 * 초대 확인
 */
export const useConfirmInvite = (options?: {
    onSuccess?: (data: any) => void
    onError?: (error: APIError) => void
}) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (inviteToken: string) => {
            const response = await AlbumAPI.confirmInvite(inviteToken)
            return response.data
        },
        onSuccess: data => {
            // 모든 앨범 목록 캐시 무효화 (새 앨범이 추가됨)
            queryClient.invalidateQueries({ queryKey: albumKeys.all })
            console.log('초대 확인 성공')
            options?.onSuccess?.(data)
        },
        onError: (error: APIError) => {
            console.error('초대 확인 실패:', error.message)
            options?.onError?.(error)
        },
    })
}

/**
 * 공동 작업자 삭제
 */
export const useRemoveMember = (options?: { onSuccess?: () => void; onError?: (error: APIError) => void }) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ albumId, userId }: { albumId: string; userId: string }) => {
            await AlbumAPI.removeMember(albumId, userId)
        },
        onSuccess: (_, variables) => {
            // 멤버 목록 캐시 무효화
            queryClient.invalidateQueries({ queryKey: albumKeys.members(variables.albumId.toString()) })
            console.log('공동 작업자 삭제 성공')
            options?.onSuccess?.()
        },
        onError: (error: APIError) => {
            console.error('공동 작업자 삭제 실패:', error.message)
            options?.onError?.(error)
        },
    })
}

/**
 * 댓글 작성
 */
export const useCreateComment = (options?: {
    onSuccess?: (data: any) => void
    onError?: (error: APIError) => void
}) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ albumId, comment }: { albumId: string; comment: string }) => {
            const response = await AlbumAPI.createComment(albumId, comment)
            return response.data
        },
        onSuccess: (data, variables) => {
            // 댓글 목록 캐시 무효화
            queryClient.invalidateQueries({ queryKey: albumKeys.comments(variables.albumId) })
            console.log('댓글 작성 성공')
            options?.onSuccess?.(data)
        },
        onError: (error: APIError) => {
            console.error('댓글 작성 실패:', error.message)
            options?.onError?.(error)
        },
    })
}

/**
 * 댓글 수정
 */
export const useUpdateComment = (options?: {
    onSuccess?: (data: any) => void
    onError?: (error: APIError) => void
}) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            albumId,
            commentId,
            comment,
        }: {
            albumId: string
            commentId: string
            comment: string
        }) => {
            const response = await AlbumAPI.updateComment(albumId, commentId, comment)
            return response.data
        },
        onSuccess: (data, variables) => {
            // 댓글 목록 캐시 무효화
            queryClient.invalidateQueries({ queryKey: albumKeys.comments(variables.albumId) })
            console.log('댓글 수정 성공')
            options?.onSuccess?.(data)
        },
        onError: (error: APIError) => {
            console.error('댓글 수정 실패:', error.message)
            options?.onError?.(error)
        },
    })
}

/**
 * 댓글 삭제
 */
export const useDeleteComment = (options?: { onSuccess?: () => void; onError?: (error: APIError) => void }) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ albumId, commentId }: { albumId: string; commentId: string }) => {
            await AlbumAPI.deleteComment(albumId, commentId)
        },
        onSuccess: (_, variables) => {
            // 댓글 목록 캐시 무효화
            queryClient.invalidateQueries({ queryKey: albumKeys.comments(variables.albumId) })
            console.log('댓글 삭제 성공')
            options?.onSuccess?.()
        },
        onError: (error: APIError) => {
            console.error('댓글 삭제 실패:', error.message)
            options?.onError?.(error)
        },
    })
}

/**
 * 좋아요 토글
 */
export const useToggleLike = (options?: { onSuccess?: (data: any) => void; onError?: (error: APIError) => void }) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (albumId: string) => {
            const response = await AlbumAPI.toggleLike(albumId)
            return response.data
        },
        onSuccess: (data, albumId) => {
            // 좋아요 정보 캐시 무효화
            queryClient.invalidateQueries({ queryKey: albumKeys.likes(albumId) })
            console.log('좋아요 토글 성공')
            options?.onSuccess?.(data)
        },
        onError: (error: APIError) => {
            console.error('좋아요 토글 실패:', error.message)
            options?.onError?.(error)
        },
    })
}
