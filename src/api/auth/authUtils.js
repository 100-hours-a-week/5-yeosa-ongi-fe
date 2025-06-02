import useAuthStore from '../../stores/userStore'

// 인증된 API 요청 유틸리티 함수
export const authenticatedFetch = async (url, options = {}) => {
    // 액세스 토큰 가져오기
    let accessToken = useAuthStore.getState().getAccessToken()

    // 액세스 토큰이 없거나 만료된 경우 갱신 시도
    if (!accessToken) {
        const refreshSuccess = await useAuthStore
            .getState()
            .refreshAccessToken()
        if (refreshSuccess) {
            accessToken = useAuthStore.getState().getAccessToken()
        } else {
            throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.')
        }
    }

    // 헤더 준비
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
    }

    // 요청 옵션 준비
    const requestOptions = {
        ...options,
        headers,
    }

    // 요청 실행
    let response = await fetch(url, requestOptions)

    // 401 오류 처리 (액세스 토큰 만료)
    if (response.status === 401) {
        const refreshSuccess = await useAuthStore
            .getState()
            .refreshAccessToken()
        if (refreshSuccess) {
            // 갱신 성공 시 새 액세스 토큰으로 다시 요청
            const newAccessToken = useAuthStore.getState().getAccessToken()
            requestOptions.headers.Authorization = `Bearer ${newAccessToken}`
            response = await fetch(url, requestOptions)
        } else {
            // 갱신 실패 시 오류 발생
            throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.')
        }
    }

    // 응답 상태 확인
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
            errorData.message || `HTTP 에러! 상태: ${response.status}`
        )
    }

    // JSON 응답 파싱
    return await response.json()
}
