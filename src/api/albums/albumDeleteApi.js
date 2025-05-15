import { authenticatedFetch } from "../auth/authUtils";
import { API_BASE_URL } from "../config";

const deleteAlbum = async (albumId) => {
    try {
        const apiUrl = API_BASE_URL + `/api/album/${albumId}`;
        return await authenticatedFetch(apiUrl, { method: 'DELETE' });
    } catch (error) {
        console.error('앨범 삭제 요청 실패:', error.message);
        throw error;
    }

}

export { deleteAlbum };
