//Assets
import { useNavigate } from "react-router-dom";
import defaultProfileImage from "/src/assets/default_user_imgae.png";
import bellIcon from "/src/assets/icons/bell_icon.png";
import ongiLogoFlat from "/src/assets/ongi_logo_flat.png";

const Header = () => {
	const navigate = useNavigate();
	return (
		<header className="h-[80px] px-4 flex items-center justify-between shadow-sm">
			<button onClick={() => navigate("/main")}>
				<img className="h-[52px] " src={ongiLogoFlat}></img>
			</button>
			<div className="w-40"></div>
			<div className="flex items-center space-x-0">
				<button
					className="p-2 transition-colors rounded-full hover:bg-gray-100 min-w-6"
					aria-label="Notifications">
					<img
						className="h-6 md:h-7"
						src={bellIcon}
						alt="Notifications"></img>
				</button>
				<button
					className="p-2 transition-colors rounded-full hover:bg-gray-100"
					aria-label="Notifications">
					<img
						src={defaultProfileImage}
						className="h-[40px] rounded-full"
						alt="User Profile"></img>
				</button>
			</div>
		</header>
	);
};

export default Header;
