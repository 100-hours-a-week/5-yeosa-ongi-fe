import { useNavigate, useSearchParams } from 'react-router-dom'
import { getAlbumAccess } from '../api/albums/albumAccessApi'

import { comfirmInvite } from '../api/albums/inviteUser'
import useAuthStore from '../stores/userStore'

const Invite = () => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const isAuthenticated = useAuthStore(state => state.isAuthenticated())
    const navigate = useNavigate()

    const handleLogin = () => {
        // 현재 URL을 로그인 후 리다이렉트 URL로 설정
        const currentUrl = window.location.href
        const loginUrl = `/?redirect=${encodeURIComponent(currentUrl)}`
        window.location.href = loginUrl
    }

    const handleClick = () => {
        console.log(isAuthenticated)
        if (!isAuthenticated) {
            console.log('로그인 안된 초대된 사람')
            handleLogin()
            return
        }

        const proccessInvite = async () => {
            const response = await comfirmInvite(token)

            const albumId = response.data.albumId
            const result = await getAlbumAccess(albumId)
            if (result.data.role) {
                navigate(`/album/${albumId}`)
            }
        }
        proccessInvite()
    }

    return (
        <>
            <div className='fixed bottom-0 left-0 right-0 flex justify-center w-full mb-4'>
                <div className='w-full max-w-[528px] px-4 '>
                    <button
                        className={`
          h-14 w-full
          text-lg font-bold z-50
          rounded-xl
          shadow-lg
		  bg-primary
        `}
                        onClick={handleClick}
                    >
                        초대 수락
                    </button>
                </div>
            </div>
        </>
    )
}

export default Invite
