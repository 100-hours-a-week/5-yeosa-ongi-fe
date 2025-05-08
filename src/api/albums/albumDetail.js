import useAuthStore from "../../stores/userStore";
import { API_BASE_URL } from "../config";


const getAlbumDetail = async (albumId) => {
    const accessToken = useAuthStore.getState().getAccessToken();
    try {
        const apiUrl = API_BASE_URL + `/api/album/${albumId}`;

        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        };
        const response = await fetch(apiUrl, requestOptions);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP 에러! 상태: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('앨범 상세 정보 실패:', error.message);
    }

}

export { getAlbumDetail };
