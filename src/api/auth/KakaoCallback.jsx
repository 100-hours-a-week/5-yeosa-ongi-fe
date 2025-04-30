// KakaoCallback.js - 리다이렉트 처리 컴포넌트
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const KakaoCallback = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		// URL에서 인가 코드 추출
		const code = new URLSearchParams(location.search).get("code");

		if (code) {
			// 백엔드에 인가 코드를 전송하여 토큰 발급 요청
			getKakaoToken(code);
		} else {
			setError("인가 코드를 찾을 수 없습니다.");
			setLoading(false);
		}
	}, [location]);

	const getKakaoToken = async (code) => {
		try {
			// 백엔드 서버에 인가 코드 전송
			const response = await axios.post("/api/auth/kakao", { code });

			// 로그인 성공 처리
			if (response.data.token) {
				// JWT 토큰이나 사용자 정보 저장
				localStorage.setItem("token", response.data.token);
				localStorage.setItem(
					"user",
					JSON.stringify(response.data.user)
				);

				// 메인 페이지로 리다이렉트
				navigate("/");
			} else {
				setError("로그인에 실패했습니다.");
			}
		} catch (error) {
			console.error("카카오 로그인 에러:", error);
			setError("로그인 처리 중 오류가 발생했습니다.");
		} finally {
			setLoading(false);
			navigate("/main"); //DEV (일단 에러 제끼고 메인 페이지로 이동)
		}
	};

	if (loading) {
		return <div>로그인 처리 중...</div>;
	}

	if (error) {
		return <div>오류: {error}</div>;
	}

	return null;
};

export default KakaoCallback;
