import getMonthlyAlbum from "../../mock/getMonthlyAlbum.json";
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
		<>
			<div className="h-[80px]">Header</div>
			<div className="flex-col content">
				<div
					className="border-2 border-solid"
					style={{ height: "calc(80vw)" }}>
					지도
				</div>
				<div>앨범 리스트</div>
				<div className="h-[400px] overflow-y-auto">
					{Object.keys(result).map((month, index) => (
						<Month key={month} albums={result[month]} />
					))}
				</div>
			</div>
		</>
	);
};

export default Main;
