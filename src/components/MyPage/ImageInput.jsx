import { useRef } from "react";

const ImageInput = ({
	onFileSelect,
	accept = "image/*",
	id = "fileInput",
	children,
}) => {
	const inputRef = useRef(null);

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			onFileSelect(file);
		}
		// 같은 파일을 다시 선택할 수 있도록 value 초기화
		e.target.value = null;
	};

	const handleClick = () => {
		inputRef.current.click();
	};

	return (
		<div className="relative cursor-pointer" onClick={handleClick}>
			{/* 숨겨진 파일 입력 */}
			<input
				ref={inputRef}
				type="file"
				id={id}
				accept={accept}
				onChange={handleFileChange}
				className="hidden"
			/>

			{/* 클릭 가능한 콘텐츠 */}
			{children}

			{/* 호버 시 표시되는 오버레이 */}
			<div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100">
				<svg
					className="w-8 h-8 text-white"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
					/>
				</svg>
			</div>
		</div>
	);
};

export default ImageInput;
