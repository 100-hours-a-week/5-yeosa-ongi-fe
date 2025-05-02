import getMonthlyAlbum from "../../mock/getMonthlyAlbum.json";
import Header from "../components/Header";
import Month from "../components/Month";

const Main = () => {
	const result = {};
	const mockResponse = getMonthlyAlbum;
	const albums = mockResponse.data.albums;
	albums.forEach((album) => {
		const date = new Date(album.createdAt);
		const monthKey = `${date.getFullYear()}-${String(
			date.getMonth() + 1
		).padStart(2, "0")}`;

		if (!result[monthKey]) {
			result[monthKey] = [];
		}
		result[monthKey].push(album);
	});
	console.log(result);
	console.log(Object.keys(result));

	return (
		<div className="h-screen overflow-hidden">
			<Header />
			<div className="flex-col content">
				<div
					className="border-solid border-b-t"
					style={{ height: "calc(80vw)" }}>
					지도
				</div>
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
				<div
					className="overflow-y-auto"
					style={{ height: "calc(100vh - 80vw - 80px)" }}>
					{Object.keys(result).map((month, index) => (
						<Month key={month} albums={result[month]} />
					))}
				</div>
			</div>
		</div>
	);
};

export default Main;
