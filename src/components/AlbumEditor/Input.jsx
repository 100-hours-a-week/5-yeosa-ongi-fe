import heic2any from "heic2any";
import { useRef } from "react";

const Input = ({ onFileSelect }) => {
	// 파일 입력 요소에 대한 참조 생성
	const fileInputRef = useRef(null);

	const handleClick = () => {
		fileInputRef.current.click();
	};
	const isHEICFile = (file) => {
		return (
			file.type === "image/heic" ||
			file.type === "image/heif" ||
			file.name.toLowerCase().endsWith(".heic") ||
			file.name.toLowerCase().endsWith(".heif")
		);
	};

	const convertHEICtoJPG = async (heicFile) => {
		try {
			console.log("HEIC 파일 변환 시작:", heicFile.name);

			// HEIC 파일을 JPEG Blob으로 변환
			const jpgBlob = await heic2any({
				blob: heicFile,
				toType: "image/jpeg",
				quality: 0.8,
			});

			// 결과가 배열인 경우 처리 (여러 이미지가 포함된 HEIC 파일의 경우)
			const resultBlob = Array.isArray(jpgBlob) ? jpgBlob[0] : jpgBlob;

			// 변환된 Blob을 File 객체로 변환
			const jpgFile = new File(
				[resultBlob],
				heicFile.name.replace(/\.heic$|\.heif$/i, ".jpg"),
				{ type: "image/jpeg" }
			);

			console.log("HEIC 파일 변환 완료:", jpgFile.name);
			return jpgFile;
		} catch (error) {
			console.error("HEIC 변환 오류:", error);
			return null;
		}
	};

	const handleFileChange = async (e) => {
		console.log("handleFileChange 호출!");
		const selectedFiles = Array.from(e.target.files);
		console.log(selectedFiles);
		if (selectedFiles.length > 0) {
			// 각 파일을 처리
			for (const file of selectedFiles) {
				// HEIC 파일인 경우 변환
				if (isHEICFile(file)) {
					console.log("HEIC 파일 감지:", file.name);
					const convertedFile = await convertHEICtoJPG(file);

					if (convertedFile) {
						onFileSelect(convertedFile);
					} else {
						console.error("파일 변환 실패:", file.name);
						// 필요하다면 사용자에게 오류 알림
					}
				} else {
					// 일반 이미지 파일인 경우 그대로 전달
					onFileSelect(file);
				}
			}
		}
		e.target.value = "";
	};
	return (
		<div className="w-full h-full">
			<div
				className="flex items-center justify-center w-full h-full text-2xl bg-white border border-gray-300 border-dashed cursor-pointer"
				onClick={handleClick}>
				+
			</div>
			<input
				ref={fileInputRef}
				className="hidden"
				type="file"
				accept="image/jpg, image/png, image/jpeg, image/heic"
				multiple
				onChange={handleFileChange}
			/>
		</div>
	);
};

export default Input;
