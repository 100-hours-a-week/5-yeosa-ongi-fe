import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'
import OptimizedImage from './OptimizedImage'
import defaultProfileImage from '/src/assets/default_user_imgae.png'
import ongiLogoFlat from '/src/assets/ongi_logo_flat.webp'

const Header = ({ showButtons = true }) => {
    const navigate = useNavigate()

    // 사용자 정보 상태
    const [userInfo, setUserInfo] = useState<{ userId: string; profileImageURL: string }>({
        userId: '',
        profileImageURL: '',
    })

    // Zustand 스토어에서 함수 가져오기

    const user = useAuthStore(state => state.user)
    const isAuthenticated = useAuthStore(state => state.isAuthenticated)

    useEffect(() => {
        // 1. 먼저 스토어에서 인증 상태 확인
        if (isAuthenticated && user) {
            setUserInfo({
                userId: user.userId,
                profileImageURL: user.profileImageURL,
            })
        } else {
            // 2. 스토어에 없으면 세션 스토리지 확인
            const userIdFromSession = sessionStorage.getItem('userId')
            if (userIdFromSession) {
                setUserInfo({
                    userId: userIdFromSession,
                    profileImageURL: '',
                })
            }
        }
    }, [])

    const handleProfileClick = () => {
        if (isAuthenticated) {
            navigate(`/mypage`)
        } else {
            navigate('/login')
        }
    }

    return (
        <header className='flex items-center justify-between px-4 shadow-sm h-14 '>
            <button onClick={() => navigate('/')}>
                <img src={ongiLogoFlat} alt='logo' className='h-8' />
            </button>
            <div className='w-40'></div>
            {showButtons && (
                <div className='flex items-center space-x-0'>
                    <button
                        className='p-1 transition-colors rounded-full size-8 hover:bg-gray-100'
                        aria-label='Profile'
                        onClick={handleProfileClick}
                    >
                        <OptimizedImage
                            alt='userProfileImage'
                            src={userInfo.profileImageURL || defaultProfileImage}
                            className='rounded-full size-full'
                        />
                    </button>
                </div>
            )}
        </header>
    )
}

export default Header
