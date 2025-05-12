import { useEffect, useState } from "react";
import getTotalData from "../api/totalData";
import communityIcon from "../assets/icons/community_icon.png";
import albumIcon from "../assets/icons/images_icon.png";
import locationIcon from "../assets/icons/location_icon.png";

const AlbumListHeader = () => {
	const [counts, setCounts] = useState({
		albums: 0,
		locations: 0,
	});

	useEffect(() => {
		const loadInitialData = async () => {
			try {
				const result = await getTotalData();
				console.log("리스트 헤더", result.data);
				setCounts({
					albums: result.data.albumCount || 0,
					locations: result.data.locationCount || 0,
				});
			} catch (error) {
				console.error(error);
			}
		};

		// Call the function immediately
		loadInitialData();
		// No need to call it again here
	}, []);

	return (
		<div className="h-[48px] relative border-t-2 border-solid mb-8">
			<div className="p-4">
				<div className="absolute flex flex-row gap-2">
					<img
						className="size-[24px]"
						src={albumIcon}
						alt="Album icon"
					/>
					<div>{counts.albums}</div>
				</div>
				<div className="absolute flex flex-row gap-2 left-1/4">
					<img
						className="size-[24px]"
						src={locationIcon}
						alt="Location icon"
					/>
					<div>{counts.locations}</div>
				</div>
				<div className="absolute flex flex-row gap-2 right-4">
					<div>community</div>
					<img
						className="size-[24px]"
						src={communityIcon}
						alt="Community icon"
					/>
				</div>
			</div>
		</div>
	);
};

export default AlbumListHeader;
