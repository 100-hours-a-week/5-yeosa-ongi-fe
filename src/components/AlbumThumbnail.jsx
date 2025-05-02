const AlbumThumbnail = () => {
	const hasCoworkes = false;
	return (
		<div className="w-[100px]">
			<img src="public/default_image_no_image.jpg"></img>
			{hasCoworkes ? `<Coworker>` : ""}
		</div>
	);
};
export default AlbumThumbnail;
