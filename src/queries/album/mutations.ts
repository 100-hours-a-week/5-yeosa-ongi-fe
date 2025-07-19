import { AlbumAPI } from '@/api/AlbumAPI'
import { APIError } from '@/types/api.types'
import { useMutation } from '@tanstack/react-query'
import { ALBUM_MUTATION_KEYS } from '../config/mutation-defaults'

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
export const useUpdateAlbumName = () => {
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
    return useMutation({
        mutationKey: ALBUM_MUTATION_KEYS.ALBUM.DELETE,
        mutationFn: async (albumId: string) => await AlbumAPI.deleteAlbum(albumId),
    })
}

/**
 * 사진 추가
 */
export const useAddPicture = (options?: { onSuccess?: (data: any) => void; onError?: (error: APIError) => void }) => {
    return useMutation({
        mutationKey: ALBUM_MUTATION_KEYS.PICTURE.ADD,
        mutationFn: async ({ albumId, pictureData }: { albumId: number; pictureData: any }) => {
            const response = await AlbumAPI.addPicture(albumId, pictureData)
            return response.data
        },
    })
}

/**
 * 앨범 사진 삭제
 */
export const useDeleteAlbumPictures = (options?: { onSuccess?: () => void; onError?: (error: APIError) => void }) => {
    return useMutation({
        mutationKey: ALBUM_MUTATION_KEYS.PICTURE.DELETE,
        mutationFn: async ({ albumId, pictureIds }: { albumId: string; pictureIds: string[] }) => {
            const response = await AlbumAPI.deleteAlbumPictures(albumId, pictureIds)
            return response
        },
    })
}

/**
 * 앨범 사진 복원
 */
export const useRecoverAlbumPictures = (options?: { onSuccess?: () => void; onError?: (error: APIError) => void }) => {
    return useMutation({
        mutationKey: ALBUM_MUTATION_KEYS.PICTURE.RECOVER,
        mutationFn: async ({ albumId, pictureIds }: { albumId: string; pictureIds: string[] }) => {
            const response = await AlbumAPI.recoverAlbumPictures(albumId, pictureIds)
            return response
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
        mutationKey: ALBUM_MUTATION_KEYS.PRESIGNED_URL.GET,
        mutationFn: async (pictures: any) => {
            const response = await AlbumAPI.getPreSignedUrl(pictures)
            return response.data
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
    return useMutation({
        mutationKey: ALBUM_MUTATION_KEYS.CLUSTER.UPDATE_TITLE,
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
    })
}

/**
 * 초대 링크 생성 (디폴트 설정 안함)
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
    return useMutation({
        mutationKey: ALBUM_MUTATION_KEYS.INVITE.CONFIRM,
        mutationFn: async (inviteToken: string) => {
            const response = await AlbumAPI.confirmInvite(inviteToken)
            return response.data
        },
    })
}

/**
 * 공동 작업자 삭제
 */
export const useRemoveMember = (options?: { onSuccess?: () => void; onError?: (error: APIError) => void }) => {
    return useMutation({
        mutationKey: ALBUM_MUTATION_KEYS.MEMBER.REMOVE,
        mutationFn: async ({ albumId, userId }: { albumId: string; userId: string }) => {
            await AlbumAPI.removeMember(albumId, userId)
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
    return useMutation({
        mutationKey: ALBUM_MUTATION_KEYS.COMMENT.CREATE,
        mutationFn: async ({ albumId, comment }: { albumId: string; comment: string }) => {
            const response = await AlbumAPI.createComment(albumId, comment)
            return response.data
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
    return useMutation({
        mutationKey: ALBUM_MUTATION_KEYS.COMMENT.UPDATE,
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
    })
}

/**
 * 댓글 삭제
 */
export const useDeleteComment = (options?: { onSuccess?: () => void; onError?: (error: APIError) => void }) => {
    return useMutation({
        mutationKey: ALBUM_MUTATION_KEYS.COMMENT.DELETE,
        mutationFn: async ({ albumId, commentId }: { albumId: string; commentId: string }) => {
            await AlbumAPI.deleteComment(albumId, commentId)
        },
    })
}

/**
 * 좋아요 토글
 */
export const useToggleLike = (options?: { onSuccess?: (data: any) => void; onError?: (error: APIError) => void }) => {
    return useMutation({
        mutationKey: ALBUM_MUTATION_KEYS.LIKE.TOGGLE,
        mutationFn: async (albumId: string) => {
            const response = await AlbumAPI.toggleLike(albumId)
            return response.data
        },
    })
}
