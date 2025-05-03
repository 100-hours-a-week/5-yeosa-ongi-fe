import { useEffect } from "react";
import { fetchAlbumData } from "../api/mock/album";
import AlbumListHeader from "../components/\bAlbumListHeader";
import FlottingButton from "../components/FlottingButton";
import Header from "../components/Header";
import Month from "../components/Month";
import { useAlbumStore } from "../stores/mainPageStore";

const Main = () => {
	const { albumsByMonth, setAlbums } = useAlbumStore();

	// Mount
	useEffect(() => {
		const response = fetchAlbumData();
		setAlbums(response.data.albums);
	}, []);

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
					{Object.keys(albumsByMonth).map((month, index) => (
						<Month
							key={month}
							title={month}
							albumIds={albumsByMonth[month]}
						/>
					))}
				</div>
			</div>
			<FlottingButton />
		</div>
	);
};

export default Main;
