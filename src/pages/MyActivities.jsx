import { useNavigate } from "react-router-dom";

const MyActivities = () => {
	const navigate = useNavigate();

	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
			<div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-md">
				<div onClick={() => navigate(-1)} className="mb-4 text-5xl">
					🚧
				</div>
				<p className="text-gray-600">
					내 활동 페이지는 현재 개발 중입니다.
				</p>
			</div>
		</div>
	);
};

export default MyActivities;
