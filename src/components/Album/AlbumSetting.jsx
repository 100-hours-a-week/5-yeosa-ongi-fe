import { useEffect, useState } from "react";
import { getSharingLink } from "../../api/albums/albumShareLink";
import TextInput from "../common/TextInput";
import AlbumShare from "./AlbumShare";

const AlbumSetting = ({ albumId, albumName, handleDelete }) => {
	const [activeSection, setActiveSection] = useState("sharing");
	const [sharingLink, setSharingLink] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [isValid, setIsValid] = useState(false);

	const handleOnChange = (newValue, e) => {
		const inputValue = newValue;
		const expectedValue = albumName;

		setIsValid(inputValue === expectedValue);
		console.log(isValid);
	};

	useEffect(() => {
		const fetchSharingLink = async () => {
			if (!albumId) return;

			try {
				setLoading(true);
				setError(null);
				const result = await getSharingLink(albumId);
				setSharingLink(result.data);
			} catch (err) {
				console.error("Failed to fetch sharing link:", err);
				setError("공유 링크를 불러오는데 실패했습니다.");
			} finally {
				setLoading(false);
			}
		};

		fetchSharingLink();
	}, [albumId]);
	const sections = {
		sharing: {
			title: "공유하기",
			content: <AlbumShare sharingLink={sharingLink} />,
		},
		deletion: {
			title: "앨범 삭제",
			content: (
				<div className="relative flex flex-col w-full h-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
					<div className="p-5 border-b">
						<h3 className="text-lg font-medium text-gray-800">
							앨범 삭제
						</h3>
					</div>

					<div className="flex-grow p-5">
						<TextInput
							className="w-full px-2 py-1 my-2 transition-colors border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 "
							placeholder={
								albumName || "앨범 이름을 입력해주세요."
							}
							maxLength={12}
							label={`삭제할 앨범 : ${albumName}`}
							onChange={handleOnChange}
						/>

						<p className="flex items-center mt-2 text-xs text-red-600">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="w-4 h-4 mr-1"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
							앨범을 삭제하시려면 앨범 명을 정확히 입력해 주세요.
						</p>
					</div>

					<div className="flex justify-end p-4 space-x-3 border-t">
						<button className="px-4 py-2 font-medium text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400">
							취소
						</button>
						<button
							onClick={handleDelete}
							className={`px-4 py-2 font-medium text-white transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
								isValid
									? "bg-red-600 hover:bg-red-700 focus:ring-red-500 cursor-pointer"
									: "bg-gray-400 cursor-not-allowed"
							}`}>
							삭제
						</button>
					</div>
				</div>
			),
		},
	};

	return (
		<div className="max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-lg h-[400px]">
			<div className="flex h-full">
				{/* Sidebar for section selection */}
				<div className="w-1/3 border-r bg-gray-50">
					<div className="py-4 ">
						<h2 className="px-5 font-bold mb-7 text-md">
							앨범 설정
						</h2>
						<nav className="space-y-1">
							{Object.entries(sections).map(([key, section]) => (
								<button
									key={key}
									className={`w-full text-center text-sm px-5 py-2  transition ${
										activeSection === key
											? "bg-gray-300 text-white font-bold"
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
				</div>
			</div>
		</div>
	);
};

export default AlbumSetting;
