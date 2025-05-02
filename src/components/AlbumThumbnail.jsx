const AlbumThumbnail = () => {
	const hasCoworkes = false;
	return (
		<div>
			<img></img>
			{hasCoworkes ? `<Coworker>` : ""}
		</div>
	);
};
export default AlbumThumbnail;
