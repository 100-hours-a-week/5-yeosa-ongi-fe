import { authenticatedFetch } from "../auth/authUtils";
import { API_BASE_URL } from "../config";

const comfirmInvite = async (inviteToken) => {
    try {
        const apiUrl = API_BASE_URL + `/api/album/invite?inviteToken=${inviteToken}`;
        return await authenticatedFetch(apiUrl, { method: 'POST' });
    } catch (error) {
        console.error('앨범 초대 실패:', error);
        throw error;
    }
}

export { comfirmInvite };
