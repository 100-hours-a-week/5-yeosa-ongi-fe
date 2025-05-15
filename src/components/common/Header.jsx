import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/userStore";
import defaultProfileImage from "/src/assets/default_user_imgae.png";
import bellIcon from "/src/assets/icons/bell_icon.png";
import ongiLogoFlat from "/src/assets/ongi_logo_flat.png";

const Header = () => {
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

	const handleProfileClick = () => {
		console.log(isAuthenticated());
		if (isAuthenticated()) {
			navigate(`/mypage`);
		} else {
			navigate("/login");
		}
	};

	return (
		<header className="h-[80px] px-4 flex items-center justify-between shadow-sm">
			<button onClick={() => navigate("/main")}>
				<img className="h-[52px]" src={ongiLogoFlat} alt="Logo" />
			</button>
			<div className="w-40"></div>
			<div className="flex items-center space-x-0">
				<button
					className="p-2 transition-colors rounded-full hover:bg-gray-100 min-w-6"
					aria-label="Notifications">
					<img
						className="h-6 md:h-7"
						src={bellIcon}
						alt="Notifications"
					/>
				</button>
				<button
					className="p-2 transition-colors rounded-full hover:bg-gray-100"
					aria-label="Profile"
					onClick={handleProfileClick}>
					<img
						src={userInfo.profileImageURL || defaultProfileImage}
						className="h-[40px] rounded-full"
						alt="User Profile"
					/>
				</button>
			</div>
		</header>
	);
};

export default Header;
