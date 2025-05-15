import defaultProfileImage from "@/assets/default_user_imgae.png";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthStore from "../stores/userStore";
const MyPage = () => {
	const { userId: urlUserId } = useParams();
	const navigate = useNavigate();

	// 사용자 정보 상태
	const [userInfo, setUserInfo] = useState({
		userId: null,
		profileImageURL: null,
	});

	const [isLoading, setIsLoading] = useState(true);
	// Zustand 스토어에서 함수 가져오기
	const getUserId = useAuthStore((state) => state.getUserId);
	const getUser = useAuthStore((state) => state.getUser);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	useEffect(() => {
		setIsLoading(true);
		try {
			// 1. 먼저 스토어에서 인증 상태 확인
			if (isAuthenticated()) {
				const user = getUser();
				if (user && user.userId) {
					setUserInfo({
						userId: user.userId,
						profileImageURL: user.profileImageURL || null,
						nickname: user.nickname || "사용자",
					});
				}
			} else {
				// 2. 스토어에 없으면 세션 스토리지 확인
				const userIdFromSession = sessionStorage.getItem("userId");
				if (userIdFromSession) {
					setUserInfo({
						userId: userIdFromSession,
						profileImageURL: null,
						nickname: "사용자",
					});
				} else {
					// 로그인되어 있지 않으면 로그인 페이지로 리다이렉트
					navigate("/login", { replace: true });
					return;
				}
			}
		} catch (error) {
			console.error("사용자 정보 로딩 오류:", error);
		} finally {
			setIsLoading(false);
		}
	}, [urlUserId, navigate, isAuthenticated, getUser, getUserId]);

	return (
		<div className="p-4">
			<div className="flex flex-col items-center">
				<img
					src={userInfo.profileImageURL || defaultProfileImage}
					alt={`${userInfo.nickname || "사용자"}의 프로필 이미지`}
					className="w-24 h-24 mb-4 rounded-full"
				/>
				<h2 className="text-xl font-bold">
					{userInfo.nickname || "사용자"}
				</h2>
				<p className="text-gray-600">사용자 ID: {urlUserId}</p>

				{/* 현재 사용자와 프로필 사용자가 같은 경우에만 프로필 편집 버튼 표시 */}

				<button
					className="px-4 py-2 mt-4 text-white bg-blue-500 rounded-md"
					onClick={() => navigate("/edit-profile")}>
					프로필 편집
				</button>
			</div>

			{/* 추가 프로필 정보 */}
			<div className="mt-8">
				{/* 여기에 사용자 활동, 게시물 등을 표시할 수 있습니다 */}
			</div>
		</div>
	);
};

export default MyPage;
