import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, ReactNode, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import { ToastProvider } from './queries/contexts/ToastContext'
import Background from './shared/components/Background'
import MovingDotsLoader from './shared/components/MovingDotsLoader'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Main from './domains/album/components/home/Main'
import useAuthStore from './domains/auth/stores/authStore'
import { setupAlbumMutationDefaults } from './queries/config/mutation-defaults'

const Login = lazy(() => import('./domains/auth/login/LoginPage'))
const KakaoCallback = lazy(() => import('./domains/auth/login/KakaoCallback'))
const AlbumEditor = lazy(() => import('./domains/editor/components/AlbumEditor'))
const Album = lazy(() => import('./domains/album/components/detail/Album'))
const Collection = lazy(() => import('./domains/album/components/collection/Collection'))
const MyPage = lazy(() => import('./domains/MyPage/MyPage'))
const MyActivities = lazy(() => import('./domains/MyPage/MyActivities'))
const Invite = lazy(() => import('./domains/auth/login/Invite'))

interface ProtectedRouteProps {
    children: ReactNode
    isAuthenticated: boolean
}

// 로딩 컴포넌트
const PageLoader = () => (
    <div className='flex items-center justify-center min-h-screen'>
        <MovingDotsLoader />
    </div>
)

// 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children, isAuthenticated }: ProtectedRouteProps) => {
    return isAuthenticated ? children : <Navigate to='/login' replace />
}

const queryClient = new QueryClient()
function AppRoutes() {
    const navigate = useNavigate()
    const isAuthenticated = useAuthStore(state => state.isAuthenticated)
    const refreshToken = useAuthStore(state => state.refreshToken)
    const logout = useAuthStore(state => state.logout)

    useEffect(() => {
        // 앱 시작 시 mutation 기본값 설정
        setupAlbumMutationDefaults(queryClient)
        console.log('🚀 Album mutation defaults 설정 완료')
    }, [queryClient])

    useEffect(() => {
        // 인증 상태와 토큰 상태 불일치 시에만 정리
        if (isAuthenticated && !refreshToken) {
            console.log('인증 상태 불일치, 로그아웃')
            logout()
            navigate('/login')
        }
    }, [isAuthenticated, refreshToken, logout, navigate])

    return (
        <ToastProvider>
            <div className='fixed inset-0 -z-10'>
                <Background />
            </div>
            <QueryClientProvider client={queryClient}>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path='/login' element={<Login />} />
                        <Route path='/auth/callback/kakao' element={<KakaoCallback />} />
                        <Route
                            path='/'
                            element={
                                <ProtectedRoute isAuthenticated={isAuthenticated}>
                                    <Main />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path='/album-editor/:albumId'
                            element={
                                <ProtectedRoute isAuthenticated={isAuthenticated}>
                                    <AlbumEditor />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path='/album-editor/new'
                            element={
                                <ProtectedRoute isAuthenticated={isAuthenticated}>
                                    <AlbumEditor />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path='/album/:albumId'
                            element={
                                <ProtectedRoute isAuthenticated={isAuthenticated}>
                                    <Album />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path='/album/:albumId/:collectionName'
                            element={
                                <ProtectedRoute isAuthenticated={isAuthenticated}>
                                    <Collection />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path='/mypage'
                            element={
                                <ProtectedRoute isAuthenticated={isAuthenticated}>
                                    <MyPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path='/my-activities'
                            element={
                                <ProtectedRoute isAuthenticated={isAuthenticated}>
                                    <MyActivities />
                                </ProtectedRoute>
                            }
                        />
                        <Route path='/invite' element={<Invite />} />
                        {/* <Route path='/test' element={<TestComponent />} /> */}
                        {/* 404 페이지 처리 */}
                        <Route path='*' element={<Navigate to='/' replace />} />
                    </Routes>
                </Suspense>
                {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
            </QueryClientProvider>
        </ToastProvider>
    )
}

// 메인 App 컴포넌트
export default function App() {
    return (
        <div className='app-wrapper'>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </div>
    )
}
