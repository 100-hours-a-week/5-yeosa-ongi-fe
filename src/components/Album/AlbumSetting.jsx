import { useState } from "react";

const AlbumSetting = () => {
	const [activeSection, setActiveSection] = useState("general");

	// Define sections with their content
	const sections = {
		general: {
			title: "기본 설정",
			content: (
				<div className="p-4">
					<h3 className="mb-4 text-lg font-medium">앨범 기본 정보</h3>
					<div className="space-y-4">
						<div>
							<label className="block mb-1 text-sm font-medium">
								앨범 이름
							</label>
							<input
								type="text"
								className="w-full p-2 border rounded-md"
								placeholder="앨범 이름을 입력하세요"
							/>
						</div>
						<div>
							<label className="block mb-1 text-sm font-medium">
								설명
							</label>
							<textarea
								className="w-full p-2 border rounded-md"
								rows={3}
								placeholder="앨범에 대한 설명을 입력하세요"
							/>
						</div>
					</div>
				</div>
			),
		},
		privacy: {
			title: "공개 설정",
			content: (
				<div className="p-4">
					<h3 className="mb-4 text-lg font-medium">앨범 공개 설정</h3>
					<div className="space-y-4">
						<div className="flex items-center">
							<input
								id="public"
								type="radio"
								name="privacy"
								className="mr-2"
							/>
							<label htmlFor="public">공개</label>
						</div>
						<div className="flex items-center">
							<input
								id="private"
								type="radio"
								name="privacy"
								className="mr-2"
							/>
							<label htmlFor="private">비공개</label>
						</div>
						<div className="flex items-center">
							<input
								id="shared"
								type="radio"
								name="privacy"
								className="mr-2"
							/>
							<label htmlFor="shared">
								특정 사용자에게만 공개
							</label>
						</div>
					</div>
				</div>
			),
		},
		sharing: {
			title: "공유 설정",
			content: (
				<div className="p-4">
					<h3 className="mb-4 text-lg font-medium">앨범 공유 옵션</h3>
					<div className="space-y-4">
						<div>
							<label className="block mb-1 text-sm font-medium">
								사용자 초대
							</label>
							<input
								type="text"
								className="w-full p-2 border rounded-md"
								placeholder="이메일 또는 사용자명 입력"
							/>
						</div>
						<div className="mt-4">
							<h4 className="mb-2 text-sm font-medium">
								현재 공유된 사용자
							</h4>
							<div className="p-2 border rounded-md">
								<div className="flex items-center justify-between py-2">
									<span>user@example.com</span>
									<button className="text-sm text-red-500">
										삭제
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			),
		},
		layout: {
			title: "레이아웃",
			content: (
				<div className="p-4">
					<h3 className="mb-4 text-lg font-medium">
						앨범 레이아웃 옵션
					</h3>
					<div className="grid grid-cols-2 gap-4">
						<div className="flex flex-col items-center p-2 border rounded-md cursor-pointer hover:bg-gray-50">
							<div className="flex items-center justify-center w-full h-20 mb-2 bg-gray-200">
								그리드
							</div>
							<span>그리드 뷰</span>
						</div>
						<div className="flex flex-col items-center p-2 border rounded-md cursor-pointer hover:bg-gray-50">
							<div className="flex items-center justify-center w-full h-20 mb-2 bg-gray-200">
								리스트
							</div>
							<span>리스트 뷰</span>
						</div>
					</div>
				</div>
			),
		},
		advanced: {
			title: "고급 설정",
			content: (
				<div className="p-4">
					<h3 className="mb-4 text-lg font-medium">고급 설정</h3>
					<div className="space-y-4">
						<div className="flex items-center">
							<input
								id="download"
								type="checkbox"
								className="mr-2"
							/>
							<label htmlFor="download">다운로드 허용</label>
						</div>
						<div className="flex items-center">
							<input
								id="comments"
								type="checkbox"
								className="mr-2"
							/>
							<label htmlFor="comments">댓글 허용</label>
						</div>
						<div>
							<label className="block mb-1 text-sm font-medium">
								만료 날짜 설정
							</label>
							<input
								type="date"
								className="p-2 border rounded-md"
							/>
						</div>
					</div>
				</div>
			),
		},
	};

	return (
		<div className="max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-lg">
			<div className="flex h-full">
				{/* Sidebar for section selection */}
				<div className="w-1/4 border-r bg-gray-50">
					<div className="px-2 py-4">
						<h2 className="px-3 mb-4 text-xl font-bold">
							앨범 설정
						</h2>
						<nav className="space-y-1">
							{Object.entries(sections).map(([key, section]) => (
								<button
									key={key}
									className={`w-full text-left px-3 py-2 rounded-md transition ${
										activeSection === key
											? "bg-blue-100 text-blue-700 font-medium"
											: "hover:bg-gray-100"
									}`}
									onClick={() => setActiveSection(key)}>
									{section.title}
								</button>
							))}
						</nav>
					</div>
				</div>

				{/* Content area */}
				<div className="w-3/4 overflow-auto">
					{sections[activeSection].content}

					{/* Footer with action buttons */}
					<div className="flex justify-end p-4 space-x-2 border-t">
						<button className="px-4 py-2 border rounded-md hover:bg-gray-50">
							취소
						</button>
						<button className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
							저장
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AlbumSetting;
