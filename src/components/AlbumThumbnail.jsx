import { useAlbumStore, useMainPageStore } from "../stores/mainPageStore";

const AlbumThumbnail = ({ id }) => {
	const hasCoworkers = false;
	const { albums } = useAlbumStore();
	const album = albums[id];
	console.log(album);
	const { selectedId, selectItem } = useMainPageStore();
	const handleSelect = () => {
		if (selectedId === id) {
			console.log("앨범 상세페이지로 이동 : ", id);
		}
		selectItem(id);
	};

	return (
		<div
			className="relative w-full h-full border border-solid"
			onClick={handleSelect}>
			<img
				className="object-cover w-full h-full"
				src="public/default-featured-image.jpg"
				alt="Album thumbnail"
			/>
			{selectedId === id && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-black opacity-55">
					<span className="z-20 text-lg text-white">
						{album.albumName}
					</span>
				</div>
			)}
			{hasCoworkers ? `<Coworker>` : ""}
		</div>
	);
};
export default AlbumThumbnail;
