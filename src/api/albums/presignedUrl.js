import useAuthStore from "../../stores/userStore";
import { API_BASE_URL } from "../config";

const getPreSignedUrl = async (pictures) => {
    const accessToken = useAuthStore.getState().getAccessToken();
    try {

        const apiUrl = API_BASE_URL + `/api/presigned-url`;

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ "pictures": pictures })
        };

        console.log(requestOptions);
        const response = await fetch(apiUrl, requestOptions);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP 에러! 상태: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('앨범 생성 실패:', error);
    }
}

export { getPreSignedUrl };
