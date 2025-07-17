import { APIError } from '@/types/api.types'
import { QueryClient } from '@tanstack/react-query'
import { ALBUM_KEYS } from '../album/keys'

export const ALBUM_MUTATION_KEYS = {
    ALBUM: {
        CREATE: ['album', 'create'],
        UPDATE: ['album', 'update'],
        DELETE: ['album', 'delete'],
    },
} as const

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

    queryClient.setMutationDefaults(ALBUM_MUTATION_KEYS.ALBUM.UPDATE, {
        retry: 2,
        retryDelay: 1000,
        onMutate: async (variables: { albumId: string; albumName: string }) => {
            console.log('🚀 낙관적 업데이트 시작')

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

            // 요약 정보도 업데이트 (있다면)
            queryClient.setQueryData(ALBUM_KEYS.SUMMARY(variables.albumId), (old: any) => {
                if (!old) return old
                return {
                    ...old,
                    title: variables.albumName,
                }
            })

            // 월별 목록도 업데이트 (해당 앨범이 있다면)
            queryClient.setQueriesData(
                {
                    predicate: query =>
                        Array.isArray(query.queryKey) &&
                        query.queryKey[0] === 'album' &&
                        query.queryKey[1] === 'monthly',
                },
                (old: any) => {
                    if (!old || !Array.isArray(old)) return old
                    return old.map((album: any) =>
                        album.id === variables.albumId ? { ...album, title: variables.albumName } : album
                    )
                }
            )

            return { previousAlbum }
        },

        onError: (error: APIError, variables: any, context: any) => {
            console.log('❌ 에러 발생, 롤백 시작')

            const { albumId } = variables as { albumId: string }

            // 에러 시 이전 데이터로 롤백
            if (context?.previousAlbum) {
                queryClient.setQueryData(ALBUM_KEYS.DETAIL(albumId), context.previousAlbum)
            }

            console.error('앨범 수정 실패:', error.message)
        },

        onSuccess: (data, variables: any, context) => {
            console.log('✅ 서버 업데이트 성공')

            const { albumId } = variables as { albumId: string }

            // 성공 시에는 서버 데이터와 동기화하기 위해 무효화
            // (낙관적 업데이트와 서버 데이터가 다를 수 있으므로)
            queryClient.invalidateQueries({ queryKey: ALBUM_KEYS.DETAIL(albumId) })
            queryClient.invalidateQueries({ queryKey: ALBUM_KEYS.SUMMARY(albumId) })
            queryClient.invalidateQueries({
                predicate: query =>
                    Array.isArray(query.queryKey) && query.queryKey[0] === 'album' && query.queryKey[1] === 'monthly',
            })
        },

        onSettled: (data, error, variables: any, context) => {
            console.log('🏁 Mutation 완료')
            // 성공/실패 관계없이 실행되는 로직이 있다면 여기에
        },
    })
}
