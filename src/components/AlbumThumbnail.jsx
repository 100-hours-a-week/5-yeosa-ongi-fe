const AlbumThumbnail = ({ width = 100, height = 100 }) => {
	const hasCoworkers = false;

	return (
		<div className="w-full h-full border-[5px] border-solid">
			<img
				className="object-cover w-full h-full"
				src="public/default_image_no_image.jpg"
				alt="Album thumbnail"
			/>
			{hasCoworkers ? `<Coworker>` : ""}
		</div>
	);
};
export default AlbumThumbnail;
