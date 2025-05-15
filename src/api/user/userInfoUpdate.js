import { authenticatedFetch } from "../auth/authUtils";
import { API_BASE_URL } from "../config";

const updateUserInfo = async (userId, userInfo) => {
    try {
        const apiUrl = API_BASE_URL + `/api/user/${userId}`;
        return await authenticatedFetch(apiUrl, { method: 'PUT', body: JSON.stringify(userInfo) });
    } catch (error) {
        console.error('유저 정보 업데이트 실패:', error.message);
        throw error;
    }
};

export { updateUserInfo };
