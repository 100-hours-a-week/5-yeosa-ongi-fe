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

		const batchStartTime = performance.now();

		setProcessing(true);
		try {
			const processingStartTime = performance.now();
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

			const processingEndTime = performance.now();
			const processingDuration = processingEndTime - processingStartTime;

			if (failedFiles.length > 0) {
				const failedNames = failedFiles.map((f) => f.name).join(", ");
				onError(
					`${failedFiles.length}개 파일 처리 실패: ${failedNames}`
				);
			}

			if (processedFiles.length > 0) {
				const uiRenderStartTime = performance.now();

				if (processedFiles.length === 1) {
					onFileSelect(processedFiles[0]);
				} else {
					onFileSelect(processedFiles);
				}
				setTimeout(() => {
					const uiRenderEndTime = performance.now();
					const uiRenderDuration =
						uiRenderEndTime - uiRenderStartTime;
					const totalBatchDuration = uiRenderEndTime - batchStartTime;

					// 성능 데이터 콘솔 출력
					console.log({
						processingDuration,
						timestamp: new Date().toISOString(),
						totalBatchDuration,
						uiRenderDuration,
					});
				}, 0);
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
		if (!isProcessing) {
			if (disabled) {
				onError(`사진은 최대 10장 선택할 수 있습니다.`);
				return;
			}
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
