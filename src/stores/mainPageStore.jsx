import { create } from "zustand";

const useMainPageStore = create((set) => ({
	selectedId: null, // 현재 선택된 항목의 ID
	selectedAlbumSummary: null,
	// 항목 선택 함수
	setSelectedAlbumSummary: (data) => set({ selectedAlbumSummary: data }),
	selectItem: (id) => set({ selectedId: id }),
	// 선택 취소 함수
	clearSelection: () => set({ selectedId: null }),
}));

const useAlbumStore = create((set, get) => ({
	albums: {},
	albumsByMonth: {},

	setAlbums: (albumData) => {
		const albums = {};
		const albumsByMonth = {};

		albumData.forEach((album) => {
			const date = new Date(album.createdAt);
			const monthKey = `${date.getFullYear()}-${String(
				date.getMonth() + 1
			).padStart(2, "0")}`;

			if (!albumsByMonth[monthKey]) {
				albumsByMonth[monthKey] = [];
			}
			albums[album.albumId] = {
				albumName: album.albumName,
				thumbnailURL: album.thumbnailURL,
				createdAt: album.createdAt,
				memberProfileImageURL: album.memberProfileImageURL,
			};
			albumsByMonth[monthKey].push(album.albumId);
		});
		// console.log(albums);
		// console.log(albumsByMonth);
		set({
			albums,
			albumsByMonth,
		});
	},
	addAlbums: (albumData) => {
		// 현재 상태 가져오기
		const { albums, albumsByMonth } = get();

		// 새로운 앨범 데이터와 기존 데이터를 병합할 객체 생성
		const updatedAlbums = { ...albums };
		const updatedAlbumsByMonth = { ...albumsByMonth };

		// 새 앨범 데이터 처리
		albumData.forEach((album) => {
			const date = new Date(album.createdAt);
			const monthKey = `${date.getFullYear()}-${String(
				date.getMonth() + 1
			).padStart(2, "0")}`;

			// 해당 월이 없으면 생성
			if (!updatedAlbumsByMonth[monthKey]) {
				updatedAlbumsByMonth[monthKey] = [];
			}

			// 앨범 객체 추가
			updatedAlbums[album.albumId] = {
				albumName: album.albumName,
				thumbnailURL: album.thumbnailURL,
				createdAt: album.createdAt,
				memberProfileImageURL: album.memberProfileImageURL,
			};

			// 앨범 ID가 해당 월에 없는 경우에만 추가 (중복 방지)
			if (!updatedAlbumsByMonth[monthKey].includes(album.albumId)) {
				updatedAlbumsByMonth[monthKey].push(album.albumId);
			}
		});

		// console.log("추가된 앨범:", updatedAlbums);

		// 상태 업데이트
		set({
			albums: updatedAlbums,
			albumsByMonth: updatedAlbumsByMonth,
		});

		// 새로 추가된 월 키 반환 (필요시 활용 가능)
		return Object.keys(updatedAlbumsByMonth).filter(
			(key) => !Object.keys(albumsByMonth).includes(key)
		);
	},
}));

export { useAlbumStore, useMainPageStore };
