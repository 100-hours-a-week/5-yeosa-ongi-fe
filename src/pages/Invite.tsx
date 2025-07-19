import { useNavigate, useSearchParams } from 'react-router-dom'

import { useAlbumAccess } from '@/queries/album'
import { useConfirmInvite } from '@/queries/album/mutations'
import useAuthStore from '../stores/userStore'

const Invite: React.FC = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token')

    const isAuthenticated = useAuthStore(state => state.isAuthenticated())

    // 초대 확인 훅
    const confirmInvite = useConfirmInvite({
        onSuccess: data => {
            console.log('초대 확인 성공:', data)
            const albumId = data?.albumId
            if (albumId) {
                navigate(`/album/${albumId}`)
            }
        },
        onError: error => {
            console.error('초대 확인 실패:', error.message)
            // 에러 처리 (토스트 메시지 등)
        },
    })

    // 앨범 접근 권한 확인 (초대 확인 후에만)
    const {
        data: albumAccess,
        isLoading: isAccessLoading,
        error: accessError,
    } = useAlbumAccess('', {
        enabled: false, // 초기에는 비활성화
    })

    const handleLogin = (): void => {
        // 현재 URL을 로그인 후 리다이렉트 URL로 설정
        const currentUrl = window.location.href
        const loginUrl = `/login/?redirect=${encodeURIComponent(currentUrl)}&invite=${token}`
        navigate(loginUrl)
    }

    const handleClick = (): void => {
        console.log('인증 상태:', isAuthenticated)

        if (!isAuthenticated) {
            console.log('로그인 안된 초대된 사람')
            handleLogin()
            return
        }

        if (!token) {
            console.error('초대 토큰이 없습니다.')
            return
        }

        // 현재 시스템의 훅을 사용하여 초대 확인
        confirmInvite.mutate(token)
    }

    return (
        <>
            <div className='fixed bottom-0 left-0 right-0 flex justify-center w-full mb-4'>
                <div className='w-full max-w-[528px] px-4'>
                    <button
                        className={`
                            h-14 w-full
                            text-lg font-bold z-50
                            rounded-xl
                            shadow-lg
                            bg-primary
                            ${confirmInvite.isPending ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        onClick={handleClick}
                        disabled={confirmInvite.isPending}
                    >
                        {confirmInvite.isPending ? '처리 중...' : '초대 수락'}
                    </button>
                </div>
            </div>
        </>
    )
}

export default Invite
