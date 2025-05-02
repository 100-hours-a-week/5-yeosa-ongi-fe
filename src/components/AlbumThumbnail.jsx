const AlbumThumbnail = ({ width = 100, height = 100 }) => {
	const hasCoworkers = false;

	return (
		<div className="w-full h-full border border-solid">
			<img
				className="object-cover w-full h-full"
				src="public/default-featured-image.jpg"
				alt="Album thumbnail"
			/>
			{hasCoworkers ? `<Coworker>` : ""}
		</div>
	);
};
export default AlbumThumbnail;
