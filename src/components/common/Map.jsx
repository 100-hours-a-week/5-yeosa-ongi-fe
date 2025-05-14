import { useEffect, useRef } from "react";
import { useAlbumStore, useMainPageStore } from "../../stores/mainPageStore";

const KakaoMap = () => {
	const mapContainer = useRef(null);
	const mapInstance = useRef(null); // 지도 인스턴스를 저장할 ref

	// useSelectionStore 대신 useMainPageStore 사용
	const selectedId = useMainPageStore((state) => state.selectedId);
	const { albums, albumsByMonth } = useAlbumStore();

	console.log("KakaoMap 렌더링 - selectedId:", selectedId);

	// 지도 이동 함수
	const panTo = (x, y) => {
		if (mapInstance.current) {
			const moveLatLon = new window.kakao.maps.LatLng(x, y);
			mapInstance.current.panTo(moveLatLon);
			console.log("지도 이동:", x, y);
		} else {
			console.log("지도 이동 실패: 맵 인스턴스가 없음");
		}
	};

	// 카카오맵 초기화
	useEffect(() => {
		console.log("카카오맵 초기화 시작");

		const loadKakaoMap = () => {
			window.kakao.maps.load(() => {
				console.log("카카오맵 API 로드됨");
				const options = {
					center: new window.kakao.maps.LatLng(33.450701, 126.570667), // 판교 기본 위치로 설정
					level: 3,
				};
				// 지도 인스턴스 생성 및 저장
				mapInstance.current = new window.kakao.maps.Map(
					mapContainer.current,
					options
				);
				console.log("지도 인스턴스 생성 완료");

				// 맵 로드 후 선택된 ID가 있으면 해당 위치로 이동
				if (selectedId) {
					console.log("초기화 후 선택된 ID 처리:", selectedId);
					handleSelectedIdChange();
				}
			});
		};

		// 카카오 맵 스크립트가 이미 로드되었는지 확인
		if (window.kakao && window.kakao.maps) {
			loadKakaoMap();
		} else {
			console.log("카카오맵 스크립트 로드 중...");
			const script = document.createElement("script");
			script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=f15dee0d63f581e725ea42d340e6dbb5&autoload=false`;
			script.async = true;
			script.onload = () => {
				console.log("카카오맵 스크립트 로드 완료");
				loadKakaoMap();
			};
			document.head.appendChild(script);
		}

		return () => {
			console.log("카카오맵 컴포넌트 언마운트");
		};
	}, []);

	// 선택된 ID에 따른 지도 이동 로직
	const handleSelectedIdChange = () => {
		console.log("handleSelectedIdChange 실행, selectedId:", selectedId);

		if (!selectedId) {
			console.log("선택된 ID 없음");
			return;
		}

		if (!mapInstance.current) {
			console.log("맵 인스턴스 없음");
			return;
		}

		// 앨범 데이터 확인
		console.log("앨범 데이터:", albums);
		const selectedAlbum = albums[selectedId];

		if (
			selectedAlbum &&
			selectedAlbum.latitude &&
			selectedAlbum.longitude
		) {
			console.log(
				"앨범 위치로 이동:",
				selectedAlbum.latitude,
				selectedAlbum.longitude
			);
			panTo(selectedAlbum.latitude, selectedAlbum.longitude);
		} else {
			// 위치 정보가 없는 경우, 앨범 데이터에서 monthData를 통해 찾아보기
			console.log("앨범의 위치 정보가 없어 monthData에서 찾는 중...");
			let foundAlbum = null;

			// 모든 monthData에서 해당 ID 찾기
			for (const monthKey in albumsByMonth) {
				const albumIds = albumsByMonth[monthKey];
				if (albumIds.includes(selectedId)) {
					// 앨범 ID를 찾았지만 위치 정보를 추가로 확인해야 함
					// 백엔드에서 위치 정보를 가져오는 로직이 필요할 수 있음
					console.log(
						"앨범 ID를 찾았지만 위치 정보가 없음:",
						selectedId
					);
					break;
				}
			}

			// 위치 정보를 찾지 못했으므로 기본 위치로 이동
			console.log("위치 정보를 찾을 수 없어 기본 위치로 이동");
			panTo(37.40019, 127.1068);
		}
	};

	// 선택된 ID가 변경될 때 지도 이동
	useEffect(() => {
		console.log("selectedId useEffect 실행:", selectedId);

		if (selectedId) {
			handleSelectedIdChange();
		}
	}, [selectedId]);

	return (
		<div className="h-full">
			<div
				className="size-fit"
				ref={mapContainer}
				style={{ width: "100%", height: "100%" }}></div>
		</div>
	);
};

export default KakaoMap;
