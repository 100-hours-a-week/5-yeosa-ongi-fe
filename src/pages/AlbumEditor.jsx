import Grid from "../components/Grid";
import Image from "../components/Imgae";
import Input from "../components/Input";

const AlbumEditor = () => {
	const mock = [
		{ ElementType: Input, element: 0 },
		{ ElementType: Image, element: 1 },
	];

	return (
		<>
			<div className="h-[48px] relative flex items-center justify-center">
				<img
					className="absolute h-1/2 left-4 top-1/4"
					src="../src/assets/icons/Arrow Left.png"
				/>
				<div className="text-center">앨범 생성</div>
			</div>
			<div className="border-b-solid">
				<div> 제목</div>
				<input placeholder=""></input>
			</div>

			<div>
				<div> 현재 00장 업로드 중</div>
				<Grid items={mock} />
			</div>
		</>
	);
};

export default AlbumEditor;
