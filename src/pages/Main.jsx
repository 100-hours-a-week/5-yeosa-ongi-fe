import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAlbumData } from "../api/albums/albumMonthly";
import AlbumListHeader from "../components/AlbumListHeader";
import FlottingButton from "../components/FlottingButton";
import Header from "../components/Header";
import KaKaoMap from "../components/Map";
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
		let isMounted = true;
		const loadInitialData = async () => {
			try {
				setIsInitialLoading(true);
				const result = await fetchAlbumData(null);

				if (isMounted) {
					console.log("초기 데이터 로드:", result);
					setAlbums(result.data.albums);
					setNextYearMonth(result.data.nextYearMonth);
					setHasNext(result.data.hasNext === "true");
				}
			} catch (error) {
				console.error("초기 데이터 로딩 오류:", error);
			} finally {
				if (isMounted) {
					setIsInitialLoading(false);
				}
			}
		};
		loadInitialData();

		return () => {
			isMounted = false;
		};
	}, []);

	const fetchMoreAlbums = useCallback(async () => {
		const response = await fetchAlbumData(nextYearMonth);
		const result = await response.json;
		console.log(result);
		addAlbums(result.data);
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
					style={{ height: "calc(80vw)" }}>
					<KaKaoMap />
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
					{/* Intersection Observer 관찰 대상 (페이지 하단에 위치) */}
					<div ref={observerRef} style={{ height: "10px" }} />
				</div>
			</div>
			<FlottingButton />
		</div>
	);
};

export default Main;
