import { batchProcessImages } from "@/services/imageConversionService";
import { useRef } from "react";

const Input = ({
	onFileSelect,
	disabled = false,
	setProcessing = () => {},
	isProcessing = false,
	onError = () => {},
}) => {
	const fileInputRef = useRef(null);

	const handleFileChange = async (e) => {
		console.log("handleFileChange 호출!");
		const selectedFiles = Array.from(e.target.files);
		console.log("선택된 파일:", selectedFiles);

		if (selectedFiles.length === 0) {
			e.target.value = "";
			return;
		}

		setProcessing(true);
		try {
			const { processedFiles, failedFiles } = await batchProcessImages(
				selectedFiles,
				{
					convertHeic: true,
					heicOptions: {
						toType: "image/jpeg",
						quality: 0.8,
					},
				}
			);

			if (failedFiles.length > 0) {
				const failedNames = failedFiles.map((f) => f.name).join(", ");
				onError(
					`${failedFiles.length}개 파일 처리 실패: ${failedNames}`
				);
			}

			if (processedFiles.length > 0) {
				if (processedFiles.length === 1) {
					onFileSelect(processedFiles[0]);
				} else {
					onFileSelect(processedFiles);
				}
			} else if (failedFiles.length > 0) {
				onError("모든 파일 처리에 실패했습니다.");
			}
		} catch (error) {
			console.error("파일 처리 중 오류 발생:", error);
			onError("파일 처리 중 오류가 발생했습니다.");
		} finally {
			setProcessing(false);
		}
	};

	const handleClick = () => {
		if (!disabled && !isProcessing) {
			fileInputRef.current.click();
		}
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
