import { create } from "zustand";

const useMainPageStore = create((set) => ({
	selectedId: null, // 현재 선택된 항목의 ID
	// 항목 선택 함수
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
		console.log(albums);
		set({
			albums,
			albumsByMonth,
		});
	},
}));

export { useAlbumStore, useMainPageStore };
