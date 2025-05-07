import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

let inMemoryToken = null;

const useAuthStore = create(
	persist(
		(set, get) => ({
			// 토큰 관련 정보
			tokens: {
				accessToken: null,
				refreshToken: null,
				refreshTokenExpiresIn: null,
			},

			// 사용자 정보
			user: {
				userId: null,
				nickname: null,
				profileImageURL: null,
				cacheTtl: null,
			},

			isAuthenticated: false,
			setAccessToken: (token) => {
				inMemoryToken = token;
			},

			getAccessToken: () => inMemoryToken,

			// 토큰 정보만 업데이트
			setTokens: (tokenData) =>
				set({
					tokens: {
						...get().tokens,
						...tokenData,
					},
				}),

			// 사용자 정보만 업데이트
			setUser: (userData) =>
				set({
					user: {
						...get().user,
						...userData,
					},
				}),

			login: (authData) => {
				const {
					accessToken,
					refreshToken,
					refreshTokenExpiresIn,
					user,
				} = authData;

				// 메모리에 액세스 토큰 저장
				inMemoryToken = accessToken;

				// 나머지 정보는 영속적 저장소에 저장
				set({
					tokens: {
						refreshToken,
						refreshTokenExpiresIn,
					},
					user,
					isAuthenticated: true,
				});
			},

			// 로그아웃 처리
			logout: () =>
				set({
					tokens: {
						accessToken: null,
						refreshToken: null,
						refreshTokenExpiresIn: null,
					},
					user: {
						userId: null,
						nickname: null,
						profileImageURL: null,
						cacheTtl: null,
					},
					isAuthenticated: false,
				}),

			getRefreshToken: () => get().tokens.refreshToken,
			getUserId: () => get().user.userId,
			getNickname: () => get().user.nickname,
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => sessionStorage),
		}
	)
);

export default useAuthStore;
