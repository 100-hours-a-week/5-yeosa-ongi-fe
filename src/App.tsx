import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import KakaoCallback from './api/auth/kakao/callback';
import { useEffect } from 'react';
import './App.css';
import Album from './pages/Album';
import AlbumEditor from './pages/AlbumEditor';
import KakaoCallback from './pages/auth/KakaoCallback';
import Home from './pages/Home';
import Main from './pages/Main';
import useAuthStore from './stores/userStore';

export default function App() {

  useEffect(() => {
    const initializeAuth = async () => {
      const authStore = useAuthStore.getState();

      
      if(authStore.isAuthenticated && authStore.getRefreshToken()){
        if (!authStore.getAccessToken()) {
          console.log("페이지 새로고침 감지: 액세스 토큰 복구 시도");
          await authStore.refreshAccessToken();
        }
      }
    }
    initializeAuth();
  }, []);


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/callback/kakao" element={<KakaoCallback />} />
         <Route path="/auth/login/kakao" element={<KakaoCallback />} />
         <Route path="/main" element={<Main />} />
         <Route path="/album-editor/:albumId" element={<AlbumEditor />} />
         <Route path="/album-editor/new" element={<AlbumEditor />} />
         <Route path="/album/:albumId" element={<Album />} />
      </Routes>
    </BrowserRouter>
  )
}