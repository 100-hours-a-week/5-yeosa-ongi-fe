import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAlbumDetail } from "../api/albums/albumDetail";
import Card from "../components/Card";
import Category from "../components/Category";
import Header from "../components/Header";

//Assets
import Arrow_Right from "../assets/icons/Arrow Right.png";
import iconDuplicated from "../assets/icons/icon_duplicated.png";
import iconShaky from "../assets/icons/icon_shaky.png";
import useCollectionStore from "../stores/collectionStore";

const Album = () => {
	const navigate = useNavigate();
	const { albumId } = useParams();
	const [albumData, setAlbumData] = useState();
	const [isLoading, setIsLoading] = useState(true);

	const [category, setCategory] = useState({});

	const {
		setAllCollection,
		setShakyCollection,
		setDuplicatedCollection,
		setTagCollections,
		tagCollections,
	} = useCollectionStore();
	// 전체 사진 목록
	const [allPhotos, setAllPhotos] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			let result;
			try {
				const response = await getAlbumDetail(albumId);
				result = response;
				console.log(response);
			} catch (error) {
				// 실패 시 목(mock) 데이터 사용
				result = {
					code: "ALBUM_ACCESS_SUCCESS",
					message: "앨범 조회 성공",
					data: [
						{
							title: "제주도 여행",
							picture: [
								{
									pictureId: 501,
									PictureURL:
										"https://ongi.s3.ap-northeast-2.amazonaws.com/pic-502.jpg",
									latitude: 35.1586,
									longitude: 129.1604,
									tag: "여행",
									isDuplicated: false,
									isShaky: false,
									createdAt: "2025-05-04T12:12:12",
								},
								{
									pictureId: 502,
									PictureURL:
										"https://ongi.s3.ap-northeast-2.amazonaws.com/pic-502.jpg",
									latitude: 35.1586,
									longitude: 129.1604,
									tag: "여행",
									isDuplicated: false,
									isShaky: false,
									createdAt: "2025-05-04T12:12:12",
								},
								{
									pictureId: 503,
									PictureURL:
										"https://ongi.s3.ap-northeast-2.amazonaws.com/pic-503.jpg",
									latitude: 33.5097,
									longitude: 126.5219,
									tag: "풍경",
									isDuplicated: true,
									isShaky: false,
									createdAt: "2025-05-05T10:30:15",
								},
								{
									pictureId: 504,
									PictureURL:
										"https://ongi.s3.ap-northeast-2.amazonaws.com/pic-504.jpg",
									latitude: 33.4996,
									longitude: 126.5312,
									tag: "음식",
									isDuplicated: false,
									isShaky: true,
									createdAt: "2025-05-05T13:45:22",
								},
							],
						},
					],
				};
			} finally {
			}

			setAlbumData(result.data);

			console.log(result.data);
			// 모든 사진 목록 저장
			if (result.data && result.data.picture) {
				setAllPhotos(result.data.picture);

				// 사진 분류 작업 수행
				categorizePhotos(result.data.picture);
			}
			setIsLoading(false);
		};
		fetchData();
	}, [albumId]);

	const categorizePhotos = (pictures) => {
		console.log(pictures);
		if (!pictures || pictures.length === 0) return;

		const uniqueTags = [
			...new Set(pictures.map((pic) => pic.tag).filter(Boolean)),
		];

		const allCollection = {
			name: "전체",
			pictures: pictures,
			count: pictures.length,
		};

		const duplicatedCollection = {
			name: "중복",
			pictures: pictures.filter((pic) => pic.isDuplicated),
			count: pictures.filter((pic) => pic.isDuplicated).length,
		};

		const shakyCollection = {
			name: "흔들림",
			pictures: pictures.filter((pic) => pic.isShaky),
			count: pictures.filter((pic) => pic.isShaky).length,
		};

		// 태그별 컬렉션 생성
		const tagCollections = uniqueTags.map((tag) => ({
			name: tag,
			pictures: pictures.filter((pic) => pic.tag === tag),
			count: pictures.filter((pic) => pic.tag === tag).length,
		}));

		setAllCollection(allCollection);
		setDuplicatedCollection(duplicatedCollection);
		setShakyCollection(shakyCollection);
		setTagCollections(tagCollections);
		console.log(allCollection);
		console.log(tagCollections);
	};

	const [showRightIndicator, setShowRightIndicator] = useState(true);

	// 스크롤 이벤트 처리
	const handleScroll = (e) => {
		const container = e.target;
		const isScrollEnd =
			container.scrollWidth - container.scrollLeft <=
			container.clientWidth + 10;

		if (isScrollEnd) {
			setShowRightIndicator(false);
		} else {
			setShowRightIndicator(true);
		}
	};

	if (isLoading) {
		return (
			<>
				<Header />
				<div className="loading-container">로딩 중...</div>
			</>
		);
	}
	return (
		<>
			<Header />
			<Card />
			<div className="m-4 mt-6">
				<div className="ml-4 font-sans text-xl">카테고리 </div>
				<div className="relative">
					<div
						className="flex flex-row w-full gap-2 px-2 py-4 overflow-x-auto scrollbar-thin scrollbar-gray-light scrollbar-track-gray-light"
						onScroll={handleScroll}>
						{tagCollections &&
							tagCollections.map((category, index) => (
								<Category
									title={category.name}
									pictures={category.pictures}
									albumId={albumId}
								/>
							))}
					</div>
					{showRightIndicator && (
						<div className="absolute top-0 right-0 flex items-center justify-end w-16 h-full pointer-events-none bg-gradient-to-l from-white to-transparent">
							<div className="flex items-center justify-center w-8 h-8 mr-2 bg-white rounded-full shadow-sm bg-opacity-70">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="w-5 h-5 text-gray-500"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</div>
						</div>
					)}
				</div>
			</div>
			<div className="m-4 mt-6">
				<div className="ml-4 font-sans text-xl">하이라이트 </div>
			</div>
			<div className="m-4 mt-6">
				<div className="ml-4 font-sans text-xl">검토해줘 </div>

				<div className="m-4">
					<button
						className="flex items-center justify-between w-full border-0 border-b border-gray-200 bg-gray-50 focus:outline-none"
						onClick={() => navigate(`/album/${albumId}/중복`)}>
						<div className="flex items-center">
							<div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mr-4 rounded-lg bg-gray-50">
								<img src={iconDuplicated}></img>
							</div>
							<div className="text-lg text-gray-dark">
								중복된 사진
							</div>
						</div>
						<img className="m-2 size-3" src={Arrow_Right} />
					</button>
				</div>

				<div className="m-4">
					<button
						className="flex items-center justify-between w-full border-0 border-b border-gray-200 bg-gray-50 focus:outline-none"
						onClick={() => navigate(`/album/${albumId}/흔들림`)}>
						<div className="flex items-center">
							<div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mr-4 rounded-lg bg-gray-50">
								<img src={iconShaky}></img>
							</div>
							<div className="text-lg text-gray-dark">
								흔들린 사진
							</div>
						</div>
						<img className="m-2 size-3" src={Arrow_Right} />
					</button>
				</div>
			</div>
		</>
	);
};

export default Album;
