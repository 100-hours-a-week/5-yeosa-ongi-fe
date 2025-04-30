import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import KakaoCallback from './api/auth/kakao/callback';
import './App.css';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';

export default function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage/>} />
        {/* <Route path="/api/auth/kakao/callback" element={<KakaoCallback />} /> */}
      </Routes>
    </BrowserRouter>
  )
}


