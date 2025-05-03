import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAlbumData } from "../api/mock/album";
import AlbumListHeader from "../components/\bAlbumListHeader";
import FlottingButton from "../components/FlottingButton";
import Header from "../components/Header";
import Month from "../components/Month";
import { useAlbumStore } from "../stores/mainPageStore";

const Main = () => {
	const { albumsByMonth, setAlbums, addAlbums } = useAlbumStore();

	const [page, setPage] = useState(1); // 현재 페이지 번호
	const [isLoading, setIsLoading] = useState(false); // 로딩 상태
	const [hasMore, setHasMore] = useState(true);

	const scrollContainerRef = useRef(null); // 스크롤 컨테이너
	const observerRef = useRef(null); // Intersection Observer 타겟

	let nextYearMonth;
	// Mount
	useEffect(() => {
		const loadInitialData = async () => {
			// 첫 페이지 데이터 로드 (fetchAlbumData 함수가 페이지 번호를 받도록 수정 필요)
			const response = fetchAlbumData();
			setAlbums(response.data.albums);
			setHasMore(response.hasNext || false);
			nextYearMonth = response.nextYearMonth;
		};

		loadInitialData();
	}, []);

	const loadMoreData = useCallback(async () => {
		try {
			setIsLoading(true);
			const response = fetchAlbumData(nextYearMonth); // 다음 페이지 데이터 요청
			addAlbums(response.data);
			nextYearMonth = response.nextYearMonth;
			setHasNext(response.data.hasNext || false);
		} catch (error) {
			console.error("데이터 로드 실패:", error);
		} finally {
			setIsLoading(false);
		}
	}, [page, isLoading, hasMore, addAlbums]);

	useEffect(() => {
		// Observer 인스턴스 생성
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !isLoading) {
					loadMoreData(); // 추가 데이터 로드
				}
			},
			{ threshold: 0.5 } // 50% 이상 화면에 보일 때 콜백 실행
		);

		// 관찰 대상 요소가 있으면 관찰 시작
		const currentObserver = observerRef.current;
		if (currentObserver) {
			observer.observe(currentObserver);
		}

		// 컴포넌트 언마운트 시 Observer 정리
		return () => {
			if (currentObserver) {
				observer.unobserve(currentObserver);
			}
		};
	}, [loadMoreData, hasMore, isLoading]); // 의존성 배열

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
					{/* Intersection Observer 관찰 대상 (페이지 하단에 위치) */}
					<div ref={observerRef} style={{ height: "10px" }} />
				</div>
			</div>
			<FlottingButton />
		</div>
	);
};

export default Main;
