import { useEffect, useState } from 'react'

import { useAlbumAccess, useCreateInviteLink } from '@/hooks/useAlbum'
import TextField from '../common/TextField'
import AlbumShare from './AlbumShare'
import CoworkerManager from './CoworkerManager'

interface AlbumSettingProps {
    albumId: string
    albumName: string
    handleDelete: () => void
    isDeleting?: boolean // 삭제 중 상태
}

const AlbumSetting = ({ albumId, albumName, handleDelete, isDeleting = false }: AlbumSettingProps) => {
    const [activeSection, setActiveSection] = useState('sharing')
    const [sharingLink, setSharingLink] = useState('')
    const [isValid, setIsValid] = useState(false)

    // ✅ React Query hooks 사용
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
            console.log('공유 링크 생성 성공')
        },
        onError: error => {
            console.error('공유 링크 생성 실패:', error)
            // 에러 토스트 등 처리 가능
        },
    })

    const userRole = albumAccess?.role

    const handleOnChange = (newValue: string) => {
        const inputValue = newValue
        const expectedValue = albumName

        setIsValid(inputValue === expectedValue)
    }

    // ✅ 공유 링크 자동 생성 (OWNER인 경우에만)
    useEffect(() => {
        if (userRole === 'OWNER' && !sharingLink && !createInviteLinkMutation.isPending) {
            createInviteLinkMutation.mutate(albumId)
        }
    }, [albumId, userRole, sharingLink, createInviteLinkMutation])

    // ✅ 로딩 상태 통합
    const isMainLoading = isAccessLoading
    const isLinkLoading = createInviteLinkMutation.isPending

    // ✅ 에러 상태 처리
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

    // ✅ 메인 로딩 상태
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
                    <div className='relative flex flex-col w-full h-full max-w-md mx-auto bg-white'>
                        <div className='p-5 border-b'>
                            <h3 className='text-lg font-medium text-gray-800'>앨범 삭제</h3>
                        </div>

                        <div className='flex-grow p-5'>
                            <TextField
                                placeholder={albumName || '앨범 이름을 입력해주세요.'}
                                maxLength={12}
                                label={`삭제할 앨범 : ${albumName}`}
                                onChange={handleOnChange}
                                disabled={isDeleting}
                            />

                            <p className='flex items-center mt-2 text-xs text-red-600'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='w-4 h-4 mr-1'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                                    />
                                </svg>
                                앨범을 삭제하시려면 앨범 명을 정확히 입력해 주세요.
                            </p>
                        </div>

                        <div className='flex justify-end p-4 space-x-3 border-t'>
                            <button
                                className='px-4 py-2 font-medium text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'
                                disabled={isDeleting}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={!isValid || isDeleting}
                                className={`px-4 py-2 font-medium text-white transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center space-x-2 ${
                                    isValid && !isDeleting
                                        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 cursor-pointer'
                                        : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {isDeleting ? (
                                    <>
                                        <div className='w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent'></div>
                                        <span>삭제 중...</span>
                                    </>
                                ) : (
                                    <span>삭제</span>
                                )}
                            </button>
                        </div>
                    </div>
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
                                    disabled={isDeleting} // 삭제 중일 때 탭 변경 비활성화
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
