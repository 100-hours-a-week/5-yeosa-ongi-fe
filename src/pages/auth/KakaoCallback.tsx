import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

// Components
import MovingDotsLoader from '../../components/common/MovingDotsLoader'

// Hooks
import { useKakaoLogin } from '@/hooks/useAuth'

interface InviteData {
    type: 'invite'
    redirectUrl: string
}

const KakaoCallback = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const code = searchParams.get('code')
    const state = searchParams.get('state')

    // 카카오 로그인 hook 사용
    const kakaoLogin = useKakaoLogin({
        onSuccess: data => {
            console.log('로그인 성공:', data)

            // 초대 링크 처리
            if (state && state !== 'normal_login') {
                try {
                    const inviteData: InviteData = JSON.parse(atob(state))
                    if (inviteData.type === 'invite') {
                        const url = new URL(inviteData.redirectUrl)
                        const redirectPath = url.pathname + url.search
                        navigate(redirectPath, { replace: true })
                        return
                    }
                } catch (error) {
                    console.error('초대 처리 실패:', error)
                }
            }

            // 일반 로그인 - 메인 페이지로 이동
            navigate('/', { replace: true })
        },
        onError: error => {
            console.error('카카오 로그인 실패:', error)

            // 에러 코드별 처리
            let errorMessage = '로그인 중 오류가 발생했습니다.'

            switch (error.code) {
                case 'INVALID_REQUEST':
                    errorMessage = '인가 코드가 유효하지 않습니다.'
                    break
                case 'INTERNAL_SERVER_ERROR':
                    errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
                    break
                default:
                    errorMessage = error.message || '로그인 중 오류가 발생했습니다.'
            }

            // 에러 페이지로 이동하거나 토스트 메시지 표시
            alert(errorMessage) // 실제로는 toast 라이브러리 사용
            navigate('/login', { replace: true })
        },
    })

    useEffect(() => {
        if (code) {
            console.log('인증 코드 받음:', code)
            console.log('초대토큰:', state)

            // 카카오 로그인 실행
            kakaoLogin.mutate(code)
        } else {
            console.error('인가 코드를 찾을 수 없습니다.')
            alert('인가 코드를 찾을 수 없습니다.')
            navigate('/login', { replace: true })
        }
    }, [code, state]) // kakaoLogin.mutate는 의존성에서 제외 (안정적인 함수)

    // 로딩 상태
    if (kakaoLogin.isPending) {
        return <MovingDotsLoader />
    }

    // 에러 상태 (fallback)
    if (kakaoLogin.isError) {
        return (
            <div className='flex flex-col items-center justify-center min-h-screen'>
                <div className='text-center text-red-500'>
                    <h2 className='mb-2 text-xl font-semibold'>로그인 실패</h2>
                    <p className='text-gray-600'>{kakaoLogin.error?.message || '알 수 없는 오류가 발생했습니다.'}</p>
                    <button
                        onClick={() => navigate('/login', { replace: true })}
                        className='px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600'
                    >
                        로그인 페이지로 돌아가기
                    </button>
                </div>
            </div>
        )
    }

    return null
}

export default KakaoCallback
