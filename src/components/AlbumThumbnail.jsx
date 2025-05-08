import { useNavigate } from "react-router-dom";
import { albumSummary } from "../../mock/getAlbumSummary";
import { useAlbumStore, useMainPageStore } from "../stores/mainPageStore";

const AlbumThumbnail = ({ id }) => {
	const navigate = useNavigate();
	const hasCoworkers = false;
	const { albums } = useAlbumStore();
	const album = albums[id];

	const isSelected = useMainPageStore((state) => state.selectedId === id);
	const selectItem = useMainPageStore((state) => state.selectItem);
	const setSelectedAlbumSummary = useMainPageStore(
		(state) => state.setSelectedAlbumSummary
	);
	const handleSelect = () => {
		if (isSelected) {
			console.log("앨범 상세페이지로 이동 : ", id);
			navigate(`/album/${id}`);
		} else {
			selectItem(id);
			setSelectedAlbumSummary(albumSummary);
		}
	};

	return (
		<div
			className="relative w-full h-full border border-solid"
			onClick={handleSelect}>
			<img
				className="object-cover w-full h-full"
				src={`${album.thumbnailURL}`}
				alt="Album thumbnail"
			/>
			{isSelected && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-black opacity-55">
					<span className="z-20 text-lg text-white">
						{album.albumName}
					</span>
				</div>
			)}
			{album.memberProfileImageURL.length !== 0 && (
				<div className="absolute flex bottom-2 right-2">
					{album.memberProfileImageURL.map((url, index) => (
						<div
							key={index}
							className="overflow-hidden border-2 border-black rounded-full"
							style={{
								width: "24px",
								height: "24px",
								marginLeft: index > 0 ? "-8px" : "0",
								zIndex:
									album.memberProfileImageURL.length - index,
							}}>
							<img
								className="object-cover w-full h-full"
								src={`${url}`}
								alt={`Collaborator ${index + 1}`}
							/>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
export default AlbumThumbnail;
