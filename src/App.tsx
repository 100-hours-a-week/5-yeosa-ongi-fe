import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, ReactNode, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import Background from './components/common/Background'
import MovingDotsLoader from './components/common/MovingDotsLoader'
import { ToastProvider } from './contexts/ToastContext'
import Main from './pages/Main'
import useAuthStore from './stores/authStore'

const Login = lazy(() => import('./pages/LoginPage'))
const KakaoCallback = lazy(() => import('./pages/auth/KakaoCallback'))
const AlbumEditor = lazy(() => import('./pages/AlbumEditor'))
const Album = lazy(() => import('./pages/Album'))
const Collection = lazy(() => import('./pages/Collection'))
const MyPage = lazy(() => import('./pages/MyPage'))
const MyActivities = lazy(() => import('./pages/MyActivities'))
const Invite = lazy(() => import('./pages/Invite'))

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

function AppRoutes() {
    const navigate = useNavigate()
    const isAuthenticated = useAuthStore(state => state.isAuthenticated)
    const refreshToken = useAuthStore(state => state.refreshToken)
    const logout = useAuthStore(state => state.logout)
    const queryClient = new QueryClient()

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
