// KakaoCallback.js - 리다이렉트 처리 컴포넌트
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
	const location = useLocation();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const user = useUserStore((state) => state);
	const setUserData = useUserStore((state) => state.setUserData);

	useEffect(() => {
		const code = new URLSearchParams(location.search).get("code");

		const getKakaoToken = async (code) => {
			try {
				//const response = await axios.post("/auth/login/kakao", { code });

				const response = { data: MockResponse };

				if (response.data.accessToken) {
					setUserData(response.data);
					console.log("로그인에 성공했습니다.", user);
					navigate("/main");
				} else {
					setError("로그인에 실패했습니다.");
				}
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
