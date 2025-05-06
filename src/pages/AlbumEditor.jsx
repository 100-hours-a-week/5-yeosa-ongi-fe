import { useNavigate } from "react-router-dom";
import Grid from "../components/Grid";
import Image from "../components/Imgae";
import Input from "../components/Input";

const AlbumEditor = () => {
	const mock = [
		{ ElementType: Input, element: 0 },
		{ ElementType: Image, element: 1 },
	];
	const navigate = useNavigate();
	const onClickBtn = () => {
		navigate(-1); // 바로 이전 페이지로 이동, '/main' 등 직접 지정도 당연히 가능
	};
	return (
		<>
			<div className="h-[52px] relative flex items-center justify-center">
				<img
					className="absolute h-1/2 left-4 top-1/4"
					src="../src/assets/icons/Arrow Left.png"
					onClick={onClickBtn}
				/>
				<div className="text-center">앨범 생성</div>
			</div>
			<div className="flex flex-col w-full mt-4 mb-6">
				<div className="flex items-center pb-2 mx-4 border-b border-gray-300">
					<div className="w-16 mx-4 text-gray"> 제목</div>
					<input
						className="w-full text-lg focus:outline-none"
						value="이름 없는 앨범"
						onChange={(e) => {
							/* 값 변경 처리 */
						}}
					/>
				</div>
			</div>

			<div>
				<div className="m-2 mt-8"> 현재 00장 업로드 중</div>
				<Grid items={mock} />
			</div>
		</>
	);
};

export default AlbumEditor;
