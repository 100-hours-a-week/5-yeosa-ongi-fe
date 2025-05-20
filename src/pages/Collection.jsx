import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Grid from "../components/common/Grid";
import Header from "../components/common/Header";
import useCollectionStore from "../stores/collectionStore";

// Assets
import iconTrash from "@/assets/icons/icon_trash.png";
import { deleteAlbumPicture } from "../api/pictures/deletePicture";
import arrowLeft from "../assets/icons/Arrow Left.png";
import { Modal } from "../components/common/Modal";
import useModal from "../hooks/useModal";

const Collection = () => {
	const { albumId, collectionName } = useParams();
	const navigate = useNavigate();

	const [currentCollection, setCurrentCollection] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isDeleteMode, setIsDeleteMode] = useState(false);
	const [selectedPictures, setSelectedPictures] = useState(new Set());
	const { isOpen, modalData, openModal, closeModal } = useModal();
	const getCollectionByName = useCollectionStore(
		(state) => state.getCollectionByName
	);
	const removePictures = useCollectionStore((state) => state.removePictures);

	useEffect(() => {
		try {
			setLoading(true);
			const collection = getCollectionByName(collectionName);

			if (!collection) {
				// 컬렉션이 없는 경우 앨범 페이지로 리다이렉트
				navigate(`/album/${albumId}`);
				return;
			}

			setCurrentCollection(collection);
			setLoading(false);
		} catch (error) {
			navigate(`/album/${albumId}`);
			console.log(error);
		}
	}, [collectionName, albumId]);

	// 컬렉션이 없거나 로딩 중인 경우 처리
	if (loading) {
		console.log("Loading, currentCollection:", currentCollection);
		return (
			<>
				<Header />
				<div className="flex items-center justify-center h-screen">
					<div className="text-lg text-gray-500">로딩 중...</div>
				</div>
			</>
		);
	}

	const handleDelete = async () => {
		try {
			const pictureIds = Array.from(selectedPictures);

			// API 호출로 서버에서 사진 삭제
			await deleteAlbumPicture(albumId, { pictureIds });

			// 스토어 업데이트 (모든 컬렉션에서 해당 사진 제거)
			removePictures(pictureIds);

			// 업데이트된 컬렉션 데이터 가져오기
			const updatedCollection = getCollectionByName(collectionName);
			setCurrentCollection(updatedCollection);

			// 삭제 모드 및 선택 상태 초기화
			setIsDeleteMode(false);
			setSelectedPictures(new Set());

			// 컬렉션이 비어있으면 앨범 페이지로 이동
			if (!updatedCollection || updatedCollection.pictures.length === 0) {
				navigate(`/album/${albumId}`);
			}
		} catch (error) {
			console.error("사진 삭제 중 오류 발생:", error);
			// 오류 처리 추가 (예: 사용자에게 알림)
		}
	};

	const toggleSelect = (pictureId) => {
		setSelectedPictures((prev) => {
			const newSelected = new Set(prev);
			if (newSelected.has(pictureId)) {
				newSelected.delete(pictureId);
			} else {
				newSelected.add(pictureId);
			}
			return newSelected;
		});
	};
	// 사진 배열이 있는지 확인
	const pictures = currentCollection.pictures || [];

	const formattedPictures = pictures.map((picture) => ({
		ElementType: () => {
			// 이 컴포넌트는 isDeleteMode 상태가 변경될 때마다 다시 렌더링됩니다
			const isSelected = selectedPictures.has(picture.pictureId);

			return (
				<div
					className="relative w-full h-full"
					onClick={() =>
						isDeleteMode && toggleSelect(picture.pictureId)
					}>
					<img
						src={picture.pictureURL}
						className="absolute inset-0 object-cover w-full h-full"
					/>
					{isDeleteMode && (
						<div className="absolute z-10 top-2 right-2">
							<div
								className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
									isSelected
										? "bg-primary"
										: "border-gray-light bg-transparent"
								}`}>
								{isSelected && (
									<span className="text-xs text-white">
										✓
									</span>
								)}
							</div>
						</div>
					)}
				</div>
			);
		},
		element: picture,
		props: {
			alt: `Photo ${picture.pictureId || ""}`,
			className: "w-full h-full object-cover",
		},
	}));
	console.log(
		"Rendering collection:",
		currentCollection.name,
		"with",
		pictures.length,
		"pictures"
	);
	const handleClick = () => {
		if (selectedPictures.size === 0) {
			setIsDeleteMode(false);
			return;
		}
		openModal("앨범 삭제");
	};
	// 각 컬렉션 유형에 따라 다른 UI 렌더링
	return (
		<>
			<div className="h-[52px] relative flex items-center justify-center">
				<button
					onClick={() => navigate(-1)}
					className="absolute h-1/2 left-4 top-1/4">
					<img src={arrowLeft} className="h-1/2 left-4 top-1/4"></img>
				</button>
				<img className="absolute h-1/2 left-4 top-1/4" />
				<div className="text-center">
					{" "}
					{currentCollection.name || "컬렉션"}
				</div>
			</div>
			<div className="flex items-center justify-between p-4">
				<p className="text-sm text-gray-dark">
					총 {currentCollection.count || pictures.length}개의 사진
				</p>
				{isDeleteMode ? (
					<button onClick={handleClick}>
						<div className="text-sm">완료</div>
					</button>
				) : (
					<button
						onClick={() => {
							setIsDeleteMode(true);
						}}>
						<img src={iconTrash} className="h-4"></img>
					</button>
				)}
			</div>
			<div>
				<Grid col={3} items={formattedPictures} />
			</div>
			{/* Modal */}
			<Modal isOpen={isOpen} onClose={closeModal} title={modalData}>
				{modalData && (
					<div>
						<p>
							선택한 {selectedPictures.size}장의 사진을
							삭제하시겠습니까?
						</p>
						<p>삭제된 사진은 복구할 수 없습니다.</p>
						<div className="flex justify-center gap-16 mt-8">
							<button
								className="w-20 border rounded-lg h-7"
								onClick={() => {
									closeModal();
								}}>
								아니오
							</button>
							<button
								className="w-20 border rounded-lg h-7"
								onClick={() => {
									handleDelete();
									closeModal();
								}}>
								예
							</button>
						</div>
					</div>
				)}
			</Modal>
		</>
	);
};

export default Collection;
