import AlbumTitleForm from "@/components/AlbumEditor/AlbumTitleForm";
import Grid from "@/components/common/Grid";
import axios from "axios"; // 추가: axios import
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateAlbumButton from "../components/AlbumEditor/CreateAlbumButton";

// 커스텀 컴포넌트와 훅
import Input from "../components/AlbumEditor/Input"; // 수정된 Input 컴포넌트
import useFileUpload from "../hooks/useFileUpload";
import { validateImageFile } from "../services/validateImageFile";

// Assets
import { createAlbum } from "../api/albums/albumCreateApi";
import { getPreSignedUrl } from "../api/albums/presignedUrl";
import crossIcon from "../assets/cross_icon.png";
import Arrow_Left from "../assets/icons/Arrow Left.png";

// 파일 미리보기 컴포넌트
const FilePreview = ({ file, onDelete }) => (
	<div className="relative w-full h-full">
		<img
			src={file.preview}
			alt={`Preview ${file.id}`}
			className="absolute inset-0 object-cover w-full h-full"
		/>
		<button
			className="absolute z-10 top-2 right-2"
			onClick={() => onDelete(file.id)}>
			<img className="w-4 h-4" src={crossIcon} alt="삭제" />
		</button>
	</div>
);

// 알림 컴포넌트
const Alert = ({ message, type = "error", onAction, actionText }) => {
	if (!message) return null;

	const bgColor = type === "error" ? "bg-red-100" : "bg-yellow-100";
	const textColor = type === "error" ? "text-red-800" : "text-yellow-800";

	return (
		<div className={`p-4 mb-4 rounded-md ${bgColor} ${textColor}`}>
			<div className="flex items-center justify-between">
				<p>{message}</p>
				{onAction && actionText && (
					<button
						className="px-3 py-1 ml-4 text-sm font-medium bg-white rounded-md"
						onClick={onAction}>
						{actionText}
					</button>
				)}
			</div>
		</div>
	);
};

