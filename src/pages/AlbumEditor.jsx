import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Grid from "../components/Grid";
import Input from "../components/Input";
import CreateAlbumButton from "../components/album/CreateAlbumButton";

// Assets
import axios from "axios";
import { createAlbum } from "../api/albums/albumCreateApi";
import { getPreSignedUrl } from "../api/albums/presignedUrl";
import crossIcon from "../assets/cross_icon.png";

const AlbumEditor = () => {
	const [albumTitle, setAlbumTitle] = useState("이름 없는 앨범");
	const [files, setFiles] = useState([]);
	const fileInputRef = useRef(null);
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const validateTitle = (title) => {
		if (!title || title.trim() === "") {
			return "앨범 제목을 입력해주세요.";
		}

		if (title.length > 12) {
			return "앨범 제목은 50자 이내로 작성해주세요.";
		}

		return ""; // 오류가 없으면 빈 문자열 반환
	};

	const handleTitleChange = (e) => {
		const newTitle = e.target.value;
		setAlbumTitle(newTitle);

		// 입력 중에는 오류 메시지를 표시하지 않음
		if (titleError) {
			setTitleError("");
		}
	};

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
			// 1. 앨범 이름과 파일 메타데이터 준비
			const pictures = files.map((fileItem) => ({
				pictureName: fileItem.file.name,
				pictureType: fileItem.file.type,
			}));

			// 2. presigned URL 요청
			const response = await getPreSignedUrl(pictures);
			const presignedFiles = response.data.presignedFiles;

			// 3. 업로드
			for (const fileItem of files) {
				const file = fileItem.file;
				const matched = presignedFiles.find(
					(f) => f.pictureName === file.name
				);
				if (!matched) continue;

				await axios.put(matched.presignedUrl, file, {
					headers: {
						"Content-Type": file.type,
					},
				});
			}

			// 4. 업로드 완료 후 앨범 생성 요청
			const pictureUrls = presignedFiles.map((f) => f.pictureURL);
			const albumData = {
				albumName: albumTitle,
				pictureUrls: pictureUrls,
			};

			const res = await createAlbum(albumData);
			const result = await res;
			console.log(result);
			navigate("/main");
		} catch (err) {
			console.error(err);
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

						className="absolute inset-0 object-cover w-full h-full"
					/>
					{/* 삭제 버튼 */}
					<button
						className="absolute z-10 top-2 right-2"
						onClick={() => {
							// 파일 목록에서 해당 아이템 제거
							setFiles(
								files.filter((item) => item.id !== fileItem.id)
							);
							// 메모리 누수 방지를 위해 URL 해제
							URL.revokeObjectURL(fileItem.preview);
						}}>
						<img className="w-4 h-4" src={crossIcon}></img>
					</button>
				</div>
			),
			element: index + 1,
		})),
	];

	const onClickBtn = () => {
		navigate(-1);
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
						value={albumTitle}
						onChange={handleTitleChange}
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
