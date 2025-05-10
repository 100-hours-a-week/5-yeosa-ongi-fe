import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Grid from "../components/Grid";
import Header from "../components/Header";
import Image from "../components/Imgae";
import useCollectionStore from "../stores/collectionStore";

// Assets
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

	// 사진 배열이 있는지 확인
	const pictures = currentCollection.pictures || [];
	const formattedPictures = pictures.map((picture) => ({
		ElementType: Image,
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
			<div className="p-4">
				<h1 className="mb-4 text-2xl font-bold"></h1>
				<p className="mb-6 text-gray-500">
					총 {currentCollection.count || pictures.length}개의 사진
				</p>
			</div>
			<div>
				{/* 이미지 태그는 src와 alt 속성이 없으면 경고가 발생합니다 */}
				{/* <img src="..." alt="..." /> */}
			</div>
			<div>
				<Grid col={3} items={formattedPictures} />
			</div>
		</>
	);
};

export default Collection;
