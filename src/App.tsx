import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import KakaoCallback from './api/auth/kakao/callback';
import axios from 'axios';
import { useEffect } from 'react';
import './App.css';
import Album from './pages/Album';
import AlbumEditor from './pages/AlbumEditor';
import KakaoCallback from './pages/auth/KakaoCallback';
import Home from './pages/Home';
import Main from './pages/Main';
import useAuthStore from './stores/userStore';

export default function App() {
  const { getAccessToken, getRefreshToken, login, logout } = useAuthStore();

  useEffect(() => {
    const trySilentLogin = async () => {
      const accessToken = getAccessToken();
      //const refreshToken = getRefreshToken();
      let refreshToken;
      try {
        const storageData = sessionStorage.getItem('auth-storage');
        if (storageData) {
          console.log(storageData);
          const authData = JSON.parse(storageData);
          refreshToken = authData.state.tokens.refreshToken;
          console.log(refreshToken);
        } else {
          refreshToken = null;
        }
      } catch (e) {
        console.error("세션 스토리지 읽기 오류:", e);
        refreshToken = null;
      }
      
      console.log("세션 스토리지에서 직접 읽은 리프레시 토큰:", refreshToken);


      if (accessToken) {
        console.log("이미 로그인 되어 있음", accessToken);
        return;
      }
      
      if (!refreshToken) {
        console.log("로그인 정보 없음");
        return;
      }

      try {
        const res = await axios.post("/api/auth/refresh", {
          refreshToken,
        });

        console.log(res);
        const { accessToken, refreshToken: newRefreshToken, refreshTokenExpiresIn, user } = res.data;

        login({
          refreshToken: newRefreshToken,
          refreshTokenExpiresIn,
          user,
        });
      } catch (err) {
        // refreshToken도 만료되었으면 로그아웃
        logout();
      }
    };
    trySilentLogin();
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