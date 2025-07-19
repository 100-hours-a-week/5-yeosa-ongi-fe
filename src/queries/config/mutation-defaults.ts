import { APIError } from '@/types/api.types'
import { QueryClient } from '@tanstack/react-query'
import { ALBUM_KEYS } from '../album/keys'

export const ALBUM_MUTATION_KEYS = {
    ALBUM: {
        CREATE: ['album', 'create'],
        UPDATE: ['album', 'update'],
        DELETE: ['album', 'delete'],
    },
    PICTURE: {
        ADD: ['picture', 'add'],
        DELETE: ['picture', 'delete'],
        RECOVER: ['picture', 'recover'],
    },
    CLUSTER: {
        UPDATE_TITLE: ['cluster', 'update-title'],
    },
    INVITE: {
        CREATE: ['invite', 'create'],
        CONFIRM: ['invite', 'confirm'],
    },
    MEMBER: {
        REMOVE: ['member', 'remove'],
    },
    COMMENT: {
        CREATE: ['comment', 'create'],
        UPDATE: ['comment', 'update'],
        DELETE: ['comment', 'delete'],
    },
    LIKE: {
        TOGGLE: ['like', 'toggle'],
    },
    PRESIGNED_URL: {
        GET: ['presigned-url', 'get'],
    },
} as const

/**
 * 앨범 생성
 * @param queryClient
 */
export const setupAlbumMutationDefaults = (queryClient: QueryClient) => {
    queryClient.setMutationDefaults(ALBUM_MUTATION_KEYS.ALBUM.CREATE, {
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({
                predicate: query =>
                    Array.isArray(query.queryKey) && query.queryKey[0] === 'album' && query.queryKey[1] === 'monthly',
            })
        },
        onError: (error: APIError, variables, context) => {
            console.error('앨범 생성 기본 에러:', error.message)
        },
    })

    /**
     * 앨범 이름 수정 (낙관적 업데이트)
     */
    queryClient.setMutationDefaults(ALBUM_MUTATION_KEYS.ALBUM.UPDATE, {
        retry: 2,
        retryDelay: 1000,
        onMutate: async (variables: { albumId: string; albumName: string }) => {
            // 진행 중인 쿼리들 취소
            await queryClient.cancelQueries({ queryKey: ALBUM_KEYS.DETAIL(variables.albumId) })

            // 현재 데이터 백업
            const previousAlbum = queryClient.getQueryData(ALBUM_KEYS.DETAIL(variables.albumId))

            // 낙관적 업데이트 - 즉시 캐시 업데이트
            queryClient.setQueryData(ALBUM_KEYS.DETAIL(variables.albumId), (old: any) => {
                if (!old) return old
                return {
                    ...old,
                    title: variables.albumName, // 새 제목으로 즉시 업데이트
                }
            })

            return { previousAlbum }
        },

        onError: (error: APIError, variables: any, context: any) => {
            const { albumId } = variables as { albumId: string }

            if (context?.previousAlbum) {
                queryClient.setQueryData(ALBUM_KEYS.DETAIL(albumId), context.previousAlbum)
            }
        },

        onSuccess: (data, variables: any, context) => {
            const { albumId } = variables as { albumId: string }

            queryClient.invalidateQueries({ queryKey: ALBUM_KEYS.SUMMARY(albumId) })
            queryClient.invalidateQueries({
                predicate: query =>
                    Array.isArray(query.queryKey) && query.queryKey[0] === 'album' && query.queryKey[1] === 'monthly',
            })
        },
    })

    /**
     * 앨범 삭제
     */
    queryClient.setMutationDefaults(ALBUM_MUTATION_KEYS.ALBUM.DELETE, {
        onSuccess: (data, variables: any, context) => {
            const { albumId } = variables as { albumId: string }

            // 앨범 리스트 캐시 무효화
            queryClient.invalidateQueries({ queryKey: ALBUM_KEYS.MONTHLY(undefined) })

            // 삭제된 앨범의 모든 캐시 제거
            queryClient.removeQueries({
                predicate: query => Array.isArray(query.queryKey) && query.queryKey.includes(albumId),
            })

            // TODO
            // 사용자 통계 캐시 무효화
        },
        onError: (error: APIError) => {
            console.error('앨범 삭제 실패:', error.message)
        },
    })

    /**
     * 사진 추가
     */
    queryClient.setMutationDefaults(ALBUM_MUTATION_KEYS.PICTURE.ADD, {
        onSuccess: (data, variables: any, context) => {
            const { albumId } = variables as { albumId: string }
            // 앨범 상세 정보 캐시 무효화
            queryClient.invalidateQueries({ queryKey: ALBUM_KEYS.DETAIL(albumId) })
        },
        onError: (error: APIError) => {
            console.error('사진 추가 실패:', error.message)
        },
    })

    /**
     * 사진 삭제
     */
    queryClient.setMutationDefaults(ALBUM_MUTATION_KEYS.PICTURE.DELETE, {
        onSuccess: (data, variables: any, context) => {
            const { albumId } = variables as { albumId: string }

            // 앨범 상세 정보 무효화
            queryClient.invalidateQueries({
                queryKey: ALBUM_KEYS.DETAIL(albumId),
            })
        },
        onError: (error: APIError) => {
            console.error('앨범 사진 삭제 실패:', error.message)
        },
    })

    /**
     * 사진 복원
     */
    queryClient.setMutationDefaults(ALBUM_MUTATION_KEYS.PICTURE.RECOVER, {
        onSuccess: (data, variables: any) => {
            const { albumId } = variables as { albumId: string }

            // 앨범 상세 정보도 무효화
            queryClient.invalidateQueries({
                queryKey: ALBUM_KEYS.DETAIL(albumId),
            })
        },
        onError: (error: APIError) => {
            console.error('앨범 사진 복원 실패:', error.message)
        },
    })

    /**
     * 클러스터 제목 변경
     */
    queryClient.setMutationDefaults(ALBUM_MUTATION_KEYS.CLUSTER.UPDATE_TITLE, {
        onSuccess: (data, variables: any) => {
            const { albumId } = variables as { albumId: string }
            // 앨범 상세 정보 캐시 무효화
            queryClient.invalidateQueries({ queryKey: ALBUM_KEYS.DETAIL(albumId) })
        },
        onError: (error: APIError) => {
            console.error('클러스터 제목 변경 실패:', error.message)
        },
    })

    /**
     * 초대 확인 (새 앨범 추가)
     */
    queryClient.setMutationDefaults(ALBUM_MUTATION_KEYS.INVITE.CONFIRM, {
        onSuccess: data => {
            // 모든 앨범 목록 캐시 무효화 (새 앨범이 추가됨)
            queryClient.invalidateQueries({ queryKey: ALBUM_KEYS.all })
        },
        onError: (error: APIError) => {
            console.error('초대 확인 실패:', error.message)
        },
    })

    /**
     * 공동 작업자 삭제
     */
    queryClient.setMutationDefaults(ALBUM_MUTATION_KEYS.MEMBER.REMOVE, {
        onSuccess: (data, variables: any) => {
            const { albumId } = variables as { albumId: string }
            // 멤버 목록 캐시 무효화
            queryClient.invalidateQueries({ queryKey: ALBUM_KEYS.MEMBERS(albumId) })
        },
        onError: (error: APIError) => {
            console.error('공동 작업자 삭제 실패:', error.message)
        },
    })
}
