import AlbumThumbnail from "../components/AlbumThumbnail";

const Main = () => {
	return (
		<>
			<div className="h-[80px]">Header</div>
			<div className="flex-col content">
				<div className="flex w-full border-2 border-solid">지도</div>
				<div>앨범 리스트</div>
				<AlbumThumbnail></AlbumThumbnail>
			</div>
		</>
	);
};

export default Main;
