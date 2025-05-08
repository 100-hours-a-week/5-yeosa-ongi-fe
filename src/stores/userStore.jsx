import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// 개발 환경 여부 확인 (추후 프로덕션 환경 분기 처리를 위해)
const isDevelopment = process.env.NODE_ENV === "development";

// 액세스 토큰도 영속적으로 관리 (개발 편의를 위해)
const useAuthStore = create(
	persist(
		(set, get) => ({
			// 토큰 관련 정보 (액세스 토큰 포함)
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

			// 액세스 토큰 설정 (상태에 저장)
			setAccessToken: (token) =>
				set({
					tokens: {
						...get().tokens,
						accessToken: token,
					},
				}),

			// 액세스 토큰 가져오기 (상태에서 가져옴)
			getAccessToken: () => get().tokens.accessToken,

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

			// 로그인 처리 (액세스 토큰도 상태에 저장)
			login: (authData) => {
				const {
					accessToken,
					refreshToken,
					refreshTokenExpiresIn,
					user,
				} = authData;

				// 개발 환경에서는 모든 토큰 정보를 영속적으로 저장
				set({
					tokens: {
						accessToken, // 액세스 토큰도 저장
						refreshToken,
						refreshTokenExpiresIn,
					},
					user,
					isAuthenticated: true,
				});

				console.log("로그인 성공:", {
					accessToken,
					refreshToken,
					user,
				});
			},

			// 로그아웃 처리
			logout: () => {
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
				});

				console.log("로그아웃 완료");
			},

			// 기타 getter 함수들
			getRefreshToken: () => get().tokens.refreshToken,
			getUserId: () => get().user.userId,
			getNickname: () => get().user.nickname,

			// 개발용 디버깅 함수
			_debugState: () => {
				if (isDevelopment) {
					console.log("현재 인증 상태:", {
						tokens: get().tokens,
						user: get().user,
						isAuthenticated: get().isAuthenticated,
					});
				}
			},
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => sessionStorage),
			// 개발 모드에서는 더 상세한 로깅 사용
			debug: isDevelopment,
		}
	)
);

// 개발 환경에서는 전역 객체에 스토어 추가 (콘솔에서 디버깅 용이)
if (isDevelopment && typeof window !== "undefined") {
	window.authStore = useAuthStore;
}

export default useAuthStore;
