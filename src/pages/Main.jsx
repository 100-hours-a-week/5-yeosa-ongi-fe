import getMonthlyAlbum from "../../mock/getMonthlyAlbum.json";
import AlbumListHeader from "../components/\bAlbumListHeader";
import FlottingButton from "../components/FlottingButton";
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
					className="border-t border-solid"
					style={{ height: "calc(80vw)" }}>
					지도
				</div>
				<AlbumListHeader />
				<div
					className="overflow-y-auto"
					style={{ height: "calc(100vh - 80vw - 160px)" }}>
					{Object.keys(result).map((month, index) => (
						<Month key={month} albums={result[month]} />
					))}
				</div>
			</div>
			<FlottingButton />
		</div>
	);
};

export default Main;
