import { AlbumAPI } from '@/api/AlbumAPI'
import { APIError } from '@/types/api.types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ALBUM_MUTATION_KEYS } from '../config/mutation-defaults'
import { ALBUM_KEYS } from './keys'

/**
 * 앨범 생성
 */

export const useCreateAlbum = (options?: { onSuccess?: (data: any) => void; onError?: (error: APIError) => void }) => {
    return useMutation({
        mutationKey: ALBUM_MUTATION_KEYS.ALBUM.CREATE,
        mutationFn: async (albumData: any) => {
            const response = await AlbumAPI.createAlbum(albumData)
            return response.data
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
    return useMutation({
        mutationKey: ALBUM_MUTATION_KEYS.ALBUM.UPDATE,
        mutationFn: async ({ albumId, albumName }: { albumId: string; albumName: string }) => {
            const response = await AlbumAPI.updateAlbumName(albumId, albumName)
            return response.data
        },
    })
}

/**
 * 앨범 삭제
 */
export const useDeleteAlbum = (options?: { onSuccess?: () => void; onError?: (error: APIError) => void }) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (albumId: string) => await AlbumAPI.deleteAlbum(albumId),
        onSuccess: (_, albumId) => {
            // 앨범 리스트 캐시 무효화
            queryClient.invalidateQueries({ queryKey: ALBUM_KEYS.MONTHLY(undefined) })

            // 삭제된 앨범의 모든 캐시 제거
            queryClient.removeQueries({ queryKey: ALBUM_KEYS.DETAIL(albumId) })
            queryClient.removeQueries({ queryKey: ALBUM_KEYS.SUMMARY(albumId) })
            queryClient.removeQueries({ queryKey: ALBUM_KEYS.ACCESS(albumId) })
            queryClient.removeQueries({ queryKey: ALBUM_KEYS.MEMBERS(albumId) })
            queryClient.removeQueries({ queryKey: ALBUM_KEYS.COMMENTS(albumId) })
            queryClient.removeQueries({ queryKey: ALBUM_KEYS.LIKES(albumId) })
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
            queryClient.invalidateQueries({ queryKey: ALBUM_KEYS.DETAIL(variables.albumId.toString()) })
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
                queryKey: ALBUM_KEYS.PICTURES(variables.albumId),
            })

            // 앨범 상세 정보도 무효화 (사진 개수 등이 변경될 수 있음)
            queryClient.invalidateQueries({
                queryKey: ALBUM_KEYS.DETAIL(variables.albumId),
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
                queryKey: ALBUM_KEYS.PICTURES(variables.albumId),
            })

            // 앨범 상세 정보도 무효화
            queryClient.invalidateQueries({
                queryKey: ALBUM_KEYS.DETAIL(variables.albumId),
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
            queryClient.invalidateQueries({ queryKey: ALBUM_KEYS.DETAIL(variables.albumId) })
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
            queryClient.invalidateQueries({ queryKey: ALBUM_KEYS.all })
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
            queryClient.invalidateQueries({ queryKey: ALBUM_KEYS.MEMBERS(variables.albumId.toString()) })
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
            queryClient.invalidateQueries({ queryKey: ALBUM_KEYS.COMMENTS(variables.albumId) })
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
            queryClient.invalidateQueries({ queryKey: ALBUM_KEYS.COMMENTS(variables.albumId) })
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
            queryClient.invalidateQueries({ queryKey: ALBUM_KEYS.COMMENTS(variables.albumId) })
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
            queryClient.invalidateQueries({ queryKey: ALBUM_KEYS.LIKES(albumId) })
            console.log('좋아요 토글 성공')
            options?.onSuccess?.(data)
        },
        onError: (error: APIError) => {
            console.error('좋아요 토글 실패:', error.message)
            options?.onError?.(error)
        },
    })
}
