import { ApiResponse } from '../types'
import { authenticatedFetch } from './authUtils'
import { API_BASE_URL } from './config'

/**
 * 앨범 권한 확인
 * @param albumId
 * @returns
 */
export const getAlbumAccess = async (albumId: string): Promise<ApiResponse> => {
    try {
        const apiUrl = API_BASE_URL + `/api/album/${albumId}/role`
        return await authenticatedFetch(apiUrl, { method: 'GET' })
    } catch (error) {
        console.error('앨범 권한 확인 실패:', (error as Error).message)
        throw error
    }
}

/**
 * 앨범 사진 추가
 * @param albumId: number
 * @param albumData
 * @returns
 */
export const addAlbumPicture = async (albumId: number, albumData: any): Promise<ApiResponse> => {
    try {
        const apiUrl = API_BASE_URL + `/api/album/${albumId}`
        return await authenticatedFetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify(albumData),
        })
    } catch (error) {
        console.error('앨범 사진 추가 실패:', (error as Error).message)
        throw error
    }
}

export const changeAlbumName = async (albumId: string, albumName: string) => {
    try {
        const apiUrl = API_BASE_URL + `/api/album/${albumId}`
        return await authenticatedFetch(apiUrl, {
            method: 'PUT',
            body: JSON.stringify({ albumName: albumName }),
        })
    } catch (error) {
        console.error('앨범 이름 수정 실패:', (error as Error).message)
        throw error
    }
}

/**
 * 앨범 생성
 * @param data
 * @returns
 */
export const createAlbum = async (data: any): Promise<ApiResponse> => {
    try {
        const apiUrl = API_BASE_URL + `/api/album`
        return await authenticatedFetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify(data),
        })
    } catch (error) {
        console.error('앨범 생성 실패:', (error as Error).message)
        throw error
    }
}

/**
 * 앨범 삭제
 * @param albumId
 * @returns
 */
export const deleteAlbum = async (albumId: string): Promise<ApiResponse> => {
    try {
        const apiUrl = API_BASE_URL + `/api/album/${albumId}`
        return await authenticatedFetch(apiUrl, { method: 'DELETE' })
    } catch (error) {
        console.error('앨범 삭제 요청 실패:', (error as Error).message)
        throw error
    }
}

export const fetchAlbumData = async (yearMonth: string): Promise<ApiResponse> => {
    try {
        const apiUrl = API_BASE_URL + `/api/album/monthly${yearMonth ? '?yearMonth=' + yearMonth : ''}`
        return await authenticatedFetch(apiUrl, { method: 'GET' })
    } catch (error) {
        console.error('앨범 데이터 Fetch 실패:', (error as Error).message)
        throw error
    }
}

export const getAlubmSummary = async (albumId: string): Promise<ApiResponse> => {
    try {
        const apiUrl = API_BASE_URL + `/api/album/${albumId}/summary`
        return await authenticatedFetch(apiUrl, { method: 'GET' })
    } catch (error) {
        console.error('앨범 요약 정보 조회 요청 실패:', error as Error)
        throw error
    }
}

/**
 * 앨범 상세 정보 조회
 * @param albumId
 * @returns
 */
export const getAlbumDetail = async (albumId: string): Promise<ApiResponse> => {
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
export const getCoworkersList = async (albumId: string): Promise<ApiResponse> => {
    try {
        const apiUrl = API_BASE_URL + `/api/album/${albumId}/members`
        return await authenticatedFetch(apiUrl, { method: 'GET' })
    } catch (error) {
        console.error('앨범 공동작업자 목록 조회:', (error as Error).message)
        throw error
    }
}

/**
 * 공동 작업자 초대 링크 생성
 * @param albumId
 * @returns
 */
export const getSharingLink = async (albumId: string): Promise<ApiResponse> => {
    try {
        const apiUrl = API_BASE_URL + `/api/album/${albumId}/invite/link`
        return await authenticatedFetch(apiUrl, { method: 'POST' })
    } catch (error) {
        console.error('앨범 공유 링크 생성 요청 실패:', (error as Error).message)
        throw error
    }
}

/**
 * 공동 작업자 추가
 * @param inviteToken
 * @returns
 */
export const comfirmInvite = async (inviteToken: string): Promise<ApiResponse> => {
    try {
        const apiUrl = API_BASE_URL + `/api/album/invite?inviteToken=${inviteToken}`
        return await authenticatedFetch(apiUrl, { method: 'POST' })
    } catch (error) {
        console.error('앨범 초대 실패:', (error as Error).message)
        throw error
    }
}

/**
 * 공동 작업자 삭제
 * @param albumId
 * @param userId
 * @returns
 */
export const deleteCoworker = async (albumId: number, userId: number): Promise<ApiResponse> => {
    try {
        const apiUrl = API_BASE_URL + `/api/album/${albumId}/members/${userId}`
        return await authenticatedFetch(apiUrl, { method: 'DELETE' })
    } catch (error) {
        console.error('앨범 공동작업자 삭제 실패:', (error as Error).message)
        throw error
    }
}

export const getPreSignedUrl = async (pictures: any): Promise<ApiResponse> => {
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
