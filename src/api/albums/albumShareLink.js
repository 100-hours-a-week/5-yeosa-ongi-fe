import { authenticatedFetch } from "../auth/authUtils";
import { API_BASE_URL } from "../config";

const getSharingLink = async (albumId) => {
    try {
        const apiUrl = API_BASE_URL + `/api/album/${albumId}/invite/link`;
        return await authenticatedFetch(apiUrl, { method: 'POST' });
    } catch (error) {
        console.error('앨범 공유 링크 생성 요청 실패:', error.message);
        throw error;
    }

}

export { getSharingLink };
