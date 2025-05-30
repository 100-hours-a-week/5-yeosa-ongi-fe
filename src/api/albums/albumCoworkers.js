import { authenticatedFetch } from "../auth/authUtils";
import { API_BASE_URL } from "../config";

const getCoworkersList = async (albumId) => {
    try {
        const apiUrl = API_BASE_URL + `/api/album/${albumId}/members`;
        return await authenticatedFetch(apiUrl, { method: 'GET' });
    } catch (error) {
        console.error('앨범 공동작업자 목록 조회:', error.message);
        throw error;
    }
}

export default getCoworkersList;