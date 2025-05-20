import { create } from "zustand";

const useCollectionStore = create((set, get) => ({
	// 기본 상태
	currentAlbumId: null,
	rawPictures: [],
	allCollection: null,
	shakyCollection: null,
	duplicatedCollection: null,
	tagCollections: [],

	// 원본 사진 데이터 설정 및 자동 카테고라이징
	setPicturesAndCategorize: (albumId, pictures) => {
		if (!pictures || pictures.length === 0) return;

		set({ currentAlbumId: albumId, rawPictures: pictures });

		// 카테고라이징 로직 실행
		get().categorizePhotos();
	},

	// 카테고라이징 함수
	categorizePhotos: () => {
		const { rawPictures } = get();

		if (!rawPictures || rawPictures.length === 0) return;

		// 모든 태그 추출
		const uniqueTags = [
			...new Set(rawPictures.map((pic) => pic.tag).filter(Boolean)),
		];

		// 전체 컬렉션
		const allCollection = {
			name: "전체",
			pictures: rawPictures,
			count: rawPictures.length,
		};

		// 중복 컬렉션
		const duplicatedCollection = {
			name: "중복",
			pictures: rawPictures.filter((pic) => pic.isDuplicated),
			count: rawPictures.filter((pic) => pic.isDuplicated).length,
		};

		// 흔들림 컬렉션
		const shakyCollection = {
			name: "흔들림",
			pictures: rawPictures.filter((pic) => pic.isShaky),
			count: rawPictures.filter((pic) => pic.isShaky).length,
		};

		// 태그별 컬렉션
		const tagCollections = uniqueTags.map((tag) => ({
			name: tag.trim(),
			pictures: rawPictures.filter((pic) => pic.tag === tag),
			count: rawPictures.filter((pic) => pic.tag === tag).length,
		}));

		// 상태 업데이트
		set({
			allCollection,
			duplicatedCollection,
			shakyCollection,
			tagCollections,
		});
	},

	// 사진 삭제 처리 함수
	removePictures: (pictureIds) => {
		set((state) => {
			// 원본 사진 배열에서 삭제된 사진 제거
			const updatedRawPictures = state.rawPictures.filter(
				(p) => !pictureIds.includes(p.pictureId)
			);

			// 업데이트된 원본 사진으로 상태 설정
			return { rawPictures: updatedRawPictures };
		});

		// 카테고라이징 다시 실행하여 모든 컬렉션 업데이트
		get().categorizePhotos();
	},

	// 컬렉션 가져오기 함수 (선택기 역할)
	getCollectionByName: (collectionName) => {
		const state = get();

		if (collectionName === "전체") return state.allCollection;
		if (collectionName === "흔들림") return state.shakyCollection;
		if (collectionName === "중복") return state.duplicatedCollection;

		return state.tagCollections.find((c) => c.name === collectionName);
	},

	// 모든 컬렉션 초기화
	resetAllCollections: () =>
		set({
			currentAlbumId: null,
			rawPictures: [],
			allCollection: null,
			shakyCollection: null,
			duplicatedCollection: null,
			tagCollections: [],
		}),
}));

export default useCollectionStore;
