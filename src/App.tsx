import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import KakaoCallback from './api/auth/kakao/callback';
import KakaoCallback from './api/auth/KakaoCallback';
import './App.css';
import Home from './pages/Home';
import Main from './pages/Main';

export default function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
         <Route path="/api/auth/KakaoCallback" element={<KakaoCallback />} />
         <Route path="/main" element={<Main />} />
      </Routes>
    </BrowserRouter>
  )
}