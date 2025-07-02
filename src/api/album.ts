import { APIResponse } from '@/types/api.types'
import { authenticatedFetch } from './authUtils'
import { API_BASE_URL } from './config'

/**
 * 공동 작업자 추가
 * @param inviteToken
 * @returns
 */
export const comfirmInvite = async (inviteToken: string): Promise<APIResponse> => {
    try {
        const apiUrl = API_BASE_URL + `/api/album/invite?inviteToken=${inviteToken}`
        return await authenticatedFetch(apiUrl, { method: 'POST' })
    } catch (error) {
        console.error('앨범 초대 실패:', (error as Error).message)
        throw error
    }
}

