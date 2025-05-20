import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Grid from "../components/common/Grid";
import Header from "../components/common/Header";
import useCollectionStore from "../stores/collectionStore";

// Assets
import iconTrash from "@/assets/icons/icon_trash.png";
import arrowLeft from "../assets/icons/Arrow Left.png";

const Collection = () => {
	const { collectionName } = useParams();
	const navigate = useNavigate();
	const {
		allCollection,
		shakyCollection,
		duplicatedCollection,
		tagCollections,
	} = useCollectionStore();

	const [currentCollection, setCurrentCollection] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isDeleteMode, setIsDeleteMode] = useState(false);
	const [selectedPictures, setSelectedPictures] = useState(new Set());

	useEffect(() => {
		// 컬렉션 이름에 따라 적절한 컬렉션 데이터 설정
		setLoading(true);

		if (collectionName === "전체") {
			setCurrentCollection(allCollection);
		} else if (collectionName === "흔들림") {
			setCurrentCollection(shakyCollection);
		} else if (collectionName === "중복") {
			setCurrentCollection(duplicatedCollection);
		} else {
			// tagCollections가 배열인지 확인
			const tagCollection =
				tagCollections && Array.isArray(tagCollections)
					? tagCollections.find(
							(collection) =>
								collection && collection.name === collectionName
					  )
					: null;
			setCurrentCollection(tagCollection);
		}

		console.log("Collections:", {
			allCollection,
			shakyCollection,
			duplicatedCollection,
			tagCollections,
		});

		setLoading(false);
	}, [
		collectionName,
		allCollection,
		shakyCollection,
		duplicatedCollection,
		tagCollections,
	]);

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
					<button
						onClick={() => {
							setIsDeleteMode(false);
						}}>
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
		</>
	);
};

export default Collection;
