import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "../components/Grid";
import Input from "../components/Input";

const AlbumEditor = () => {
	const [albumTitle, setAlbumTitle] = useState("이름 없는 앨범");
	const [files, setFiles] = useState([]);
	const fileInputRef = useRef(null);

	const handleFileAdded = (file) => {
		if (!file) return;

		// 파일에 대한 미리보기 URL 생성
		const newFileItem = {
			file,
			preview: URL.createObjectURL(file),
			id: Math.random().toString(36).substr(2, 9),
		};

		setFiles((prevFiles) => [...prevFiles, newFileItem]);
	};

	const handleAddMoreClick = () => {
		fileInputRef.current.click();
	};
	const gridItems = [
		{
			ElementType: Input,
			element: 0,
			props: {
				onFileSelect: handleFileAdded,
			},
		},
		...files.map((fileItem, index) => ({
			ElementType: () => (
				<div className="relative w-full h-full">
					{/* 이미지 미리보기 */}
					<img
						src={fileItem.preview}
						alt={`Preview ${index}`}
						className="object-cover w-full h-full rounded-lg"
					/>
					{/* 삭제 버튼 */}
					<button
						className="absolute left-1 top-1"
						onClick={() => {
							// 파일 목록에서 해당 아이템 제거
							setFiles(
								files.filter((item) => item.id !== fileItem.id)
							);
							// 메모리 누수 방지를 위해 URL 해제
							URL.revokeObjectURL(fileItem.preview);
						}}>
						×
					</button>
				</div>
			),
			element: index + 1,
		})),
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
				<div className="m-2 mt-8">현재 {files.length}장 업로드 중</div>
				<Grid items={gridItems} />
			</div>
		</>
	);
};

export default AlbumEditor;
