const AlbumThumbnail = ({ width = 100, hieght = 100 }) => {
	const hasCoworkes = false;
	return (
		<div
			className={`w-[${width}px] h-[${hieght}px] border-[5px] border-solid`}>
			<img
				className="object-cover w-full h-full"
				src="public/default_image_no_image.jpg"
				alt="Album thumbnail"
			/>
			{hasCoworkes ? `<Coworker>` : ""}
		</div>
	);
};
export default AlbumThumbnail;
