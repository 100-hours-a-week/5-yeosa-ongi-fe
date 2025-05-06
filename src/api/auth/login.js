
export const kakaoLogin = async () => {
    try {
        console.log("dddd");
        const apiUrl = "/api/auth";
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors'
        };
        const response = await fetch(apiUrl, requestOptions);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP 에러! 상태: ${response.status}`);
        }
    } catch (error) {
        console.error('로그인 실패:', error.message);
    }
}