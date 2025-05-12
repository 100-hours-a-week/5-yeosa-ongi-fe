import { useCallback, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import Album from './pages/Album';
import AlbumEditor from './pages/AlbumEditor';
import KakaoCallback from './pages/auth/KakaoCallback';
import Collection from './pages/Collection';
import Home from './pages/Home';
import Main from './pages/Main';
import useAuthStore from './stores/userStore';

// 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function AppRoutes() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated());  // 함수로 사용
  const refreshAccessToken = useAuthStore(state => state.refreshAccessToken);
  const logout = useAuthStore(state => state.logout);
  const getRefreshToken = useAuthStore(state => state.getRefreshToken);
  const getAccessToken = useAuthStore(state => state.getAccessToken);
  
  // 로그아웃 핸들러 - useCallback으로 감싸 안정성 개선
  const handleLogout = useCallback(() => {
    logout(() => {
      console.log("로그아웃 후 홈으로 이동");
      navigate('/');
    });
  }, [logout, navigate]);
  
  // 인증 초기화 효과
  useEffect(() => {
    const initializeAuth = async () => {
      // 인증 상태이고 리프레시 토큰이 있는 경우만 진행
      if(isAuthenticated && getRefreshToken()) {
        console.log("인증된 상태 확인, 리프레시 토큰 존재");
        
        // 액세스 토큰이 없는 경우 (메모리에서 사라진 경우)
        if (!getAccessToken()) {
          console.log("액세스 토큰 없음, 복구 시도");
          try {
            const success = await refreshAccessToken();
            if (!success) {
              console.error("토큰 복구 실패, 로그아웃 진행");
              handleLogout();
            } else {
              console.log("토큰 복구 성공");
            }
          } catch(error) {
            console.error("인증 초기화 오류:", error);
            handleLogout();
          }
        } else {
          console.log("액세스 토큰 유효함");
        }
      } else if (!isAuthenticated && !getRefreshToken()) {
        console.log("미인증 상태, 정상");
      } else {
        console.log("인증 상태와 토큰 불일치, 상태 정리");
        // 인증 상태와 토큰 보유 상태가 불일치하면 로그아웃
        handleLogout();
      }
    };
    
    initializeAuth();
  }, [isAuthenticated, getRefreshToken, getAccessToken, refreshAccessToken, handleLogout]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth/callback/kakao" element={<KakaoCallback />} />
      <Route 
        path="/main" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Main />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/album-editor/:albumId" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AlbumEditor />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/album-editor/new" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AlbumEditor />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/album/:albumId" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Album />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/album/:albumId/:collectionName" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Collection />
          </ProtectedRoute>
        } 
      />
      {/* 404 페이지 처리 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// 메인 App 컴포넌트
export default function App() {
  return (
    <div className="app-wrapper">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
}