import { useCallback } from 'react'

import { useAlbumAccess, useAlbumMembers } from '@/queries/album/queries.ts'

import { useToast } from '@/contexts/ToastContext.tsx'
import { useRemoveMember } from '@/queries/album/mutations.ts'
import Coworker from './Coworker.tsx'

export interface CoworkerManagerProps {
    albumId: string
}

interface Coworker {
    userId: string
    nickname: string
    profileImageURL: string
    role: string
    isOwner: string
}

const CoworkerManager = ({ albumId }: CoworkerManagerProps) => {
    // 앨범 접근 권한 조회
    const toast = useToast()
    const { data: albumAccess, isLoading: isAccessLoading, error: accessError } = useAlbumAccess(albumId)

    // 앨범 멤버 목록 조회
    const {
        data: membersData,
        isLoading: isMembersLoading,
        error: membersError,
    } = useAlbumMembers(albumId!, {
        enabled: !!albumId,
    })

    // 멤버 삭제 mutation
    const deleteAlbumMemberMutation = useRemoveMember()

    // 로딩 상태 통합
    const isLoading = isAccessLoading || isMembersLoading

    // 에러 상태 확인
    const hasError = accessError || membersError

    // 안전하게 데이터 추출
    const userRole = albumAccess?.role
    const members = membersData?.userInfo || []

    const handleRemove = useCallback(
        (userId: string) => {
            if (!albumId || !userId) {
                console.error('albumId 또는 userId가 없습니다')
                return
            }

            deleteAlbumMemberMutation.mutate(
                { albumId, userId },
                {
                    onError: error => {
                        toast.error('공동작업자 삭제에 실패했습니다.')
                    },
                }
            )
        },
        [albumId, deleteAlbumMemberMutation]
    )

    // 로딩 상태
    if (isLoading) {
        return (
            <div className='relative flex flex-col w-full h-full max-w-md mx-auto bg-white rounded-lg shadow-lg'>
                <div className='p-5 border-b'>
                    <h3 className='text-lg font-medium text-gray-800'>공동 작업자</h3>
                </div>
                <div className='p-5 text-center text-gray-500'>로딩 중...</div>
            </div>
        )
    }

    // 에러 상태
    if (hasError) {
        return (
            <div className='relative flex flex-col w-full h-full max-w-md mx-auto bg-white rounded-lg shadow-lg'>
                <div className='p-5 border-b'>
                    <h3 className='text-lg font-medium text-gray-800'>공동 작업자</h3>
                </div>
                <div className='p-5 text-center text-red-500'>공동 작업자 목록을 불러오는데 실패했습니다.</div>
            </div>
        )
    }

    return (
        <div className='relative flex flex-col w-full h-full max-w-md mx-auto bg-white rounded-lg shadow-lg'>
            <div className='p-5 border-b'>
                <h3 className='text-lg font-medium text-gray-800'>공동 작업자</h3>
            </div>
            <div>
                {members.length === 0 ? (
                    <div className='p-5 text-center text-gray-500'>공동 작업자가 없습니다.</div>
                ) : (
                    members.map((element: Coworker) => (
                        <Coworker
                            key={element.userId} // key prop 추가
                            userId={element.userId}
                            nickname={element.nickname}
                            profileImageURL={element.profileImageURL}
                            role={element.role}
                            isOwner={userRole}
                            handleRemove={handleRemove}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

export default CoworkerManager
