import { AlbumShare, CoworkerManager } from '@/components/Album'
import { useAlbumAccess, useCreateInviteLink } from '@/hooks/useAlbum'
import { useEffect, useState } from 'react'
import AlbumDeleteSection from './AlbumDeleteSection'

export interface AlbumSettingProps {
    albumId: string
    albumName: string
    handleDelete: () => void

    isDeleting?: boolean // 삭제 중 상태
}

const AlbumSetting = ({ albumId, albumName, handleDelete, isDeleting = false }: AlbumSettingProps) => {
    const [activeSection, setActiveSection] = useState('sharing')
    const [sharingLink, setSharingLink] = useState('')

    const {
        data: albumAccess,
        isLoading: isAccessLoading,
        error: accessError,
    } = useAlbumAccess(albumId, {
        enabled: !!albumId,
    })

    const createInviteLinkMutation = useCreateInviteLink({
        onSuccess: data => {
            setSharingLink(data)
        },
        onError: error => {
            console.error('공유 링크 생성 실패:', error)
        },
    })
    const userRole = albumAccess?.role

    useEffect(() => {
        if (userRole === 'OWNER' && !sharingLink && !createInviteLinkMutation.isPending) {
            createInviteLinkMutation.mutate(albumId)
        }
    }, [albumId, userRole, sharingLink, createInviteLinkMutation])

    const isMainLoading = isAccessLoading
    const isLinkLoading = createInviteLinkMutation.isPending

    if (accessError) {
        return (
            <div className='max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-lg h-[400px] flex items-center justify-center'>
                <div className='text-center text-red-500'>
                    <svg className='w-12 h-12 mx-auto mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                        />
                    </svg>
                    <p>앨범 설정을 불러오는데 실패했습니다.</p>
                </div>
            </div>
        )
    }

    if (isMainLoading) {
        return (
            <div className='max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-lg h-[400px] flex items-center justify-center'>
                <div className='text-center'>
                    <div className='w-8 h-8 mx-auto mb-4 border-4 border-gray-300 rounded-full animate-spin border-t-primary'></div>
                    <p className='text-gray-500'>앨범 설정을 불러오는 중...</p>
                </div>
            </div>
        )
    }

    const sections = {
        ...(userRole === 'OWNER' && {
            sharing: {
                title: '공유하기',
                content: (
                    <div>
                        {isLinkLoading ? (
                            <div className='flex items-center justify-center py-8'>
                                <div className='w-6 h-6 border-2 border-gray-300 rounded-full animate-spin border-t-primary'></div>
                                <span className='ml-2 text-gray-500'>공유 링크 생성 중...</span>
                            </div>
                        ) : (
                            <AlbumShare sharingLink={sharingLink} />
                        )}
                    </div>
                ),
            },
        }),

        coworkerManager: {
            title: '공동 작업자',
            content: <CoworkerManager albumId={albumId} />,
        },
        ...(userRole === 'OWNER' && {
            deletion: {
                title: '앨범 삭제',
                content: (
                    <AlbumDeleteSection albumName={albumName} handleDelete={handleDelete} isDeleting={isDeleting} />
                ),
            },
        }),
    }

    return (
        <div className='max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-lg h-[400px]'>
            <div className='flex h-full'>
                {/* Sidebar for section selection */}
                <div className='w-1/3 border-r bg-gray-50'>
                    <div className='py-4'>
                        <h2 className='px-5 font-bold mb-7 text-md'>앨범 설정</h2>
                        <nav className='space-y-1'>
                            {Object.entries(sections).map(([key, section]) => (
                                <button
                                    key={key}
                                    className={`w-full text-center text-sm px-4 py-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                                        activeSection === key
                                            ? 'bg-primary text-white font-bold'
                                            : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                                    onClick={() => setActiveSection(key)}
                                    disabled={isDeleting}
                                >
                                    {section.title}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Content area */}
                <div className='w-3/4 overflow-auto'>{sections[activeSection as keyof typeof sections]?.content}</div>
            </div>
        </div>
    )
}

export default AlbumSetting
