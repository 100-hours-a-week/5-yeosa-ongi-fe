const Header = () => {
	return (
		<div className="h-[80px] relative">
			<img
				className="absolute h-[52px] left-2 top-1"
				src="src/assets/ongi_logo_flat.png"></img>
			<div></div>
			<img
				className="absolute h-[32px] right-16 top-4"
				src="src/assets/icons/bell_icon.png"></img>
			<img
				src="src/assets/default_user_imgae.png"
				className="h-[40px] right-3 absolute top-3"></img>
		</div>
	);
};

export default Header;
