import { useEffect, useRef } from "react";

const KakaoMap = () => {
	const mapContainer = useRef(null);
	const KAKAO_API_KEY = "여기에_JavaScript_키_입력";

	useEffect(() => {
		const loadKakaoMap = () => {
			window.kakao.maps.load(() => {
				const options = {
					center: new window.kakao.maps.LatLng(33.450701, 126.570667),
					level: 3,
				};
				new window.kakao.maps.Map(mapContainer.current, options);
			});
		};

		// 카카오 맵 스크립트가 이미 로드되었는지 확인
		if (window.kakao && window.kakao.maps) {
			loadKakaoMap();
		} else {
			const script = document.createElement("script");
			script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=f15dee0d63f581e725ea42d340e6dbb5&autoload=false`;
			script.async = true;

			script.onload = loadKakaoMap;

			document.head.appendChild(script);
		}

		// 컴포넌트 언마운트 시 필요한 정리 작업
		return () => {
			// 필요한 정리 작업 수행
		};
	}, []);

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
