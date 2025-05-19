// KakaoCallback.js - 리다이렉트 처리 컴포넌트
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { kakaoLogin } from "../../api/auth/login";
import useUserStore from "../../stores/userStore";

const KakaoCallback = () => {
	console.log("카카오 콜백");
=======
import { API_BASE_URL } from "../../api/config";
import useUserStore from "../../stores/store";

const MockResponse = {
	code: "USER_ALREADY_REGISTERED",
	message: "로그인을 완료했습니다.",
	accessToken: "access_token_value",
	refreshTokenExpiresIn: 1209600,
	refreshToken: "refresh_token_value",
	user: {
		userId: 1,
		nickname: "gray_123!",
		profileImageURL: "https://ongi.s3.ap-northeast-2.amazonaws.com/1.jpg",
		cacheTtl: 300,
	},
};

const KakaoCallback = () => {
>>>>>>> dev
	const location = useLocation();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

<<<<<<< HEAD
	const login = useUserStore((state) => state.login);
=======
	const user = useUserStore((state) => state);
	const setUserData = useUserStore((state) => state.setUserData);
>>>>>>> dev

	useEffect(() => {
		const code = new URLSearchParams(location.search).get("code");
		console.log("인증 코드 받음:", code);

		const getKakaoToken = async (code) => {
			try {
<<<<<<< HEAD
				const response = await kakaoLogin(code);

				if (response) {
					console.log("로그인 과정 완료");
					navigate("/main");
				} else {
					console.log("로그인 실패");
=======
				const response = await fetch(
					`${API_BASE_URL}/api/auth/login/kakao?code=${code}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							// CORS 요청에 유용한 헤더들
							Accept: "application/json",
						},
						mode: "cors", // CORS 모드 명시
					}
				);
				console.log(response);
				// const response = { data: MockResponse };

				if (response.data.accessToken) {
					setUserData(response.data);
					console.log("로그인에 성공했습니다.", user);
					// navigate("/main");
				} else {
					setError("로그인에 실패했습니다.");
>>>>>>> dev
				}
			} catch (error) {
				console.error("카카오 로그인 에러:", error);
				setError("로그인 처리 중 오류가 발생했습니다.");
			} finally {
				setLoading(false);
<<<<<<< HEAD
=======
				navigate("/main");
>>>>>>> dev
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
