import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthStore from "../stores/userStore";

const MyPage = () => {
	const userId = useParams();
	const navigate = useNavigate();

	// 사용자 정보 상태
	const [userInfo, setUserInfo] = useState({
		userId: null,
		profileImageURL: null,
	});

	// Zustand 스토어에서 함수 가져오기
	const getUserId = useAuthStore((state) => state.getUserId);
	const getUser = useAuthStore((state) => state.getUser);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	useEffect(() => {
		// 1. 먼저 스토어에서 인증 상태 확인
		if (isAuthenticated()) {
			const user = getUser();
			setUserInfo({
				userId: user.userId,
				profileImageURL: user.profileImageURL,
			});
		} else {
			// 2. 스토어에 없으면 세션 스토리지 확인
			const userIdFromSession = sessionStorage.getItem("userId");
			if (userIdFromSession) {
				setUserInfo({
					userId: userIdFromSession,
					profileImageURL: null,
				});
			}
		}
	}, []);

	return (
		<>
			<img src={userInfo.profileImageURL}></img>
			<div> {userId}</div>
		</>
	);
};

export default MyPage;