const AlbumEditor = () => {
	const [albumTitle, setAlbumTitle] = useState("이름 없는 앨범");
	const [loading, setLoading] = useState(false);
	const [customError, setCustomError] = useState(null);

	// useFileUpload 훅 사용 (최대 10장 제한)
	const {
		files,
		addFile,
		removeFile,
		error: fileError,
		overflowFiles,
		addOverflowFiles,
		isProcessing,
		setProcessing,
		isFull,
		count,
		maxFiles,
	} = useFileUpload({ maxFiles: 10 });

	const navigate = useNavigate();

	// 오류 처리 핸들러
	const handleError = useCallback((errorMessage) => {
		setCustomError(errorMessage);
	}, []);

	// 파일 추가 핸들러
	const handleFileAdded = useCallback(
		(newFiles) => {
			// 배열이 아닌 경우 배열로 변환
			const filesToProcess = Array.isArray(newFiles)
				? newFiles
				: [newFiles];

			// 각 파일을 검증하고 추가
			const validFiles = [];
			let validationError = null;

			// 모든 파일 검증
			for (const file of filesToProcess) {
				const validationResult = validateImageFile(file, [
					...files,
					...validFiles,
				]);

				if (validationResult.isValid) {
					validFiles.push(file);
				} else {
					validationError = validationResult.error;
					break;
				}
			}

			// 검증 결과에 따라 처리
			if (validationError) {
				setCustomError(validationError);
				return;
			}

			// 파일 추가 (제한 처리는 useFileUpload 내부에서 처리됨)
			setCustomError(null);
			addFile(validFiles);
		},
		[addFile, files]
	);

	// 앨범 생성 핸들러 - Presigned URL 사용하도록 수정
	const handleCreateAlbum = async () => {
		if (files.length === 0 || loading || isProcessing) return;

		setLoading(true);
		setCustomError(null);

		try {
			// 1. 앨범 이름과 파일 메타데이터 준비
			const pictures = files.map((fileItem) => ({
				pictureName: fileItem.file.name,
				pictureType: fileItem.file.type,
			}));

			// 2. presigned URL 요청
			const response = await getPreSignedUrl(pictures);
			const presignedFiles = response.data.presignedFiles;

			// 3. 각 파일을 presigned URL을 사용하여 업로드
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
			// 위치 정보 추가 (현재는 0.0, 0.0으로 기본값 설정)
			const pictureData = presignedFiles.map((f) => ({
				pictureUrl: f.pictureURL,
				latitude: 0.0,
				longitude: 0.0,
			}));

			const albumData = {
				albumName: albumTitle,
				pictureUrls: pictureData,
			};

			console.log(albumData);
			const result = await createAlbum(albumData);
			console.log(result);

			navigate("/main");
		} catch (err) {
			console.error(err);
			setCustomError("앨범 생성 중 오류가 발생했습니다.");
		} finally {
			setLoading(false);
		}
	};

	// 앨범 제목 변경 핸들러
	const handleTitleChange = useCallback((newTitle) => {
		setAlbumTitle(newTitle);
	}, []);

	// 뒤로 가기 핸들러
	const handleBackClick = useCallback(() => {
		navigate(-1);
	}, [navigate]);

	// 초과 파일 추가 핸들러
	const handleAddOverflowFiles = useCallback(() => {
		addOverflowFiles();
	}, [addOverflowFiles]);

	// 그리드 아이템 생성
	const gridItems = useMemo(
		() => [
			{
				ElementType: () => (
					<Input
						onFileSelect={handleFileAdded}
						disabled={isFull}
						setProcessing={setProcessing}
						isProcessing={isProcessing}
						onError={handleError}
					/>
				),
				element: 0,
			},
			...files.map((fileItem, index) => ({
				ElementType: () => (
					<FilePreview file={fileItem} onDelete={removeFile} />
				),
				element: index + 1,
			})),
		],
		[
			files,
			handleFileAdded,
			removeFile,
			isFull,
			isProcessing,
			setProcessing,
			handleError,
		]
	);

	// 버튼 비활성화 여부
	const isButtonDisabled = files.length === 0 || loading || isProcessing;

	return (
		<div className="flex flex-col min-h-screen">
			{/* 헤더 */}
			<header className="h-[52px] relative flex items-center justify-center">
				<button
					className="absolute left-4 top-1/4"
					onClick={handleBackClick}>
					<img className="h-1/2" src={Arrow_Left} alt="뒤로가기" />
				</button>
				<h1 className="text-center">앨범 생성</h1>
			</header>

			{/* 앨범 제목 폼 */}
			<AlbumTitleForm
				initialTitle={albumTitle}
				onTitleChange={handleTitleChange}
			/>

			{/* 메인 콘텐츠 */}
			<main className="flex-grow px-4">
				{/* 오류 메시지 표시 */}
				{customError && (
					<Alert
						message={customError}
						onAction={() => setCustomError(null)}
						actionText="닫기"
					/>
				)}

				{/* 파일 업로드 오류 표시 */}
				{fileError && (
					<Alert
						message={fileError}
						onAction={
							overflowFiles.length > 0
								? handleAddOverflowFiles
								: null
						}
						actionText={
							overflowFiles.length > 0 ? "추가하기" : null
						}
					/>
				)}

				{/* 로딩 인디케이터 */}
				{isProcessing && (
					<div className="my-2 text-center text-blue-600">
						이미지 파일 처리 중... HEIC 변환은 시간이 더 소요될 수
						있습니다.
					</div>
				)}

				<div className="flex items-center justify-between my-4">
					<span
						className={
							count === maxFiles ? "text-red-500 font-bold" : ""
						}>
						현재 {count}장 업로드 중. (최대 {maxFiles}장)
					</span>
				</div>

				{/* 이미지 그리드 */}
				<Grid items={gridItems} />
			</main>

			{/* 푸터 (앨범 생성 버튼) */}
			<footer className="px-4 py-4 mt-auto">
				<CreateAlbumButton
					disabled={isButtonDisabled}
					onClick={handleCreateAlbum}>
					{loading ? "생성 중..." : "앨범 생성"}
				</CreateAlbumButton>

				{/* 로딩 인디케이터 */}
				{loading && (
					<div className="mt-2 text-center text-gray-600">
						이미지 업로드 중입니다. 잠시만 기다려주세요...
					</div>
				)}
			</footer>
		</div>
	);
};

export default AlbumEditor;
