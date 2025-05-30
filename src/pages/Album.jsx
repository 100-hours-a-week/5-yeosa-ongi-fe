import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

//Components
import AlbumSetting from "../components/Album/AlbumSetting";
import Card from "../components/Album/Card";
import Category from "../components/Album/Category";
import FlottingButton from "../components/common/FlottingButton";
import Header from "../components/common/Header";
import { Modal } from "../components/common/Modal";

//Custom Hooks
import useModal from "../hooks/useModal";

//APIs
import { getAlbumAccess } from "../api/albums/albumAccessApi";
import { deleteAlbum } from "../api/albums/albumDeleteApi";
import { getAlbumDetail } from "../api/albums/albumDetail";

//Stores
import useCollectionStore from "../stores/collectionStore";

//Assets
import Arrow_Right from "../assets/icons/Arrow Right.png";
import iconDuplicated from "../assets/icons/icon_duplicated.png";
import iconShaky from "../assets/icons/icon_shaky.png";

const Album = () => {
	const navigate = useNavigate();
	const { albumId } = useParams();
	const [albumData, setAlbumData] = useState();
	const [isLoading, setIsLoading] = useState(true);
	const [category, setCategory] = useState({});

	const { isOpen, modalData, openModal, closeModal } = useModal();
	const {
		setPicturesAndCategorize,
		tagCollections,
		duplicatedCollection,
		shakyCollection,
	} = useCollectionStore();

	// 전체 사진 목록
	const [allPhotos, setAllPhotos] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const result = await getAlbumAccess(albumId);
				const role = result.data.role;
				if (role !== "OWNER" && role !== "NORMAL") {
					navigate("/main");
				}
				const response = await getAlbumDetail(albumId);
				setAlbumData(response.data);

				// 사진 데이터를 스토어에 전달하고 자동 카테고라이징
				if (response.data && response.data.picture) {
					// 스토어에 원본 사진 데이터 전달 - 내부적으로 카테고라이징 실행
					setPicturesAndCategorize(albumId, response.data.picture);
					setAllPhotos(response.data.picture);
				}

				setIsLoading(false);
			} catch (error) {
				navigate("/main");
			}
		};

		fetchData();
	}, [albumId]);

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

	const handleClick = () => {
		openModal("앨범 삭제");
	};

	const handleSettingClick = () => {
		openModal("설정");
	};

	return (
		<>
			<Header />
			<Card />
			<div className="m-4 mt-6">
				<div className="ml-4 font-sans text-md">카테고리 </div>
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
			{/* <div className="m-4 mt-6">
				<div className="ml-4 font-sans text-md">하이라이트 </div>
			</div> */}
			<div className="m-4 mt-6">
				<div className="ml-4 font-sans text-md">검토해줘 </div>

				<div className="m-4">
					<button
						className="flex items-center justify-between w-full bg-gray-100 border-0 border-b border-gray-200 focus:outline-none"
						onClick={() => navigate(`/album/${albumId}/중복`)}>
						<div className="flex items-center">
							<div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-4 rounded-lg bg-gray-50">
								<img src={iconDuplicated}></img>
							</div>
							<div className="text-sm text-gray-dark">
								중복된 사진
							</div>
						</div>
						<img className="m-2 size-2" src={Arrow_Right} />
					</button>
				</div>

				<div className="m-4">
					<button
						className="flex items-center justify-between w-full bg-gray-100 border-0 border-b border-gray-200 focus:outline-none"
						onClick={() => navigate(`/album/${albumId}/흔들림`)}>
						<div className="flex items-center">
							<div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-4 rounded-lg bg-gray-50">
								<img src={iconShaky}></img>
							</div>
							<div className="text-sm text-gray-dark">
								흔들린 사진
							</div>
						</div>
						<img className="m-2 size-2" src={Arrow_Right} />
					</button>
				</div>
				<div
					className="m-4 cursor-pointer text-md"
					onClick={handleSettingClick}>
					앨범 설정
				</div>
			</div>
			<FlottingButton albumId={albumId} />

			{/*Modal*/}
			<Modal isOpen={isOpen} onClose={closeModal} title={modalData}>
				{modalData && (
					<AlbumSetting
						albumId={albumId}
						albumName={albumData.title}
						handleDelete={() => {
							deleteAlbum(albumId);
							navigate("/main");
						}}
					/>
				)}
			</Modal>
		</>
	);
};

export default Album;
