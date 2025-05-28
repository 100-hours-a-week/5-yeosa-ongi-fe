import crossIcon from "@/assets/cross_icon.png";
import { FILE_STATUS } from "@/stores/fileProcessingStore";

// 파일 상태 배지 컴포넌트
const StatusBadge = ({ status }) => {
	const statusConfig = {
		[FILE_STATUS.PENDING]: { color: "bg-gray-500", text: "대기" },
		[FILE_STATUS.VALIDATING]: { color: "bg-blue-500", text: "검증중" },
		[FILE_STATUS.VALID]: { color: "bg-green-500", text: "완료" },
		[FILE_STATUS.INVALID]: { color: "bg-red-500", text: "실패" },
		[FILE_STATUS.PROCESSING]: { color: "bg-yellow-500", text: "처리중" },
		[FILE_STATUS.PROCESSED]: { color: "bg-green-600", text: "처리완료" },
		[FILE_STATUS.ERROR]: { color: "bg-red-600", text: "오류" },
	};

	const config = statusConfig[status] || {
		color: "bg-gray-400",
		text: "알수없음",
	};

	return (
		<span
			className={`${config.color} text-white text-xs px-2 py-1 rounded`}>
			{config.text}
		</span>
	);
};

const FilePreview = ({ fileItem, onDelete }) => {
	// fileItem은 이제 스토어의 파일 객체
	const displayFile = fileItem.file || fileItem.originalFile;
	const preview = fileItem.preview || URL.createObjectURL(displayFile);

	return (
		<div className="relative w-full h-full">
			<img
				src={preview}
				alt={`Preview ${fileItem.id}`}
				className="absolute inset-0 object-cover w-full h-full"
			/>
			파일 상태 표시
			<div className="absolute top-2 left-2">
				<StatusBadge status={fileItem.status} />
			</div>
			{/* 삭제 버튼 */}
			<button
				className="absolute z-10 top-2 right-2"
				onClick={() => onDelete(fileItem.id)}>
				<img className="w-4 h-4" src={crossIcon} alt="삭제" />
			</button>
			{/* 에러 표시 */}
			{fileItem.errors && fileItem.errors.length > 0 && (
				<div className="absolute bottom-2 left-2 right-2">
					<div className="p-1 text-xs text-white bg-red-500 rounded">
						{fileItem.errors[0].message}
					</div>
				</div>
			)}
		</div>
	);
};

export default FilePreview;
