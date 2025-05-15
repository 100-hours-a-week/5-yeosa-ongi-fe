import defaultProfileImage from "@/assets/default_user_imgae.png";
import icon_pencil from "@/assets/icons/icon_pencil.png";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateUserInfo } from "../api/user/userInfoUpdate";
import Header from "../components/common/Header";
import useAuthStore from "../stores/userStore";

const MyPage = () => {
	const navigate = useNavigate();

	// 사용자 정보 상태
	const [userInfo, setUserInfo] = useState({
		userId: null,
		profileImageURL: null,
		nickname: "사용자",
	});

	const [isLoading, setIsLoading] = useState(true);
	const [isEditing, setIsEditing] = useState(false);
	const [nickname, setNickname] = useState("");

	const getUserId = useAuthStore((state) => state.getUserId);
	const getUser = useAuthStore((state) => state.getUser);
	const updateUser = useAuthStore((state) => state.updateUser);
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
					setNickname(userInfo.nickname);
				}
			} else {
				// 2. 스토어에 없으면 세션 스토리지 확인
				const userInfoFromSession =
					sessionStorage.getItem("auth-storage");
				if (userInfoFromSession) {
					setUserInfo({
						userId: userInfoFromSession.user.userId,
						profileImageURL: userInfoFromSession.profileImageURL,
						nickname: userInfoFromSession.user.nickname,
					});
				} else {
					navigate("/login", { replace: true });
					return;
				}
			}
		} catch (error) {
			console.error("사용자 정보 로딩 오류:", error);
		} finally {
			setIsLoading(false);
		}
	}, [navigate, isAuthenticated, getUser, getUserId]);

	const handleEditClick = () => {
		setIsEditing(true);
	};

	// 닉네임 저장 핸들러
	const handleSave = async () => {
		// 입력값 검증
		if (!nickname.trim()) {
			alert("닉네임을 입력해주세요.");
			return;
		}

		try {
			const userInfoBody = {
				nickname: nickname,
				profileImageURL: userInfo.profileImageURL,
			};
			const response = await updateUserInfo(
				userInfo.userId,
				userInfoBody
			);
			console.log(response);

			// 상태 업데이트
			const updatedUserInfo = {
				...userInfo,
				nickname: nickname.trim(),
			};

			setUserInfo(updatedUserInfo);

			if (updateUser) {
				updateUser(updatedUserInfo);
			}
			setIsEditing(false);
			console.log("닉네임이 성공적으로 업데이트되었습니다:", nickname);
		} catch (error) {
			console.error("닉네임 업데이트 오류:", error);
			alert("닉네임 업데이트에 실패했습니다. 다시 시도해주세요.");
		}
	};

	// 닉네임 변경 핸들러
	const handleChange = (e) => {
		setNickname(e.target.value);
	};

	// 엔터 키 처리
	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			handleSave();
		}
	};

	return (
		<>
			<Header />
			<div className="p-4 mt-20">
				<div className="flex flex-col items-center">
					<img
						src={userInfo.profileImageURL || defaultProfileImage}
						alt={`${userInfo.nickname || "사용자"}의 프로필 이미지`}
						className="w-24 h-24 mb-4 rounded-full"
					/>
					<div className="relative flex items-center justify-center">
						{isEditing ? (
							<div className="flex items-center">
								<input
									type="text"
									value={nickname}
									onChange={handleChange}
									onKeyDown={handleKeyDown}
									className="px-2 py-1 text-xl font-bold text-center border border-gray-300 rounded"
									autoFocus
								/>
								<button
									onClick={handleSave}
									className="px-2 py-1 ml-2 text-sm text-white bg-blue-500 rounded">
									저장
								</button>
							</div>
						) : (
							<>
								<h2 className="text-xl font-bold text-center">
									{nickname}
								</h2>
								<button
									className="absolute p-1 transform -translate-y-1/2 -right-8 top-1/2"
									onClick={handleEditClick}
									aria-label="프로필 편집">
									<img
										className="w-4 h-4"
										src={icon_pencil}
										alt="편집"
									/>
								</button>
							</>
						)}
					</div>
				</div>

				<div className="max-w-md mx-auto mt-10">
					{/* 메뉴 아이템 */}
					<div className="rounded-lg shadow-sm bg-gray-50">
						<button
							className="flex items-center justify-between w-full px-6 py-4 text-gray-700 hover:bg-gray-100"
							onClick={() => navigate("/my-activities")}>
							<div className="flex items-center">
								<svg
									className="w-5 h-5 mr-3 text-gray-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
								</svg>
								<span className="text-base">내 활동</span>
							</div>
							<svg
								className="w-5 h-5 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 5l7 7-7 7"></path>
							</svg>
						</button>

						<button
							className="flex items-center justify-between w-full px-6 py-4 text-gray-700 hover:bg-gray-100"
							onClick={() => {
								window.open(
									"https://docs.google.com/forms/d/e/1FAIpQLSeoPcuQrShJo_cuy4lE2oW-V2P2gV9OHQhUrC9_nwlZE4QSaw/viewform",
									"_blank"
								);
							}}>
							<div className="flex items-center">
								<svg
									className="w-5 h-5 mr-3 text-gray-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
								</svg>
								<span className="text-base">문의하기</span>
							</div>
							<svg
								className="w-5 h-5 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 5l7 7-7 7"></path>
							</svg>
						</button>

						<button
							className="flex items-center justify-between w-full px-6 py-4 text-gray-700 hover:bg-gray-100"
							onClick={() => {
								useAuthStore.getState().logout();
								navigate("/login");
							}}>
							<div className="flex items-center">
								<svg
									className="w-5 h-5 mr-3 text-gray-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
								</svg>
								<span className="text-base">로그아웃</span>
							</div>
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default MyPage;
