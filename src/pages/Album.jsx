import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAlbumDetail } from "../api/albums/albumDetail";
import Card from "../components/Album/Card";
import Category from "../components/Album/Category";
import Header from "../components/common/Header";

//Assets
import { deleteAlbum } from "../api/albums/albumDeleteApi";
import Arrow_Right from "../assets/icons/Arrow Right.png";
import iconDuplicated from "../assets/icons/icon_duplicated.png";
import iconShaky from "../assets/icons/icon_shaky.png";
import { Modal } from "../components/common/Modal";
import useModal from "../hooks/useModal";
import useCollectionStore from "../stores/collectionStore";

const Album = () => {
	const navigate = useNavigate();
	const { albumId } = useParams();
	const [albumData, setAlbumData] = useState();
	const [isLoading, setIsLoading] = useState(true);
	const { isOpen, modalData, openModal, closeModal } = useModal();
	const [category, setCategory] = useState({});

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
				<div className="m-4 cursor-pointer" onClick={handleClick}>
					앨범 삭제하기
				</div>
			</div>
			{/*Modal*/}
			<Modal isOpen={isOpen} onClose={closeModal} title={modalData}>
				{modalData && (
					<div>
						<p>앨범을 삭제하시겠습니까?</p>
						<p>삭제된 앨범은 복구할 수 없습니다.</p>
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
									deleteAlbum(albumId);
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

export default Album;
