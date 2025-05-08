const Header = () => {
	return (
		<header className="h-[80px] px-4 flex items-center justify-between shadow-sm">
			<img
				className="h-[52px] "
				src="/src/assets/ongi_logo_flat.png"></img>
			<div className="w-40"></div>
			<div className="flex items-center space-x-0">
				<button
					className="p-2 transition-colors rounded-full hover:bg-gray-100 min-w-6"
					aria-label="Notifications">
					<img
						className="h-6 md:h-7"
						src="/src/assets/icons/bell_icon.png"
						alt="Notifications"></img>
				</button>
				<button
					className="p-2 transition-colors rounded-full hover:bg-gray-100"
					aria-label="Notifications">
					<img
						src="/src/assets/default_user_imgae.png"
						className="h-[40px] rounded-full"
						alt="User Profile"></img>
				</button>
			</div>
		</header>
	);
};

export default Header;
