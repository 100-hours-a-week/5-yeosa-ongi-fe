import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Grid from "../components/Grid";
import Input from "../components/Input";
import CreateAlbumButton from "../components/album/CreateAlbumButton";
import { API_BASE_URL } from "../api/config";

const AlbumEditor = () => {
	const [albumTitle, setAlbumTitle] = useState("이름 없는 앨범");
	const [files, setFiles] = useState([]);
	const fileInputRef = useRef(null);
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	const handleFileAdded = (file) => {
		if (!file) return;
		const newFileItem = {
			file,
			preview: URL.createObjectURL(file),
			id: Math.random().toString(36).substr(2, 9),
		};
		setFiles((prevFiles) => [...prevFiles, newFileItem]);
	};

	const handleCreateAlbum = async () => {
		if (files.length === 0 || loading) return;
		setLoading(true);
		try {
			const formData = new FormData();
			formData.append("albumName", albumTitle);
			files.forEach((fileItem) => {
				formData.append("images", fileItem.file);
			});
			const response = await axios.post(
				`${API_BASE_URL}/api/albums/people`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);
			// 성공 시 앨범 상세 페이지로 이동 (albumId 필요)
			const albumId = response.data?.albumId || response.data?.id;
			if (albumId) {
				navigate(`/album/${albumId}`);
			} else {
				alert("앨범 생성은 성공했으나 albumId를 찾을 수 없습니다.");
			}
		} catch (error) {
			alert("앨범 생성에 실패했습니다.");
		} finally {
			setLoading(false);
		}
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
						className="absolute inset-0 w-full h-full object-cover rounded-lg"
					/>
					{/* 삭제 버튼 */}
					<button
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
			<CreateAlbumButton
				disabled={files.length === 0 || loading}
				onClick={handleCreateAlbum}
			/>
		</>
	);
};

export default AlbumEditor;
