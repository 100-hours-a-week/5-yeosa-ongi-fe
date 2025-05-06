import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import KakaoCallback from './api/auth/kakao/callback';
import './App.css';
import Album from './pages/Album';
import AlbumEditor from './pages/AlbumEditor';
import KakaoCallback from './pages/auth/KakaoCallback';
import Home from './pages/Home';
import Main from './pages/Main';

export default function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
         <Route path="/auth/login/kakao" element={<KakaoCallback />} />
         <Route path="/main" element={<Main />} />
         <Route path="/album-editor/:albumId" element={<AlbumEditor />} />
         <Route path="/album-editor/new" element={<AlbumEditor />} />
         <Route path="/album/:albumId" element={<Album />} />
      </Routes>
    </BrowserRouter>
  )
}