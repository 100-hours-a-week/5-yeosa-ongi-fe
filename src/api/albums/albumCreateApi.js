import useAuthStore from "../../stores/userStore";
import { API_BASE_URL } from "../config";

const createAlbum = async (data) => {
    const accessToken = useAuthStore.getState().getAccessToken();
    //console.log(accessToken);
    try {

        const apiUrl = API_BASE_URL + `/api/album/monthly${yearMonth ? '?yearMonth=' + yearMonth : ''}`;
        //console.log(apiUrl);

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: { data }
        };
        const response = await fetch(apiUrl, requestOptions);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP 에러! 상태: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('앨범 데이터 Fetch 실패:', error.message);
    }
}

export { createAlbum };
