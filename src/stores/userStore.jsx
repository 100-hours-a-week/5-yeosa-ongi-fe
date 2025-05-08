import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { API_BASE_URL } from "../api/config";

const ACCESS_TOKEN_EXPIRY_TIME = 300 * 1000;

const useMemoryAuthStore = create((set, get) => ({
	accessToken: null,
	accessTokenExpiresAt: null,

	// 토큰을 인자로 받아서 액세스 토큰으로 설정하고, 토큰이 존재한다면 현재 시간 + 만료 시간 = 토큰 만료 시각을 설정한다.
	setAccessToken: (token) =>
		set({
			accessToken: token,
			accessTokenExpiresAt: token
				? Date.now() + ACCESS_TOKEN_EXPIRY_TIME
				: null,
		}),

	// 액세스 토큰이 있고, 만료되지 않았다면 반환하고 없다면 null을 반환한다.
	getAccessToken: () => {
		const { accessToken, accessTokenExpiresAt } = get();
		if (
			accessToken &&
			accessTokenExpiresAt &&
			Date.now() < accessTokenExpiresAt
		) {
			return accessToken;
		}
		return null;
	},

	//만료 시간이 지났다면 false를 반환한다.
	isAccessTokenValid: () => {
		const { accessTokenExpiresAt } = get();
		return accessTokenExpiresAt && Date.now() < accessTokenExpiresAt;
	},

	// 액세스 토큰 초기화
	clearAccessToken: () =>
		set({
			accessToken: null,
			accessTokenExpiresAt: null,
		}),
}));

const usePersistAuthStore = create(
	persist(
		(set, get) => ({
			// 토큰 관련 정보 (액세스 토큰 포함)
			refreshToken: null,
			refreshTokenExpiresIn: null,

			user: {
				userId: null,
				nickname: null,
				profileImageURL: null,
				cacheTtl: null,
			},

			isAuthenticated: false,

			setRefreshToken: (token, expiresIn) =>
				set({
					refreshToken: token,
					refreshTokenExpiresIn: expiresIn,
				}),

			setUser: (userData) =>
				set({
					user: {
						...get().user,
						...userData,
					},
				}),

			// authData를 받아서 구조할당 분해로 선언해주고, 메모리에 엑세스 토큰을 저장한다. 나머지는 영속적으로 저장한다.
			login: (authData) => {
				const {
					accessToken,
					refreshToken,
					refreshTokenExpiresIn,
					user,
				} = authData;
				useMemoryAuthStore.getState().setAccessToken(accessToken);
				set({
					refreshToken,
					refreshTokenExpiresIn,
					user,
					isAuthenticated: true,
				});
				console.log("로그인 성공");
			},

			logout: () => {
				useMemoryAuthStore.getState().clearAccessToken();

				set({
					refreshToken: null,
					refreshTokenExpiresIn: null,
					user: {
						userId: null,
						nickname: null,
						profileImageURL: null,
						cacheTtl: null,
					},
					isAuthenticated: false,
				});
				console.log("로그아웃 완료");
			},

			getRefreshToken: () => get().refreshToken,
			getUserId: () => get().user.userId,
			getNickname: () => get().user.nickname,
		}),

		{
			name: "auth-storage",
			storage: createJSONStorage(() => sessionStorage),
			partialize: (state) => ({
				refreshToken: state.refreshToken,
				refreshTokenExpiresIn: state.refreshTokenExpiresIn,
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
		}
	)
);

const useAuthStore = create((set, get) => ({
	getAccessToken: () => useMemoryAuthStore.getState().getAccessToken(),
	setAccessToken: (token) =>
		useMemoryAuthStore.getState().setAccessToken(token),
	isAccessTokenValid: () =>
		useMemoryAuthStore.getState().isAccessTokenValid(),

	getRefreshToken: () => usePersistAuthStore.getState().getRefreshToken(),

	getUser: () => usePersistAuthStore.getState().user,
	setUser: (userData) => usePersistAuthStore.getState().setUser(userData),
	getUserId: () => usePersistAuthStore.getState().getUserId(),
	getNickname: () => usePersistAuthStore.getState().getNickname(),

	isAuthenticated: () => usePersistAuthStore.getState().isAuthenticated,

	login: (authData) => {
		usePersistAuthStore.getState().login(authData);
	},

	logout: () => {
		usePersistAuthStore.getState().logout();
	},

	// 액세스 토큰 갱신 함수
	// 리프레시 토큰을 가져온 후 없다면 로그아웃 한다.. 있다면, 가져와서 API 호출을 한다.
	refreshAccessToken: async () => {
		const refreshToken = usePersistAuthStore.getState().getRefreshToken();
		if (!refreshToken) {
			console.error("리프레시 토큰이 없습니다.");
			usePersistAuthStore.getState().logout();
			return false;
		}

		try {
			const response = await fetch(API_BASE_URL + `/api/auth/refresh`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					refreshToken: refreshToken,
				}),
			});

			if (!response.ok) {
				throw new Error("토큰 갱신 실패");
			}

			const result = await response.json();
			console.log(result);
			useMemoryAuthStore
				.getState()
				.setAccessToken(result.data.accessToken);
			console.log(
				"액세스 토큰 갱신 성공",
				useMemoryAuthStore.getState().getAccessToken()
			);
			return true;
		} catch (error) {
			console.error("액세스 토큰 갱신 실패:", error);
			usePersistAuthStore.getState().logout();
			return false;
		}
	},
}));

export default useAuthStore;
