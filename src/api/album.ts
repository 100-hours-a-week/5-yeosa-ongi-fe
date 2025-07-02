import { APIResponse } from '@/types/api.types'
import { authenticatedFetch } from './authUtils'
import { API_BASE_URL } from './config'

/**
 * 앨범 상세 정보 조회
 * @param albumId
 * @returns
 */
export const getAlbumDetail = async (albumId: string): Promise<APIResponse> => {
    try {
        const apiUrl = API_BASE_URL + `/api/album/${albumId}`
        return await authenticatedFetch(apiUrl, { method: 'GET' })
    } catch (error) {
        console.error('앨범 상세 데이터 Fetch 실패:', (error as Error).message)
        throw error
    }
}

// Coworker =============================================

/**
 * 공동 작업자 목록 조회
 * @param albumId
 * @returns
 */
export const getCoworkersList = async (albumId: string): Promise<APIResponse> => {
    try {
        const apiUrl = API_BASE_URL + `/api/album/${albumId}/members`
        return await authenticatedFetch(apiUrl, { method: 'GET' })
    } catch (error) {
        console.error('앨범 공동작업자 목록 조회:', (error as Error).message)
        throw error
    }
}

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

export const getPreSignedUrl = async (pictures: any): Promise<APIResponse> => {
    try {
        const apiUrl = API_BASE_URL + `/api/presigned-url`
        return await authenticatedFetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify(pictures),
        })
    } catch (error) {
        console.error('presigned URL 발급 실패:', (error as Error).message)
        throw error
    }
}

export const changeClusterTitle = async (albumId: string, clusterId: string, clusterName: string) => {
    try {
        const apiUrl = API_BASE_URL + `/api/album/${albumId}/cluster/${clusterId}`
        return await authenticatedFetch(apiUrl, {
            method: 'PATCH',
            body: JSON.stringify({ clusterName: clusterName }),
        })
    } catch (error) {
        console.error('클러스터 이름 수정 실패:', (error as Error).message)
        throw error
    }
}
