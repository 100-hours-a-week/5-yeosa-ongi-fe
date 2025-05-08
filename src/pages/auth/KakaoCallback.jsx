// KakaoCallback.js - 리다이렉트 처리 컴포넌트
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { kakaoLogin } from "../../api/auth/login";
import useUserStore from "../../stores/userStore";

const KakaoCallback = () => {
	console.log("카카오 콜백");
	const location = useLocation();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const login = useUserStore((state) => state.login);

	useEffect(() => {
		const code = new URLSearchParams(location.search).get("code");
		console.log("인증 코드 받음:", code);

		const getKakaoToken = async (code) => {
			try {
				const response = await kakaoLogin(code);

				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}

				const result = await response.json();
				console.log(result.data);
				login(result.data);
				navigate("/main");
			} catch (error) {
				console.error("카카오 로그인 에러:", error);
				setError("로그인 처리 중 오류가 발생했습니다.");
			} finally {
				setLoading(false);
			}
		};

		if (code) {
			// 백엔드에 인가 코드를 전송하여 토큰 발급 요청
			getKakaoToken(code);
		} else {
			setError("인가 코드를 찾을 수 없습니다.");
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location]);

	if (loading) {
		return <div>로그인 처리 중...</div>;
	}

	if (error) {
		return <div className="self-auto">오류: {error}</div>;
	}

	return null;
};

export default KakaoCallback;
