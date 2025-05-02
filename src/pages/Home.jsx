export default function Home() {
	const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_REST_API_KEY;
	const REDIRECT_URI = "http://localhost:5173/auth/login/kakao";
	const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
	const handleLogin = async () => {
		window.location.href = kakaoLoginUrl;
		// const response = await kakaoLogin();
	};
	console.log("a", KAKAO_CLIENT_ID);
	return (
		<div className="container flex flex-col items-center justify-center min-h-screen px-4 mx-auto">
			<img className="w-[120px]" src="src/assets/ongi_Logo.png"></img>
			<div className="mt-[100px]">카카오톡으로 간편 로그인</div>
			<button onClick={handleLogin}>
				<img
					className="hover:cursor-pointer "
					src="src/assets/kakao_login_medium_narrow.png"></img>
			</button>
		</div>
	);
}
