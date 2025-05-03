import useMainPageStore from "../stores/mainPageStore";

const AlbumThumbnail = ({ item }) => {
	const hasCoworkers = false;
	const { selectedId, selectItem } = useMainPageStore();
	const handleSelect = () => {
		if (selectedId === item.albumId) {
			console.log("앨범 상세페이지로 이동 : ", item.albumId);
		}
		selectItem(item.albumId);
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
			{selectedId === item.albumId && (
				<div className="absolute inset-0 z-10 bg-black opacity-25"></div>
			)}
			{hasCoworkers ? `<Coworker>` : ""}
		</div>
	);
};
export default AlbumThumbnail;
