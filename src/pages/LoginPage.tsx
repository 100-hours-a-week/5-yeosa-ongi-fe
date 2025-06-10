import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

// Assets
import kakaoLoginButton from '@/assets/kakao_login_medium_narrow.png'
import ongiLogo from '@/assets/ongi_Logo.png'
import OnboardingUI from '@/components/Login/OnboardingUI'

interface AuthState {
    type: 'normal' | 'invite' | 'protected' | 'expired'
    redirectUrl?: string
    inviteCode?: string
    originalPath?: string
}

const Login = () => {
    const [searchParams] = useSearchParams()
    const [authState, setAuthState] = useState<AuthState>({ type: 'normal' })

    const KAKAO_CLIENT_ID: string = import.meta.env.VITE_KAKAO_REST_API_KEY
    const REDIRECT_URI: string = import.meta.env.VITE_KAKAO_REDIRECT_URI

    useEffect(() => {
        const state = analyzeAuthContext()
        setAuthState(state)
    }, [searchParams])

    const handleLogin = async (): Promise<void> => {
        try {
            const encodedState = btoa(JSON.stringify(authState))
            const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&state=${encodedState}`
            window.location.href = kakaoLoginUrl
        } catch (error) {
            console.error('로그인 처리 중 오류 : ', error)
        }
    }

    const analyzeAuthContext = (): AuthState => {
        const redirect = searchParams.get('redirect')
        const invite = searchParams.get('invite')
        const expired = searchParams.get('expired')
        const from = searchParams.get('from')

        // 초대 링크를 통한 접근
        if (invite) {
            return {
                type: 'invite',
                inviteCode: invite,
                redirectUrl: redirect || '/dashboard', // 기본 대시보드로
            }
        }

        // 세션 만료로 인한 로그인 (미래 확장용)
        if (expired === 'true') {
            return {
                type: 'expired',
                redirectUrl: from || redirect || '/dashboard',
                originalPath: from || undefined,
            }
        }

        // 보호된 페이지 접근 시도
        if (redirect) {
            return {
                type: 'protected',
                redirectUrl: redirect,
            }
        }

        // 일반 로그인
        return { type: 'normal' }
    }

    return (
        <div className='container flex flex-col items-center justify-center h-full p-4 px-4 '>
            <img className='w-12' src={ongiLogo}></img>

            {/* Onboarding Contents */}
            <div className='flex flex-col items-center justify-center px-4 mx-auto mt-10'>
                <OnboardingUI />
            </div>
            {/* OAuth */}
            <div className='mt-5'></div>
            <button onClick={handleLogin}>
                <img className='hover:cursor-pointer ' src={kakaoLoginButton}></img>
            </button>
        </div>
    )
}

export default Login
