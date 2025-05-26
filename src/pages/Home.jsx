import { useSearchParams } from "react-router-dom";
import kakaoLoginButton from "../assets/kakao_login_medium_narrow.png";
import ongiLogo from "../assets/ongi_Logo.png";

export default function Login() {
	const [searchParams] = useSearchParams();
	const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_REST_API_KEY;
	const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;
	const handleLogin = async () => {
		console.log(searchParams);
		const redirectUrl = searchParams.get("redirect");
		console.log(redirectUrl);
		let state = "normal_login";
		if (redirectUrl) {
			state = btoa(
				JSON.stringify({
					type: "invite",
					redirectUrl,
				})
			);
		}
		const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&state=${state}`;
		window.location.href = kakaoLoginUrl;
		//const response = await kakaoLogin();
		// console.log(response);
	};
	console.log("a", KAKAO_CLIENT_ID);
	return (
		<div className="container flex flex-col items-center justify-center min-h-screen px-4 mx-auto">
			<img className="w-[120px]" src={ongiLogo}></img>
			<div className="mt-[100px]">카카오톡으로 간편 로그인</div>
			<button onClick={handleLogin}>
				<img
					className="hover:cursor-pointer "
					src={kakaoLoginButton}></img>
			</button>
		</div>
	);
}
