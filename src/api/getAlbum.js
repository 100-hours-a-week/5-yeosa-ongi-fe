import { API_BASE_URL } from "../config";

const fetchAlbumData = async (yearMonth) => {
    try {
        const apiUrl = API_BASE_URL + `/api/album/monthly?yearMonth=
        ${yearMonth}`;
        const requestOptions = {
            method: 'GET',
        };
        const response = await fetch(apiUrl, requestOptions);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP 에러! 상태: ${response.status}`);
        }
    } catch (error) {
        console.error('앨범 데이터 Fetch 실패:', error.message);
    }
}