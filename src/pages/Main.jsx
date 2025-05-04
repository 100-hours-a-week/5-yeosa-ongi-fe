import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAlbumData } from "../api/mock/album";
import AlbumListHeader from "../components/\bAlbumListHeader";
import FlottingButton from "../components/FlottingButton";
import Header from "../components/Header";
import Month from "../components/Month";
import useInfiniteScroll from "../hooks/infiniteScroll";
import { useAlbumStore } from "../stores/mainPageStore";

const Main = () => {
	const { albumsByMonth, setAlbums, addAlbums } = useAlbumStore();

	const [page, setPage] = useState(1); // 현재 페이지 번호

	const [nextYearMonth, setNextYearMonth] = useState(null);

	const scrollContainerRef = useRef(null); // 스크롤 컨테이너

	// Mount
	useEffect(() => {
		const loadInitialData = async () => {
			const response = fetchAlbumData(null);
			setAlbums(response.data.albums);
			setNextYearMonth(response.data.nextYearMonth);
			setHasNext(response.data.hasNext == "true");
		};

		loadInitialData();
	}, []);

	const fetchMoreAlbums = useCallback(async () => {
		const response = fetchAlbumData(nextYearMonth);
		addAlbums(response.data.albums);
		setNextYearMonth(response.data.nextYearMonth);
		return response.data.hasNext === "true";
	}, [nextYearMonth, addAlbums]);

	const { observerRef, isLoading, hasNext, setHasNext } = useInfiniteScroll(
		fetchMoreAlbums,
		true
	);
	return (
		<div className="h-screen overflow-hidden">
			<Header />
			<div className="flex-col content">
				<div
					className="border-t border-solid"
					style={{ height: "calc(80vw)" }}></div>
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
					{/* Intersection Observer 관찰 대상 (페이지 하단에 위치) */}
					<div ref={observerRef} style={{ height: "10px" }} />
				</div>
			</div>
			<FlottingButton />
		</div>
	);
};

export default Main;
