import { create } from "zustand";

const useCollectionStore = create((set) => ({
	allCollection: null,
	shakyCollection: null,
	duplicatedCollection: null,
	tagCollections: [],

	setShakyCollection: (collection) => set({ shakyCollection: collection }),

	setDuplicatedCollection: (collection) =>
		set({ duplicatedCollection: collection }),

	setAllCollection: (collection) => set({ allCollection: collection }),

	setTagCollections: (collections) => set({ tagCollections: collections }),

	// 여러 컬렉션을 한번에 설정하는 메서드
	setCollection: (collection) =>
		set({
			shakyCollection: collection.shakyCollection,
			duplicatedCollection: collection.duplicatedCollection,
		}),

	// 특정 컬렉션들만 초기화
	resetCollections: () =>
		set({
			shakyCollection: null,
			duplicatedCollection: null,
		}),

	// 모든 컬렉션 초기화
	resetAllCollections: () =>
		set({
			allCollection: null,
			shakyCollection: null,
			duplicatedCollection: null,
			tagCollections: [],
		}),
}));

export default useCollectionStore;
