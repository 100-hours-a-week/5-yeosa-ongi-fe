import { APIResponse } from '@/types/api.types'
import APIBuilder from './core/APIBuilder'

export class AlbumAPI {
    // ============= 앨범 기본 관리 =============

    /**
     * 앨범 권한 확인
     */
    static getAlbumAccess(albumId: string) {
        return APIBuilder.get(`/api/album/${albumId}/role`).requiresAuth().build().call<any>()
    }

    /**
     * 앨범 월별 데이터 조회
     */
    static getMonthlyAlbums(yearMonth?: string) {
        const url = yearMonth ? `/api/album/monthly?yearMonth=${yearMonth}` : '/api/album/monthly'

        return APIBuilder.get(url).requiresAuth().build().call<any>()
    }

    /**
     * 앨범 상세 정보 조회
     */
    static getAlbumDetail(albumId: string) {
        return APIBuilder.get(`/api/album/${albumId}`).requiresAuth().build().call<any>()
    }

    /**
     * 앨범 요약 정보 조회
     */
    static getAlbumSummary(albumId: string) {
        return APIBuilder.get(`/api/album/${albumId}/summary`).requiresAuth().build().call<any>()
    }

    /**
     * 앨범 생성
     */
    static createAlbum(albumData: any) {
        return APIBuilder.post('/api/album', albumData).requiresAuth().build().call<any>()
    }

    /**
     * 앨범 이름 수정
     */
    static updateAlbumName(albumId: string, albumName: string) {
        return APIBuilder.put(`/api/album/${albumId}`, { albumName }).requiresAuth().build().call<any>()
    }

    /**
     * 앨범 삭제
     */
    static deleteAlbum(albumId: string) {
        return APIBuilder.delete(`/api/album/${albumId}`).requiresAuth().build().call<void>()
    }

    // ============= 사진 관리 =============

    /**
     * 앨범에 사진 추가
     */
    static addPicture(albumId: number, pictureData: any) {
        return APIBuilder.post(`/api/album/${albumId}`, pictureData).requiresAuth().build().call<any>()
    }

    /**
     * PreSigned URL 발급
     */
    static getPreSignedUrl(pictures: any) {
        return APIBuilder.post('/api/presigned-url', pictures).requiresAuth().build().call<any>()
    }

    // ============= 클러스터 관리 =============

    /**
     * 클러스터 제목 변경
     */
    static updateClusterTitle(albumId: string, clusterId: string, clusterName: string) {
        return APIBuilder.patch(`/api/album/${albumId}/cluster/${clusterId}`, { clusterName })
            .requiresAuth()
            .build()
            .call<any>()
    }

    // ============= 공동 작업자 관리 =============

    /**
     * 공동 작업자 목록 조회
     */
    static getMembers(albumId: string) {
        return APIBuilder.get(`/api/album/${albumId}/members`).requiresAuth().build().call<any>()
    }

    /**
     * 공동 작업자 초대 링크 생성
     */
    static createInviteLink(albumId: string) {
        return APIBuilder.post(`/api/album/${albumId}/invite/link`, {}).requiresAuth().build().call<any>()
    }

    /**
     * 초대 확인 (공동 작업자 추가)
     */
    static confirmInvite(inviteToken: string) {
        return APIBuilder.post(`/api/album/invite?inviteToken=${inviteToken}`, {}).requiresAuth().build().call<any>()
    }

    /**
     * 공동 작업자 삭제
     */
    static removeMember(albumId: number, userId: number) {
        return APIBuilder.delete(`/api/album/${albumId}/members/${userId}`).requiresAuth().build().call<void>()
    }

    // ============= 댓글 관리 =============

    /**
     * 댓글 목록 조회
     */
    static getComments(albumId: string) {
        return APIBuilder.get(`/api/album/${albumId}/comments`).requiresAuth().build().call<any>()
    }

    /**
     * 댓글 작성
     */
    static createComment(albumId: string, comment: string) {
        return APIBuilder.post(`/api/album/${albumId}/comments`, { comments: comment })
            .requiresAuth()
            .build()
            .call<any>()
    }

    /**
     * 댓글 수정
     */
    static updateComment(albumId: string, commentId: string, comment: string) {
        return APIBuilder.put(`/api/album/${albumId}/comments/${commentId}`, { comments: comment })
            .requiresAuth()
            .build()
            .call<any>()
    }

    /**
     * 댓글 삭제
     */
    static deleteComment(albumId: string, commentId: string) {
        return APIBuilder.delete(`/api/album/${albumId}/comments/${commentId}`).requiresAuth().build().call<void>()
    }

    // ============= 좋아요 관리 =============

    /**
     * 좋아요 조회
     */
    static getLikes(albumId: string) {
        return APIBuilder.get(`/api/album/${albumId}/like`).requiresAuth().build().call<any>()
    }

    /**
     * 좋아요 토글 (추가/제거)
     */
    static toggleLike(albumId: string) {
        return APIBuilder.post(`/api/album/${albumId}/like`, {}).requiresAuth().build().call<APIResponse>()
    }
}
