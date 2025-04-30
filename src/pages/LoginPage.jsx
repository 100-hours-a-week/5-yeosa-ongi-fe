export default function LoginPage() {
	const KAKAO_CLIENT_ID = import.meta.env.localNEXT_PUBLIC_KAKAO_REST_API_KEY;
	const REDIRECT_URI = "http://localhost:3000/api/auth/kakao/callback";
	const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;

	return (
		<div className="container mx-auto px-4 flex flex-col justify-center items-center min-h-screen">
			<img className="w-[120px]" src="src/assets/ongi_Logo.png"></img>
			<div className="mt-[100px]">카카오톡으로 간편 로그인</div>
			<a href={kakaoLoginUrl}>
				<img
					className="hover:cursor-pointer "
					src="src/assets/kakao_login_medium_narrow.png"></img>
			</a>
		</div>
	);
}
