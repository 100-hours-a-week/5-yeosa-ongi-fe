const AlbumListHeader = () => {
	return (
		<div className="h-[48px] relative rounded-t-2xl border-t-2 border-solid mb-8">
			<div className="p-4">
				<div className="absolute flex flex-row gap-2">
					<img
						className="size-[24px]"
						src="src/assets/icons/images_icon.png"></img>
					<div>00</div>
				</div>
				<div className="absolute flex flex-row gap-2 left-1/4">
					<img
						className="size-[24px]"
						src="src/assets/icons/location_icon.png"></img>
					<div>00</div>
				</div>
				<div className="absolute flex flex-row gap-2 right-4">
					<div>community</div>
					<img
						className="size-[24px]"
						src="src/assets/icons/community_icon.png"></img>
				</div>
			</div>
		</div>
	);
};

export default AlbumListHeader;
