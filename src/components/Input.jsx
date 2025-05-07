import { useRef } from "react";

const Input = ({ onFileSelect }) => {
	// 파일 입력 요소에 대한 참조 생성
	const fileInputRef = useRef(null);

	const handleClick = () => {
		fileInputRef.current.click();
	};
	const handleFileChange = (e) => {
		console.log("handleFIleChange 호출!");
		const selectedFile = e.target.files[0];
		if (selectedFile) {
			onFileSelect(selectedFile);
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
				accept="image/jpg, image/png, image/jpeg"
				onChange={handleFileChange}
			/>
		</div>
	);
};

export default Input;
